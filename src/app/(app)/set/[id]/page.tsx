import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { GeneratedSet } from '@/lib/types/database'
import { COACH_NAME } from '@/lib/coach'
import { markDoneAction } from './actions'

interface SetPageProps {
  params: Promise<{ id: string }>
}

export default async function SetPage({ params }: SetPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect('/login')
  }

  const { data, error } = await supabase
    .from('generated_sets')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error || !data) {
    notFound()
  }

  const genSet = data as GeneratedSet

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <section className="mb-6 rounded-lg bg-blue-50 border border-blue-100 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-blue-500 mb-1">
          {COACH_NAME} says
        </p>
        <p className="text-sm text-blue-900">{genSet.coach_commentary}</p>
      </section>

      <section className="mb-8">
        <h1 className="text-xl font-bold mb-3">Today&apos;s Set</h1>
        <pre className="whitespace-pre-wrap rounded-lg bg-gray-50 border border-gray-200 p-4 text-sm font-mono leading-relaxed">
          {genSet.generated_set_text}
        </pre>
        <div className="mt-2 flex flex-wrap gap-2">
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600 capitalize">
            {genSet.energy_system}
          </span>
          {(genSet.technique_tags ?? []).map((tag: string) => (
            <span key={tag} className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
              {tag}
            </span>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-3">Finished your workout?</h2>
        <form action={markDoneAction} className="space-y-4">
          <input type="hidden" name="generated_set_id" value={genSet.id} />

          <div>
            <label htmlFor="duration_min" className="block text-sm font-medium mb-1">
              Actual duration (minutes) <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              id="duration_min"
              name="duration_min"
              type="number"
              min={5}
              max={240}
              placeholder="How long did you actually swim?"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">How was it?</label>
            <div className="flex gap-3">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="radio" name="rating" value="thumbs_up" className="accent-blue-600" />
                <span className="text-sm">👍 Good</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="radio" name="rating" value="thumbs_down" className="accent-blue-600" />
                <span className="text-sm">👎 Not great</span>
              </label>
            </div>
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium mb-1">
              Notes <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={2}
              placeholder="How did it go? Any feedback for next time?"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-md bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
          >
            Mark as Done — Earn 100 XP
          </button>
        </form>
      </section>
    </main>
  )
}
