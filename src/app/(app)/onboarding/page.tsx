'use client'

import { useState } from 'react'
import { saveProfile } from './actions'
import type { ExperienceLevel, Goal, PoolFormat, Stroke } from '@/lib/types/database'
import { COACH_NAME, COACH_INTRO } from '@/lib/coach'

type QuizStep =
  | 'experience'
  | 'goal'
  | 'strokes'
  | 'duration'
  | 'days'
  | 'pool_format'
  | 'notes'
  | 'meet_coach'

const STEPS: QuizStep[] = [
  'experience', 'goal', 'strokes', 'duration', 'days', 'pool_format', 'notes', 'meet_coach',
]

interface QuizState {
  experience_level: ExperienceLevel | ''
  goal: Goal | ''
  strokes: Stroke[]
  session_duration_min: number
  days_per_week: number
  pool_format: PoolFormat | ''
  physical_notes: string
}

function QuizLayout({ stepIndex, children }: { stepIndex: number; children: React.ReactNode }) {
  const quizCount = STEPS.length - 1 // exclude meet_coach
  return (
    <div className="flex min-h-screen flex-col bg-bg px-4 py-12">
      <div className="flex justify-center gap-1.5 mb-12">
        {Array.from({ length: quizCount }).map((_, i) => (
          <span
            key={i}
            className="h-1.5 rounded-full transition-all duration-300"
            style={{
              width: i === stepIndex ? '24px' : '6px',
              background: i <= stepIndex ? 'var(--accent)' : 'var(--surface-elevated, #132840)',
            }}
          />
        ))}
      </div>
      <div className="mx-auto w-full max-w-lg flex-1 flex flex-col">
        {children}
      </div>
    </div>
  )
}

function QuizQuestion({ text }: { text: string }) {
  return (
    <h1
      className="text-3xl font-bold text-text-primary mb-8 leading-tight"
      style={{ fontFamily: 'var(--font-display)' }}
    >
      {text.toUpperCase()}
    </h1>
  )
}

function OptionCard({ label, selected, onClick }: { label: string; selected?: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full rounded-xl border px-5 py-4 text-left text-base font-medium text-text-primary transition-all hover:scale-[1.01]"
      style={{
        background: selected ? 'rgba(0,229,255,0.08)' : 'var(--surface)',
        borderColor: selected ? 'var(--accent)' : 'var(--border)',
        color: selected ? 'var(--accent)' : 'var(--text-primary)',
      }}
    >
      {label}
    </button>
  )
}

