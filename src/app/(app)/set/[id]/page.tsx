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

      {/* Coach speech bubble */}
      <div className="mb-6 flex gap-3 items-start">
        <div
          className="flex-shrink-0 h-11 w-11 rounded-full flex items-center justify-center text-xl border-2"
          style={{ background: 'var(--surface)', borderColor: 'var(--coral)' }}
        >
          🏊
        </div>
        <div className="relative flex-1">
          <div
            className="absolute -left-2.5 top-4 w-3 h-3 rotate-45"
            style={{
              background: 'rgba(255,107,107,0.1)',
              borderLeft: '1px solid rgba(255,107,107,0.25)',
              borderBottom: '1px solid rgba(255,107,107,0.25)',
            }}
          />
          <div
            className="rounded-2xl px-4 py-3"
            style={{
              background: 'rgba(255,107,107,0.08)',
              border: '1px solid rgba(255,107,107,0.25)',
            }}
          >
            <p className="text-xs font-bold mb-1" style={{ color: 'var(--coral)' }}>
              {COACH_NAME}
            </p>
            <p className="text-sm text-text-primary leading-relaxed">{genSet.coach_commentary}</p>
          </div>
        </div>
      </div>

      {/* Set text */}
      <section className="mb-6">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <h1
            className="text-xl font-bold text-text-primary"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            TODAY&apos;S SET
          </h1>
          <span
            className="rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize"
            style={{ background: 'rgba(0,229,255,0.1)', color: 'var(--accent)', border: '1px solid rgba(0,229,255,0.2)' }}
          >
            {genSet.energy_system}
          </span>
          {(genSet.technique_tags ?? []).map((tag: string) => (
            <span
              key={tag}
              className="rounded-full px-2.5 py-0.5 text-xs font-medium"
              style={{ background: 'var(--surface)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
            >
              {tag}
            </span>
          ))}
        </div>
        <pre
          className="whitespace-pre-wrap rounded-2xl p-5 text-sm leading-relaxed"
          style={{
            fontFamily: 'var(--font-mono)',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            color: 'var(--text-primary)',
          }}
        >
          {genSet.generated_set_text}
        </pre>
      </section>

      {/* Mark done form */}
      <section
        className="rounded-2xl p-5"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
      >
        <h2
          className="text-lg font-bold mb-4 text-text-primary"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Finished? Log it 🎉
        </h2>
        <form action={markDoneAction} className="space-y-4">
          <input type="hidden" name="generated_set_id" value={genSet.id} />

          <div>
            <label htmlFor="duration_min" className="block text-sm font-semibold text-text-primary mb-2">
              Actual duration <span className="font-normal text-text-muted">(optional)</span>
            </label>
            <input
              id="duration_min"
              name="duration_min"
              type="number"
              min={5}
              max={240}
              placeholder="How long did you actually swim?"
              className="w-full rounded-2xl border bg-bg px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none transition-colors"
              style={{ borderColor: 'var(--border)', fontFamily: 'var(--font-mono)' }}
              onFocus={e => (e.target.style.borderColor = 'var(--green)')}
              onBlur={e => (e.target.style.borderColor = 'var(--border)')}
            />
          </div>

          {/* Rating cards */}
          <div>
            <p className="text-sm font-semibold text-text-primary mb-2">How was it?</p>
            <div className="flex gap-3">
              <label className="flex-1 cursor-pointer relative">
                <input type="radio" name="rating" value="thumbs_up" className="peer sr-only" />
                <div className="btn-game btn-game-surface rounded-2xl py-4 text-center peer-checked:scale-[1.04]">
                  <div className="text-3xl mb-1">👍</div>
                  <p className="text-xs text-text-secondary">Great!</p>
                </div>
                <div
                  className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 peer-checked:opacity-100 transition-opacity"
                  style={{ border: '2px solid var(--green)', boxShadow: '0 0 12px rgba(88,204,2,0.2)' }}
                />
              </label>
              <label className="flex-1 cursor-pointer relative">
                <input type="radio" name="rating" value="thumbs_down" className="peer sr-only" />
                <div className="btn-game btn-game-surface rounded-2xl py-4 text-center peer-checked:scale-[1.04]">
                  <div className="text-3xl mb-1">👎</div>
                  <p className="text-xs text-text-secondary">Meh</p>
                </div>
                <div
                  className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 peer-checked:opacity-100 transition-opacity"
                  style={{ border: '2px solid var(--coral)' }}
                />
              </label>
            </div>
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-semibold text-text-primary mb-2">
              Notes <span className="font-normal text-text-muted">(optional)</span>
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={2}
              placeholder="How did it go? Any feedback for next time?"
              className="w-full rounded-2xl border bg-bg px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none transition-colors resize-none"
              style={{ borderColor: 'var(--border)' }}
              onFocus={e => (e.target.style.borderColor = 'var(--green)')}
              onBlur={e => (e.target.style.borderColor = 'var(--border)')}
            />
          </div>

          <button
            type="submit"
            className="btn-game btn-game-green w-full rounded-2xl py-5 text-xl font-extrabold"
          >
            ✓ Done — +100 XP 🎉
          </button>
        </form>
      </section>
    </main>
  )
}
