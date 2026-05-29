import {
  weeklyStats,
  monthlyStats,
  consistencyScore,
  type WeeklyStats,
  type MonthlyStats,
} from '../lib/insights/aggregations'
import type { CompletedWorkout, GeneratedSet } from '../lib/types/database'

function makeWorkout(overrides: Partial<CompletedWorkout> = {}): CompletedWorkout {
  return {
    id: 'w1', user_id: 'u1', generated_set_id: 'gs1',
    completed_at: '2026-05-29T10:00:00Z',
    rating: null, notes: null, xp_earned: 10, duration_min: 45,
    ...overrides,
  }
}

function makeSet(overrides: Partial<GeneratedSet> = {}): GeneratedSet {
  return {
    id: 'gs1', user_id: 'u1', base_set_id: 'bs1',
    session_input: { duration_min: 45, energy_level: 'moderate' },
    generated_set_text: 'warmup...', coach_commentary: 'good',
    energy_system: 'aerobic', technique_tags: [], difficulty: 3,
    created_at: '2026-05-29T09:00:00Z',
    ...overrides,
  }
}

const ANCHOR = new Date('2026-05-29T23:59:59Z')

describe('weeklyStats', () => {
  it('returns zero counts when no data', () => {
    const stats = weeklyStats([], [], ANCHOR)
    expect(stats.sessionCount).toBe(0)
    expect(stats.totalVolume).toBe(0)
    expect(stats.aerobicPct).toBe(0)
    expect(stats.thresholdPct).toBe(0)
    expect(stats.anaerobicPct).toBe(0)
    expect(stats.speedPct).toBe(0)
  })

  it('counts workouts in the 7-day window', () => {
    const inWindow = makeWorkout({ completed_at: '2026-05-27T10:00:00Z' })
    const outOfWindow = makeWorkout({ id: 'w2', completed_at: '2026-05-21T10:00:00Z' })
    const stats = weeklyStats([inWindow, outOfWindow], [], ANCHOR)
    expect(stats.sessionCount).toBe(1)
  })

  it('calculates energy system percentages from matching generated sets', () => {
    const workout1 = makeWorkout({ id: 'w1', generated_set_id: 'gs1', completed_at: '2026-05-28T10:00:00Z' })
    const workout2 = makeWorkout({ id: 'w2', generated_set_id: 'gs2', completed_at: '2026-05-27T10:00:00Z' })
    const set1 = makeSet({ id: 'gs1', energy_system: 'aerobic' })
    const set2 = makeSet({ id: 'gs2', energy_system: 'threshold' })
    const stats = weeklyStats([workout1, workout2], [set1, set2], ANCHOR)
    expect(stats.aerobicPct).toBe(50)
    expect(stats.thresholdPct).toBe(50)
    expect(stats.anaerobicPct).toBe(0)
    expect(stats.speedPct).toBe(0)
  })

  it('sums duration_min for totalVolume', () => {
    const w1 = makeWorkout({ id: 'w1', completed_at: '2026-05-28T10:00:00Z', duration_min: 30 })
    const w2 = makeWorkout({ id: 'w2', completed_at: '2026-05-27T10:00:00Z', duration_min: 60 })
    const stats = weeklyStats([w1, w2], [], ANCHOR)
    expect(stats.totalVolume).toBe(90)
  })

  it('calculates techniquePct from technique_tags', () => {
    const workout = makeWorkout({ id: 'w1', generated_set_id: 'gs1', completed_at: '2026-05-28T10:00:00Z' })
    const withTechnique = makeSet({ id: 'gs1', technique_tags: ['catch', 'rotation'] })
    const stats = weeklyStats([workout], [withTechnique], ANCHOR)
    expect(stats.techniquePct).toBeGreaterThan(0)
  })
})

describe('monthlyStats', () => {
  it('returns zero counts when no data', () => {
    const stats = monthlyStats([], [], ANCHOR)
    expect(stats.sessionCount).toBe(0)
    expect(stats.totalVolume).toBe(0)
  })

  it('uses a 28-day rolling window', () => {
    const inWindow = makeWorkout({ completed_at: '2026-05-10T10:00:00Z' })
    const outOfWindow = makeWorkout({ id: 'w2', completed_at: '2026-04-30T10:00:00Z' })
    const stats = monthlyStats([inWindow, outOfWindow], [], ANCHOR)
    expect(stats.sessionCount).toBe(1)
  })
})

describe('consistencyScore', () => {
  it('returns 0 when no workouts', () => {
    expect(consistencyScore([], ANCHOR)).toBe(0)
  })

  it('returns 75 when 3 of 4 weeks have a workout', () => {
    const workouts = [
      makeWorkout({ id: 'w1', completed_at: '2026-05-28T10:00:00Z' }),
      makeWorkout({ id: 'w2', completed_at: '2026-05-21T10:00:00Z' }),
      makeWorkout({ id: 'w3', completed_at: '2026-05-14T10:00:00Z' }),
      makeWorkout({ id: 'w4', completed_at: '2026-05-07T10:00:00Z' }),
    ]
    expect(consistencyScore(workouts, ANCHOR)).toBe(75)
  })

  it('returns 25 when only one of four weeks has a workout', () => {
    const workouts = [makeWorkout({ completed_at: '2026-05-28T10:00:00Z' })]
    expect(consistencyScore(workouts, ANCHOR)).toBe(25)
  })
})

// ─── getInsightsNote ─────────────────────────────────────────────────────────

import { getInsightsNote } from '../lib/insights/coaching-notes'

describe('getInsightsNote', () => {
  const base: WeeklyStats = {
    sessionCount: 4, totalVolume: 180,
    aerobicPct: 50, thresholdPct: 25, anaerobicPct: 15, speedPct: 10, techniquePct: 50,
  }

  it('returns no-sessions message when sessionCount is 0', () => {
    expect(getInsightsNote({ ...base, sessionCount: 0 })).toContain('No sessions')
  })

  it('flags low aerobic base', () => {
    expect(getInsightsNote({ ...base, aerobicPct: 20 })).toContain('aerobic')
  })

  it('flags excessive speed work', () => {
    expect(getInsightsNote({ ...base, speedPct: 50, aerobicPct: 50 })).toContain('speed work')
  })

  it('flags low technique work', () => {
    expect(getInsightsNote({ ...base, techniquePct: 10 })).toContain('technique')
  })

  it('flags heavy threshold loading', () => {
    expect(getInsightsNote({ ...base, thresholdPct: 60, aerobicPct: 50, speedPct: 5 })).toContain('threshold')
  })

  it('returns positive message when balance is good', () => {
    expect(getInsightsNote(base)).toContain('balance')
  })
})
