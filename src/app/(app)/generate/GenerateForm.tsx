'use client'

import { useSearchParams } from 'next/navigation'
import { generateSetAction } from './actions'

const ENERGY_LEVELS = [
  { value: 'easy',     emoji: '😌', label: 'Easy',     sub: 'Recovery day' },
  { value: 'moderate', emoji: '💪', label: 'Moderate',  sub: 'Normal effort' },
  { value: 'hard',     emoji: '🔥', label: 'Hard',      sub: 'Push it' },
] as const

export default function GenerateForm() {
  const searchParams = useSearchParams()
  const errorMsg = searchParams.get('error')
  const defaultEnergy = (searchParams.get('energy_level') ?? 'moderate') as 'easy' | 'moderate' | 'hard'

  return (
    <>
      {errorMsg && (
        <div
          className="mb-6 rounded-2xl border px-4 py-3 text-sm"
          style={{ borderColor: 'var(--warning)', color: 'var(--warning)', background: 'rgba(245,158,11,0.08)' }}
        >
          {errorMsg}
        </div>
      )}

      <form action={generateSetAction} className="space-y-5">
        {/* Duration */}
        <div>
          <label htmlFor="duration_min" className="block text-sm font-semibold text-text-primary mb-2">
            Session length
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
            className="w-full rounded-2xl border bg-surface px-4 py-3 text-lg font-bold text-text-primary focus:outline-none transition-colors"
            style={{ borderColor: 'var(--border)', fontFamily: 'var(--font-mono)' }}
            onFocus={e => (e.target.style.borderColor = 'var(--green)')}
            onBlur={e => (e.target.style.borderColor = 'var(--border)')}
          />
        </div>

        {/* Energy level — big emoji cards */}
        <div>
          <p className="text-sm font-semibold text-text-primary mb-2">How do you feel today?</p>
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
                  className="btn-game rounded-2xl px-2 py-4 text-center peer-checked:scale-[1.03]"
                  style={{
                    background: 'var(--surface)',
                    boxShadow: '0 4px 0 rgba(0,0,0,0.35)',
                  }}
                >
                  <div className="text-4xl mb-2">{level.emoji}</div>
                  <p className="text-sm font-bold text-text-primary">{level.label}</p>
                  <p className="text-xs text-text-secondary mt-0.5">{level.sub}</p>
                </div>
                {/* Green overlay when selected */}
                <div
                  className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 peer-checked:opacity-100 transition-opacity"
                  style={{ border: '2px solid var(--green)', boxShadow: '0 0 12px rgba(88,204,2,0.25)' }}
                />
              </label>
            ))}
          </div>
        </div>

        {/* Focus stroke */}
        <div>
          <label htmlFor="focus_stroke" className="block text-sm font-semibold text-text-primary mb-2">
            Focus stroke <span className="font-normal text-text-muted">(optional)</span>
          </label>
          <select
            id="focus_stroke"
            name="focus_stroke"
            defaultValue={searchParams.get('focus_stroke') ?? ''}
            className="w-full rounded-2xl border bg-surface px-4 py-3 text-sm text-text-primary focus:outline-none transition-colors"
            style={{ borderColor: 'var(--border)' }}
            onFocus={e => (e.target.style.borderColor = 'var(--green)')}
            onBlur={e => (e.target.style.borderColor = 'var(--border)')}
          >
            <option value="">No preference</option>
            <option value="freestyle">🏊 Freestyle</option>
            <option value="backstroke">🔙 Backstroke</option>
            <option value="breaststroke">🐸 Breaststroke</option>
            <option value="butterfly">🦋 Butterfly</option>
            <option value="IM">🔄 IM</option>
            <option value="mixed">🎲 Mixed</option>
          </select>
        </div>

        {/* Training focus */}
        <div>
          <label htmlFor="energy_system" className="block text-sm font-semibold text-text-primary mb-2">
            Training focus <span className="font-normal text-text-muted">(optional)</span>
          </label>
          <select
            id="energy_system"
            name="energy_system"
            defaultValue={searchParams.get('energy_system') ?? ''}
            className="w-full rounded-2xl border bg-surface px-4 py-3 text-sm text-text-primary focus:outline-none transition-colors"
            style={{ borderColor: 'var(--border)' }}
            onFocus={e => (e.target.style.borderColor = 'var(--green)')}
            onBlur={e => (e.target.style.borderColor = 'var(--border)')}
          >
            <option value="">Let Splash decide</option>
            <option value="aerobic">💨 Aerobic — steady base</option>
            <option value="threshold">⚡ Threshold — race pace</option>
            <option value="anaerobic">🔥 Anaerobic — high intensity</option>
            <option value="speed">🚀 Speed — sprints</option>
          </select>
        </div>

        {/* Technique focus */}
        <div>
          <label htmlFor="technique_focus" className="block text-sm font-semibold text-text-primary mb-2">
            Technique focus <span className="font-normal text-text-muted">(optional)</span>
          </label>
          <input
            id="technique_focus"
            name="technique_focus"
            type="text"
            placeholder="e.g. catch, flip turns, breathing"
            defaultValue={searchParams.get('technique_focus') ?? ''}
            className="w-full rounded-2xl border bg-surface px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none transition-colors"
            style={{ borderColor: 'var(--border)' }}
            onFocus={e => (e.target.style.borderColor = 'var(--green)')}
            onBlur={e => (e.target.style.borderColor = 'var(--border)')}
          />
        </div>

        {/* Notes */}
        <div>
          <label htmlFor="free_text" className="block text-sm font-semibold text-text-primary mb-2">
            Anything else? <span className="font-normal text-text-muted">(optional)</span>
          </label>
          <textarea
            id="free_text"
            name="free_text"
            rows={3}
            placeholder="e.g. my shoulder is a bit sore, want something fun"
            defaultValue={searchParams.get('free_text') ?? ''}
            className="w-full rounded-2xl border bg-surface px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none transition-colors resize-none"
            style={{ borderColor: 'var(--border)' }}
            onFocus={e => (e.target.style.borderColor = 'var(--green)')}
            onBlur={e => (e.target.style.borderColor = 'var(--border)')}
          />
        </div>

        <button
          type="submit"
          className="btn-game btn-game-green w-full rounded-2xl py-5 text-xl font-extrabold"
        >
          Generate My Set ⚡
        </button>
      </form>
    </>
  )
}
