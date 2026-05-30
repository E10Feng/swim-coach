/**
 * @jest-environment node
 */
import { buildCompletedWorkoutRecord, calculateXp } from '@/app/(app)/set/[id]/helpers'

describe('calculateXp', () => {
  it('returns 100 XP for a standard completion', () => {
    expect(calculateXp({ difficulty: 3 })).toBe(100)
  })

  it('returns 100 XP regardless of difficulty (basic implementation)', () => {
    expect(calculateXp({ difficulty: 1 })).toBe(100)
    expect(calculateXp({ difficulty: 5 })).toBe(100)
  })
})

describe('buildCompletedWorkoutRecord', () => {
  it('builds a valid record with required fields', () => {
    const record = buildCompletedWorkoutRecord({
      userId: 'u1',
      generatedSetId: 'gs-1',
      xpEarned: 100,
      durationMin: 45,
    })
    expect(record).toMatchObject({
      user_id: 'u1',
      generated_set_id: 'gs-1',
      xp_earned: 100,
      duration_min: 45,
      rating: null,
      notes: null,
    })
    expect(record.completed_at).toBeDefined()
  })

  it('accepts optional rating and notes', () => {
    const record = buildCompletedWorkoutRecord({
      userId: 'u1',
      generatedSetId: 'gs-1',
      xpEarned: 100,
      durationMin: null,
      rating: 'thumbs_up',
      notes: 'felt great',
    })
    expect(record.rating).toBe('thumbs_up')
    expect(record.notes).toBe('felt great')
    expect(record.duration_min).toBeNull()
  })
})
