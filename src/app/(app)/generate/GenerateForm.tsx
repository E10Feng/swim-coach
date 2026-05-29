'use client'

import { useSearchParams } from 'next/navigation'
import { generateSetAction } from './actions'

const ENERGY_LEVELS = [
  { value: 'easy', label: 'Easy', sub: 'Recovery day' },
  { value: 'moderate', label: 'Moderate', sub: 'Normal effort' },
  { value: 'hard', label: 'Hard', sub: 'Push it' },
] as const

export default function GenerateForm() {
  const searchParams = useSearchParams()
  const errorMsg = searchParams.get('error')
  const defaultEnergy = (searchParams.get('energy_level') ?? 'moderate') as 'easy' | 'moderate' | 'hard'

  return (
    <>
      {errorMsg && (
        <div
          className="mb-6 rounded-xl border px-4 py-3 text-sm"
          style={{ borderColor: 'var(--warning)', color: 'var(--warning)', background: 'rgba(245,158,11,0.08)' }}
        >
          {errorMsg}
        </div>
      )}

      <form action={generateSetAction} className="space-y-6">
        <div>
          <label htmlFor="duration_min" className="block text-xs font-semibold uppercase tracking-widest text-text-secondary mb-2">
            Session length (minutes)
          </label>
          <input
            id="duration_min"
            name="duration_min"
            type="number"
            min={15}
            max={120}
            step={5}
            defaultValue={searchParams.get('duration_min') ?? '45'}
            required
            className="w-full rounded-xl border bg-surface px-4 py-3 text-base text-text-primary placeholder:text-text-muted focus:outline-none transition-colors"
            style={{ borderColor: 'var(--border)', fontFamily: 'var(--font-mono)' }}
            onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
            onBlur={e => (e.target.style.borderColor = 'var(--border)')}
          />
        </div>

        <div>
          <p className="block text-xs font-semibold uppercase tracking-widest text-text-secondary mb-2">
            How do you feel today?
          </p>
          <div className="grid grid-cols-3 gap-2">
            {ENERGY_LEVELS.map(level => (
              <label key={level.value} className="relative cursor-pointer">
                <input
                  type="radio"
                  name="energy_level"
                  value={level.value}
                  defaultChecked={level.value === defaultEnergy}
                  className="peer sr-only"
                />
                <div
                  className="rounded-xl border px-3 py-3 text-center transition-all peer-checked:scale-[1.02] peer-checked:border-accent peer-checked:bg-accent/10"
                  style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
                >
                  <p className="text-sm font-semibold text-text-primary">{level.label}</p>
                  <p className="text-xs text-text-secondary mt-0.5">{level.sub}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="focus_stroke" className="block text-xs font-semibold uppercase tracking-widest text-text-secondary mb-2">
            Focus stroke <span className="normal-case font-normal text-text-muted">(optional)</span>
          </label>
          <select
            id="focus_stroke"
            name="focus_stroke"
            defaultValue={searchParams.get('focus_stroke') ?? ''}
            className="w-full rounded-xl border bg-surface px-4 py-3 text-sm text-text-primary focus:outline-none transition-colors"
            style={{ borderColor: 'var(--border)' }}
            onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
            onBlur={e => (e.target.style.borderColor = 'var(--border)')}
          >
            <option value="">No preference</option>
            <option value="freestyle">Freestyle</option>
            <option value="backstroke">Backstroke</option>
            <option value="breaststroke">Breaststroke</option>
            <option value="butterfly">Butterfly</option>
            <option value="IM">IM</option>
            <option value="mixed">Mixed</option>
          </select>
        </div>

        <div>
          <label htmlFor="energy_system" className="block text-xs font-semibold uppercase tracking-widest text-text-secondary mb-2">
            Training focus <span className="normal-case font-normal text-text-muted">(optional)</span>
          </label>
          <select
            id="energy_system"
            name="energy_system"
            defaultValue={searchParams.get('energy_system') ?? ''}
            className="w-full rounded-xl border bg-surface px-4 py-3 text-sm text-text-primary focus:outline-none transition-colors"
            style={{ borderColor: 'var(--border)' }}
            onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
            onBlur={e => (e.target.style.borderColor = 'var(--border)')}
          >
            <option value="">Let Coach Alex decide</option>
            <option value="aerobic">Aerobic — steady base</option>
            <option value="threshold">Threshold — race pace</option>
            <option value="anaerobic">Anaerobic — high intensity</option>
            <option value="speed">Speed — sprints</option>
          </select>
        </div>

        <div>
          <label htmlFor="technique_focus" className="block text-xs font-semibold uppercase tracking-widest text-text-secondary mb-2">
            Technique focus <span className="normal-case font-normal text-text-muted">(optional)</span>
          </label>
          <input
            id="technique_focus"
            name="technique_focus"
            type="text"
            placeholder="e.g. catch, flip turns, breathing"
            defaultValue={searchParams.get('technique_focus') ?? ''}
            className="w-full rounded-xl border bg-surface px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none transition-colors"
            style={{ borderColor: 'var(--border)' }}
            onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
            onBlur={e => (e.target.style.borderColor = 'var(--border)')}
          />
        </div>

        <div>
          <label htmlFor="free_text" className="block text-xs font-semibold uppercase tracking-widest text-text-secondary mb-2">
            Anything else? <span className="normal-case font-normal text-text-muted">(optional)</span>
          </label>
          <textarea
            id="free_text"
            name="free_text"
            rows={3}
            placeholder="e.g. my shoulder is a bit sore, want something fun"
            defaultValue={searchParams.get('free_text') ?? ''}
            className="w-full rounded-xl border bg-surface px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none transition-colors resize-none"
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
          Generate My Set →
        </button>
      </form>
    </>
  )
}
