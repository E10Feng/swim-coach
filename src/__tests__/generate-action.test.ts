/**
 * @jest-environment node
 */
import { checkFreemiumGate, buildGeneratedSetRecord } from '@/app/(app)/generate/helpers'

describe('checkFreemiumGate', () => {
  const baseProgress = {
    user_id: 'u1',
    current_streak: 0,
    longest_streak: 0,
    total_xp: 0,
    level: 'Lap Swimmer',
    last_completed_at: null,
    sets_generated_this_week: 0,
    week_start: new Date().toISOString(),
    subscription_status: 'free' as const,
  }

  it('allows free user under limit', () => {
    const result = checkFreemiumGate({ ...baseProgress, sets_generated_this_week: 2 })
    expect(result.allowed).toBe(true)
  })

  it('blocks free user at limit', () => {
    const result = checkFreemiumGate({ ...baseProgress, sets_generated_this_week: 3 })
    expect(result.allowed).toBe(false)
    expect(result.reason).toMatch(/upgrade/i)
  })

  it('allows paid user regardless of count', () => {
    const result = checkFreemiumGate({
      ...baseProgress,
      sets_generated_this_week: 10,
      subscription_status: 'paid' as const,
    })
    expect(result.allowed).toBe(true)
  })

  it('resets count when week_start is more than 7 days ago', () => {
    const oldWeekStart = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()
    const result = checkFreemiumGate({
      ...baseProgress,
      sets_generated_this_week: 3,
      week_start: oldWeekStart,
    })
    expect(result.allowed).toBe(true)
    expect(result.weekReset).toBe(true)
  })
})

describe('buildGeneratedSetRecord', () => {
  it('builds a valid record shape', () => {
    const record = buildGeneratedSetRecord({
      userId: 'user-1',
      baseSetId: 'set-1',
      sessionInput: { duration_min: 45, energy_level: 'moderate' },
      adaptedSetText: 'some set',
      coachCommentary: 'good job',
      energySystem: 'aerobic',
      techniqueTags: ['catch'],
      difficulty: 2,
    })
    expect(record).toMatchObject({
      user_id: 'user-1',
      base_set_id: 'set-1',
      generated_set_text: 'some set',
      coach_commentary: 'good job',
      energy_system: 'aerobic',
      technique_tags: ['catch'],
      difficulty: 2,
    })
    expect(record.session_input).toEqual({ duration_min: 45, energy_level: 'moderate' })
  })
})