export default function OnboardingPage() {
  const [stepIndex, setStepIndex] = useState(0)
  const [state, setState] = useState<QuizState>({
    experience_level: '',
    goal: '',
    strokes: [],
    session_duration_min: 45,
    days_per_week: 3,
    pool_format: '',
    physical_notes: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const step = STEPS[stepIndex]

  function advance() {
    setStepIndex(i => i + 1)
  }

  async function handleFinish() {
    setLoading(true)
    setError(null)
    const result = await saveProfile({
      experience_level: state.experience_level as ExperienceLevel,
      goal: state.goal as Goal,
      strokes: state.strokes,
      session_duration_min: state.session_duration_min,
      days_per_week: state.days_per_week,
      pool_format: state.pool_format as PoolFormat,
      physical_notes: state.physical_notes || undefined,
    })
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  if (step === 'experience') {
    const options: { label: string; value: ExperienceLevel }[] = [
      { label: 'Never swam competitively', value: 'beginner' },
      { label: 'Recreational adult', value: 'recreational' },
      { label: 'Masters competitor', value: 'masters' },
      { label: 'Former competitive swimmer', value: 'former_competitive' },
    ]
    return (
      <QuizLayout stepIndex={0}>
        <QuizQuestion text="What kind of swimmer are you?" />
        <div className="space-y-3">
          {options.map(o => (
            <OptionCard
              key={o.value}
              label={o.label}
              selected={state.experience_level === o.value}
              onClick={() => { setState(s => ({ ...s, experience_level: o.value })); advance() }}
            />
          ))}
        </div>
      </QuizLayout>
    )
  }

  if (step === 'goal') {
    const options: { label: string; value: Goal }[] = [
      { label: 'Fitness & health', value: 'fitness' },
      { label: 'Triathlon', value: 'triathlon' },
      { label: 'Get faster', value: 'get_faster' },
      { label: 'Stay consistent', value: 'consistency' },
      { label: 'Just enjoy swimming', value: 'enjoyment' },
    ]
    return (
      <QuizLayout stepIndex={1}>
        <QuizQuestion text="What's your main goal?" />
        <div className="space-y-3">
          {options.map(o => (
            <OptionCard
              key={o.value}
              label={o.label}
              selected={state.goal === o.value}
              onClick={() => { setState(s => ({ ...s, goal: o.value })); advance() }}
            />
          ))}
        </div>
      </QuizLayout>
    )
  }

  if (step === 'strokes') {
    const options: { label: string; value: Stroke }[] = [
      { label: 'Freestyle', value: 'freestyle' },
      { label: 'Backstroke', value: 'backstroke' },
      { label: 'Breaststroke', value: 'breaststroke' },
      { label: 'Butterfly', value: 'butterfly' },
    ]
    return (
      <QuizLayout stepIndex={2}>
        <QuizQuestion text="What strokes do you swim?" />
        <p className="text-sm text-text-secondary mb-6">Select all that apply</p>
        <div className="space-y-3">
          {options.map(o => (
            <label
              key={o.value}
              className="flex cursor-pointer items-center gap-4 rounded-xl border px-5 py-4 transition-all hover:scale-[1.01]"
              style={{
                background: state.strokes.includes(o.value) ? 'rgba(0,229,255,0.08)' : 'var(--surface)',
                borderColor: state.strokes.includes(o.value) ? 'var(--accent)' : 'var(--border)',
              }}
            >
              <input
                type="checkbox"
                aria-label={o.label}
                checked={state.strokes.includes(o.value)}
                onChange={e => {
                  setState(s => ({
                    ...s,
                    strokes: e.target.checked
                      ? [...s.strokes, o.value]
                      : s.strokes.filter(x => x !== o.value),
                  }))
                }}
                className="h-4 w-4"
              />
              <span className="text-base font-medium text-text-primary">{o.label}</span>
            </label>
          ))}
        </div>
        <button
          onClick={advance}
          disabled={state.strokes.length === 0}
          className="mt-6 w-full rounded-full py-3 text-sm font-semibold text-bg transition-all hover:scale-105 disabled:opacity-40 disabled:hover:scale-100"
          style={{ background: 'var(--accent)' }}
        >
          Continue
        </button>
      </QuizLayout>
    )
  }

  if (step === 'duration') {
    return (
      <QuizLayout stepIndex={3}>
        <QuizQuestion text="How long are your typical sessions?" />
        <div className="space-y-3">
          {[30, 45, 60, 75].map(min => (
            <OptionCard
              key={min}
              label={`${min} min`}
              selected={state.session_duration_min === min}
              onClick={() => { setState(s => ({ ...s, session_duration_min: min })); advance() }}
            />
          ))}
        </div>
      </QuizLayout>
    )
  }

  if (step === 'days') {
    return (
      <QuizLayout stepIndex={4}>
        <QuizQuestion text="How often can you swim?" />
        <div className="space-y-3">
          {[2, 3, 4, 5].map(days => (
            <OptionCard
              key={days}
              label={`${days}x / week`}
              selected={state.days_per_week === days}
              onClick={() => { setState(s => ({ ...s, days_per_week: days })); advance() }}
            />
          ))}
        </div>
      </QuizLayout>
    )
  }

  if (step === 'pool_format') {
    const options: { label: string; value: PoolFormat }[] = [
      { label: '25 yards', value: 'yards_25' },
      { label: '25 meters', value: 'meters_25' },
      { label: '50 meters', value: 'meters_50' },
    ]
    return (
      <QuizLayout stepIndex={5}>
        <QuizQuestion text="What kind of pool do you swim in?" />
        <div className="space-y-3">
          {options.map(o => (
            <OptionCard
              key={o.value}
              label={o.label}
              selected={state.pool_format === o.value}
              onClick={() => { setState(s => ({ ...s, pool_format: o.value })); advance() }}
            />
          ))}
        </div>
      </QuizLayout>
    )
  }

  if (step === 'notes') {
    return (
      <QuizLayout stepIndex={6}>
        <QuizQuestion text="Anything I should know?" />
        <p className="text-sm text-text-secondary mb-4">Optional — injuries, limitations, or anything relevant.</p>
        <textarea
          placeholder="e.g. bad left shoulder, learning butterfly"
          value={state.physical_notes}
          onChange={e => setState(s => ({ ...s, physical_notes: e.target.value }))}
          rows={4}
          className="w-full rounded-xl border bg-surface px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none transition-colors resize-none"
          style={{ borderColor: 'var(--border)' }}
          onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
          onBlur={e => (e.target.style.borderColor = 'var(--border)')}
        />
        <button
          onClick={advance}
          className="mt-4 w-full rounded-full py-3 text-sm font-semibold text-bg transition-all hover:scale-105"
          style={{ background: 'var(--accent)' }}
        >
          {state.physical_notes.trim() ? 'Continue' : 'Skip'}
        </button>
      </QuizLayout>
    )
  }

  if (step === 'meet_coach' || stepIndex >= STEPS.length - 1) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-bg px-4 text-center">
        <div
          className="mb-6 flex h-20 w-20 items-center justify-center rounded-full text-3xl"
          style={{
            background: 'rgba(0,229,255,0.1)',
            border: '2px solid var(--accent)',
            boxShadow: '0 0 32px rgba(0,229,255,0.2)',
          }}
        >
          🏊
        </div>
        <h1
          className="text-3xl font-bold text-text-primary mb-3"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Meet {COACH_NAME}
        </h1>
        <p className="max-w-sm text-base text-text-secondary leading-relaxed mb-8">{COACH_INTRO}</p>
        {error && (
          <p role="alert" className="mb-4 rounded-lg border px-4 py-2 text-sm" style={{ borderColor: 'var(--error)', color: 'var(--error)' }}>
            {error}
          </p>
        )}
        <button
          onClick={handleFinish}
          disabled={loading}
          className="rounded-full px-8 py-3 text-base font-semibold text-bg transition-all hover:scale-105 disabled:opacity-50"
          style={{ background: 'var(--accent)' }}
        >
          {loading ? 'Setting up…' : "Let's swim!"}
        </button>
      </div>
    )
  }

  return null
}
