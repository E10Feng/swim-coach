/**
 * @jest-environment node
 */
import { calculateXP, calculateLevel, LEVELS } from '@/lib/gamification/xp'
import type { GeneratedSet } from '@/lib/types/database'

function makeSet(overrides: Partial<GeneratedSet> = {}): GeneratedSet {
  return {
    id: 'set-1',
    user_id: 'user-1',
    base_set_id: 'base-1',
    session_input: { duration_min: 45, energy_level: 'moderate' },
    generated_set_text: '',
    coach_commentary: '',
    energy_system: 'aerobic',
    technique_tags: [],
    difficulty: 2,
    created_at: new Date().toISOString(),
    ...overrides,
  }
}

describe('calculateXP', () => {
  it('returns base 100 XP for a plain set', () => {
    expect(calculateXP(makeSet(), [])).toBe(100)
  })

  it('adds +25 when difficulty > 3', () => {
    expect(calculateXP(makeSet({ difficulty: 4 }), [])).toBe(125)
  })

  it('adds +25 when technique_tags is non-empty', () => {
    expect(calculateXP(makeSet({ technique_tags: ['catch'] }), [])).toBe(125)
  })

  it('adds +50 when stroke is not in user usual strokes', () => {
    const set = makeSet({ session_input: { duration_min: 45, energy_level: 'moderate', focus_stroke: 'butterfly' } })
    expect(calculateXP(set, ['freestyle', 'backstroke'])).toBe(150)
  })

  it('does NOT add +50 when stroke is in user usual strokes', () => {
    const set = makeSet({ session_input: { duration_min: 45, energy_level: 'moderate', focus_stroke: 'freestyle' } })
    expect(calculateXP(set, ['freestyle'])).toBe(100)
  })

  it('stacks all bonuses', () => {
    const set = makeSet({
      difficulty: 5,
      technique_tags: ['rotation'],
      session_input: { duration_min: 60, energy_level: 'hard', focus_stroke: 'breaststroke' },
    })
    expect(calculateXP(set, ['freestyle'])).toBe(200)
  })
})

describe('calculateLevel', () => {
  it('returns Lap Swimmer at 0 XP', () => { expect(calculateLevel(0)).toBe('Lap Swimmer') })
  it('returns Lap Swimmer just below 500', () => { expect(calculateLevel(499)).toBe('Lap Swimmer') })
  it('returns Distance Swimmer at 500 XP', () => { expect(calculateLevel(500)).toBe('Distance Swimmer') })
  it('returns Race Pace at 1500 XP', () => { expect(calculateLevel(1500)).toBe('Race Pace') })
  it('returns Black Line at 3500 XP', () => { expect(calculateLevel(3500)).toBe('Black Line') })
  it('returns Champion at 7500 XP', () => { expect(calculateLevel(7500)).toBe('Champion') })
  it('returns Champion above 7500 XP', () => { expect(calculateLevel(99999)).toBe('Champion') })
})

describe('LEVELS export', () => {
  it('has 5 levels in ascending minXp order', () => {
    expect(LEVELS).toHaveLength(5)
    for (let i = 1; i < LEVELS.length; i++) {
      expect(LEVELS[i].minXp).toBeGreaterThan(LEVELS[i - 1].minXp)
    }
  })
})

import { updateStreak } from '@/lib/gamification/streaks'
import type { UserProgress } from '@/lib/types/database'

function makeProgress(overrides: Partial<UserProgress> = {}): UserProgress {
  return {
    user_id: 'user-1',
    current_streak: 0,
    longest_streak: 0,
    total_xp: 0,
    level: 'Lap Swimmer',
    last_completed_at: null,
    sets_generated_this_week: 0,
    week_start: '2026-05-25',
    ...overrides,
  }
}

describe('updateStreak', () => {
  const daysPerWeek = 3

  it('increments streak when weekly goal is first met (3rd completion)', () => {
    const progress = makeProgress({ sets_generated_this_week: 2, week_start: '2026-05-25' })
    const completedAt = new Date('2026-05-27T10:00:00Z')
    const result = updateStreak(progress, completedAt, daysPerWeek)
    expect(result.sets_generated_this_week).toBe(3)
    expect(result.current_streak).toBe(1)
  })

  it('does not increment streak again if goal already met this week', () => {
    const progress = makeProgress({ current_streak: 2, sets_generated_this_week: 4, week_start: '2026-05-25' })
    const completedAt = new Date('2026-05-29T10:00:00Z')
    const result = updateStreak(progress, completedAt, daysPerWeek)
    expect(result.current_streak).toBe(2)
    expect(result.sets_generated_this_week).toBe(5)
  })

  it('resets week counter when a new week starts', () => {
    const progress = makeProgress({ current_streak: 2, longest_streak: 2, sets_generated_this_week: 0, week_start: '2026-05-18' })
    const completedAt = new Date('2026-05-26T10:00:00Z')
    const result = updateStreak(progress, completedAt, daysPerWeek)
    expect(result.week_start).toBe('2026-05-25')
    expect(result.sets_generated_this_week).toBe(1)
    expect(result.current_streak).toBe(2)
  })

  it('resets streak to 0 when a week is skipped', () => {
    const progress = makeProgress({ current_streak: 5, longest_streak: 5, sets_generated_this_week: 0, week_start: '2026-05-11' })
    const completedAt = new Date('2026-05-26T10:00:00Z')
    const result = updateStreak(progress, completedAt, daysPerWeek)
    expect(result.current_streak).toBe(0)
    expect(result.week_start).toBe('2026-05-25')
    expect(result.sets_generated_this_week).toBe(1)
  })

  it('updates longest_streak when current exceeds it', () => {
    const progress = makeProgress({ current_streak: 3, longest_streak: 3, sets_generated_this_week: 2, week_start: '2026-05-25' })
    const completedAt = new Date('2026-05-28T10:00:00Z')
    const result = updateStreak(progress, completedAt, daysPerWeek)
    expect(result.current_streak).toBe(4)
    expect(result.longest_streak).toBe(4)
  })
})
