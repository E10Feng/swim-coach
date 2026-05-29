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
