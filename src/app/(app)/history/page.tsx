import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { CompletedWorkout, GeneratedSet } from '@/lib/types/database'

export default async function HistoryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('subscription_status')
    .eq('user_id', user.id)
    .single()

  const isPaid = profile?.subscription_status === 'paid'

  let query = supabase
    .from('completed_workouts')
    .select('*')
    .eq('user_id', user.id)
    .order('completed_at', { ascending: false })

  if (!isPaid) {
    const cutoff = new Date()
    cutoff.setUTCDate(cutoff.getUTCDate() - 28)
    query = query.gte('completed_at', cutoff.toISOString())
  }

  const { data: workoutsRaw } = await query
  const workouts: CompletedWorkout[] = workoutsRaw ?? []

  const setIds = [...new Set(workouts.map(w => w.generated_set_id))]
  let generatedSets: GeneratedSet[] = []
  if (setIds.length > 0) {
    const { data: setsRaw } = await supabase
      .from('generated_sets')
      .select('id, energy_system, technique_tags, difficulty')
      .in('id', setIds)
    generatedSets = (setsRaw ?? []) as GeneratedSet[]
  }
  const setMap = new Map(generatedSets.map(s => [s.id, s]))

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Workout History</h1>
        {!isPaid && (
          <span className="text-xs text-gray-500">
            Showing last 4 weeks.{' '}
            <a href="/profile" className="text-blue-600 hover:underline">Upgrade for full history</a>
          </span>
        )}
      </div>

      {workouts.length === 0 && (
        <p className="text-gray-500 text-sm">No workouts logged yet. Complete a set to see your history here.</p>
      )}

      <ul className="space-y-3">
        {workouts.map(w => {
          const gs = setMap.get(w.generated_set_id)
          const dateStr = new Date(w.completed_at).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric',
          })
          return (
            <li key={w.id} className="rounded-2xl border border-gray-100 bg-white px-5 py-4 flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-900">{dateStr}</span>
                {w.rating && (
                  <span className="text-lg" title={w.rating === 'thumbs_up' ? 'Thumbs up' : 'Thumbs down'}>
                    {w.rating === 'thumbs_up' ? '👍' : '👎'}
                  </span>
                )}
              </div>
              <div className="flex gap-4 text-xs text-gray-500">
                {w.duration_min && <span>{w.duration_min} min</span>}
                {gs && <span className="capitalize">{gs.energy_system}</span>}
                <span>{w.xp_earned} XP</span>
              </div>
              {w.notes && <p className="text-xs text-gray-600 mt-1">{w.notes}</p>}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
