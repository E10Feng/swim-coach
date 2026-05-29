import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { weeklyStats, monthlyStats } from '@/lib/insights/aggregations'
import { getInsightsNote } from '@/lib/insights/coaching-notes'
import type { CompletedWorkout, GeneratedSet } from '@/lib/types/database'

export default async function InsightsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('subscription_status')
    .eq('user_id', user.id)
    .single()

  const isPaid = profile?.subscription_status === 'paid'

  const cutoff = new Date()
  cutoff.setUTCDate(cutoff.getUTCDate() - 28)

  const { data: workoutsRaw } = await supabase
    .from('completed_workouts')
    .select('*')
    .eq('user_id', user.id)
    .gte('completed_at', cutoff.toISOString())
    .order('completed_at', { ascending: false })

  const workouts: CompletedWorkout[] = workoutsRaw ?? []

  const setIds = [...new Set(workouts.map(w => w.generated_set_id))]
  let generatedSets: GeneratedSet[] = []
  if (setIds.length > 0) {
    const { data: setsRaw } = await supabase
      .from('generated_sets')
      .select('*')
      .in('id', setIds)
    generatedSets = setsRaw ?? []
  }

  const anchor = new Date()
  const weekly = weeklyStats(workouts, generatedSets, anchor)
  const monthly = monthlyStats(workouts, generatedSets, anchor)
  const note = getInsightsNote(weekly)

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
      <h1 className="text-2xl font-bold">Training Insights</h1>

      <div className="rounded-xl bg-blue-50 border border-blue-100 px-5 py-4">
        <p className="text-sm text-blue-800">{note}</p>
      </div>

      <div className={isPaid ? '' : 'relative'}>
        {!isPaid && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-2xl bg-white/60 backdrop-blur-sm">
            <p className="text-base font-semibold text-gray-900 mb-3">Unlock insights</p>
            <p className="text-sm text-gray-600 mb-4 text-center max-w-xs">
              Upgrade to see your full training balance, monthly trends, and consistency score.
            </p>
            <a
              href="/profile"
              className="rounded-full bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Upgrade to Pro — $12/mo
            </a>
          </div>
        )}

        <div className={isPaid ? '' : 'pointer-events-none select-none blur-sm'}>
          <section>
            <h2 className="text-lg font-semibold mb-3">This week</h2>
            <div className="grid grid-cols-2 gap-3">
              <StatCard label="Sessions" value={String(weekly.sessionCount)} />
              <StatCard label="Volume (min)" value={String(weekly.totalVolume)} />
              <StatCard label="Aerobic" value={`${weekly.aerobicPct}%`} />
              <StatCard label="Threshold" value={`${weekly.thresholdPct}%`} />
              <StatCard label="Anaerobic" value={`${weekly.anaerobicPct}%`} />
              <StatCard label="Speed" value={`${weekly.speedPct}%`} />
              <StatCard label="Technique sets" value={`${weekly.techniquePct}%`} />
            </div>
          </section>

          <section className="mt-8">
            <h2 className="text-lg font-semibold mb-3">Last 4 weeks</h2>
            <div className="grid grid-cols-2 gap-3">
              <StatCard label="Sessions" value={String(monthly.sessionCount)} />
              <StatCard label="Volume (min)" value={String(monthly.totalVolume)} />
              <StatCard label="Aerobic" value={`${monthly.aerobicPct}%`} />
              <StatCard label="Threshold" value={`${monthly.thresholdPct}%`} />
              <StatCard label="Anaerobic" value={`${monthly.anaerobicPct}%`} />
              <StatCard label="Speed" value={`${monthly.speedPct}%`} />
              <StatCard label="Consistency" value={`${monthly.consistencyScore}%`} highlight />
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-xl border px-4 py-3 ${highlight ? 'border-blue-200 bg-blue-50' : 'border-gray-100 bg-gray-50'}`}>
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-xl font-bold text-gray-900">{value}</p>
    </div>
  )
}
