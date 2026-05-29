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
      <section
        className="mb-6 rounded-xl border p-5"
        style={{ background: 'rgba(0,229,255,0.05)', borderColor: 'var(--accent)' }}
      >
        <p
          className="text-xs font-semibold uppercase tracking-widest mb-2"
          style={{ color: 'var(--accent)' }}
        >
          {COACH_NAME} says
        </p>
        <p className="text-sm text-text-primary leading-relaxed">{genSet.coach_commentary}</p>
      </section>

      <section className="mb-8">
        <h1
          className="text-xl font-bold mb-4 text-text-primary"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          TODAY&apos;S SET
        </h1>
        <pre
          className="whitespace-pre-wrap rounded-xl border p-5 text-sm leading-relaxed"
          style={{
            fontFamily: 'var(--font-mono)',
            background: 'var(--surface)',
            borderColor: 'var(--border)',
            color: 'var(--text-primary)',
          }}
        >
          {genSet.generated_set_text}
        </pre>
        <div className="mt-3 flex flex-wrap gap-2">
          <span
            className="rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize"
            style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
          >
            {genSet.energy_system}
          </span>
          {(genSet.technique_tags ?? []).map((tag: string) => (
            <span
              key={tag}
              className="rounded-full border px-2.5 py-0.5 text-xs font-medium"
              style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
            >
              {tag}
            </span>
          ))}
        </div>
      </section>

      <section
        className="rounded-xl border p-6"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
      >
        <h2
          className="text-lg font-bold mb-4 text-text-primary"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          FINISHED YOUR WORKOUT?
        </h2>
        <form action={markDoneAction} className="space-y-5">
          <input type="hidden" name="generated_set_id" value={genSet.id} />

          <div>
            <label htmlFor="duration_min" className="block text-xs font-semibold uppercase tracking-widest text-text-secondary mb-2">
              Actual duration (minutes) <span className="normal-case font-normal text-text-muted">(optional)</span>
            </label>
            <input
              id="duration_min"
              name="duration_min"
              type="number"
              min={5}
              max={240}
              placeholder="How long did you actually swim?"
              className="w-full rounded-xl border bg-bg px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none transition-colors"
              style={{ borderColor: 'var(--border)', fontFamily: 'var(--font-mono)' }}
              onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
              onBlur={e => (e.target.style.borderColor = 'var(--border)')}
            />
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-text-secondary mb-3">How was it?</p>
            <div className="flex gap-3">
              <label className="flex-1 cursor-pointer">
                <input type="radio" name="rating" value="thumbs_up" className="peer sr-only" />
                <div
                  className="rounded-xl border py-3 text-center text-sm transition-all peer-checked:border-accent peer-checked:bg-accent/10"
                  style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}
                >
                  <span className="mr-1.5">👍</span>
                  <span className="text-text-secondary">Good</span>
                </div>
              </label>
              <label className="flex-1 cursor-pointer">
                <input type="radio" name="rating" value="thumbs_down" className="peer sr-only" />
                <div
                  className="rounded-xl border py-3 text-center text-sm transition-all peer-checked:border-accent peer-checked:bg-accent/10"
                  style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}
                >
                  <span className="mr-1.5">👎</span>
                  <span className="text-text-secondary">Not great</span>
                </div>
              </label>
            </div>
          </div>

          <div>
            <label htmlFor="notes" className="block text-xs font-semibold uppercase tracking-widest text-text-secondary mb-2">
              Notes <span className="normal-case font-normal text-text-muted">(optional)</span>
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={2}
              placeholder="How did it go? Any feedback for next time?"
              className="w-full rounded-xl border bg-bg px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none transition-colors resize-none"
              style={{ borderColor: 'var(--border)' }}
              onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
              onBlur={e => (e.target.style.borderColor = 'var(--border)')}
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-full py-3.5 text-base font-semibold text-bg transition-all hover:scale-[1.02]"
            style={{ background: 'var(--accent)', boxShadow: '0 0 24px rgba(0,229,255,0.2)' }}
          >
            Mark as Done — Earn 100 XP
          </button>
        </form>
      </section>
    </main>
  )
}
