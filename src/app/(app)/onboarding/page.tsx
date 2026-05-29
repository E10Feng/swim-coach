'use client'

import { useState } from 'react'
import { saveProfile } from './actions'
import type { ExperienceLevel, Goal, PoolFormat } from '@/lib/types/database'
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
  strokes: string[]
  session_duration_min: number
  days_per_week: number
  pool_format: PoolFormat | ''
  physical_notes: string
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
    // on success, redirect happens server-side — no client action needed
  }

  if (step === 'experience') {
    const options: { label: string; value: ExperienceLevel }[] = [
      { label: 'Never swam competitively', value: 'beginner' },
      { label: 'Recreational adult', value: 'recreational' },
      { label: 'Masters competitor', value: 'masters' },
      { label: 'Former competitive swimmer', value: 'former_competitive' },
    ]
    return (
      <div>
        <h1>What kind of swimmer are you?</h1>
        {options.map(o => (
          <button
            key={o.value}
            onClick={() => {
              setState(s => ({ ...s, experience_level: o.value }))
              advance()
            }}
          >
            {o.label}
          </button>
        ))}
      </div>
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
      <div>
        <h1>What&apos;s your main goal?</h1>
        {options.map(o => (
          <button
            key={o.value}
            onClick={() => {
              setState(s => ({ ...s, goal: o.value }))
              advance()
            }}
          >
            {o.label}
          </button>
        ))}
      </div>
    )
  }

  if (step === 'strokes') {
    const options = [
      { label: 'Freestyle', value: 'freestyle' },
      { label: 'Backstroke', value: 'backstroke' },
      { label: 'Breaststroke', value: 'breaststroke' },
      { label: 'Butterfly', value: 'butterfly' },
    ]
    return (
      <div>
        <h1>What strokes do you swim?</h1>
        {options.map(o => (
          <label key={o.value}>
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
            />
            {o.label}
          </label>
        ))}
        <button onClick={advance} disabled={state.strokes.length === 0}>
          Continue
        </button>
      </div>
    )
  }

  if (step === 'duration') {
    return (
      <div>
        <h1>How long are your typical sessions?</h1>
        {[30, 45, 60, 75].map(min => (
          <button
            key={min}
            onClick={() => {
              setState(s => ({ ...s, session_duration_min: min }))
              advance()
            }}
          >
            {min} min
          </button>
        ))}
      </div>
    )
  }

  if (step === 'days') {
    return (
      <div>
        <h1>How often can you swim?</h1>
        {[2, 3, 4, 5].map(days => (
          <button
            key={days}
            onClick={() => {
              setState(s => ({ ...s, days_per_week: days }))
              advance()
            }}
          >
            {days}x / week
          </button>
        ))}
      </div>
    )
  }

  if (step === 'pool_format') {
    const options: { label: string; value: PoolFormat }[] = [
      { label: '25 yards', value: 'yards_25' },
      { label: '25 meters', value: 'meters_25' },
      { label: '50 meters', value: 'meters_50' },
    ]
    return (
      <div>
        <h1>What kind of pool do you swim in?</h1>
        {options.map(o => (
          <button
            key={o.value}
            onClick={() => {
              setState(s => ({ ...s, pool_format: o.value }))
              advance()
            }}
          >
            {o.label}
          </button>
        ))}
      </div>
    )
  }

  if (step === 'notes') {
    return (
      <div>
        <h1>Anything I should know?</h1>
        <p>Optional: injuries, limitations, or anything else relevant.</p>
        <textarea
          placeholder="e.g. bad left shoulder, learning butterfly"
          value={state.physical_notes}
          onChange={e => setState(s => ({ ...s, physical_notes: e.target.value }))}
        />
        <button onClick={advance}>
          {state.physical_notes.trim() ? 'Continue' : 'Skip'}
        </button>
      </div>
    )
  }

  // meet_coach
  return (
    <div>
      <h1>Meet {COACH_NAME}</h1>
      <p>{COACH_INTRO}</p>
      {error && <p role="alert">{error}</p>}
      <button onClick={handleFinish} disabled={loading}>
        {loading ? 'Setting up...' : "Let's swim!"}
      </button>
    </div>
  )
}
