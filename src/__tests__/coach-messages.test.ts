/**
 * @jest-environment node
 */
import { getDashboardMessage } from '@/lib/gamification/coach-messages'
import type { CompletedWorkout, GeneratedSet, UserProfile } from '@/lib/types/database'

function makeWorkout(overrides: Partial<CompletedWorkout> = {}): CompletedWorkout {
  return {
    id: 'w-1', user_id: 'u-1', generated_set_id: 'gs-1',
    completed_at: new Date().toISOString(),
    rating: null, notes: null, xp_earned: 100, duration_min: 45,
    ...overrides,
  }
}

function makeSet(overrides: Partial<GeneratedSet> = {}): GeneratedSet {
  return {
    id: 'gs-1', user_id: 'u-1', base_set_id: 'base-1',
    session_input: { duration_min: 45, energy_level: 'moderate' },
    generated_set_text: '', coach_commentary: '',
    energy_system: 'aerobic', technique_tags: [], difficulty: 2,
    created_at: new Date().toISOString(),
    ...overrides,
  }
}

const baseProfile: UserProfile = {
  user_id: 'u-1', experience_level: 'recreational', goal: 'fitness',
  strokes: ['freestyle'], session_duration_min: 45, days_per_week: 3,
  pool_format: 'yards_25', physical_notes: null, subscription_status: 'free',
  stripe_customer_id: null, updated_at: new Date().toISOString(),
}

describe('getDashboardMessage', () => {
  it('returns default message when no workouts', () => {
    expect(getDashboardMessage([], [], baseProfile)).toMatch(/ready for today/i)
  })

  it('suggests pace work when last 3 workouts are all aerobic', () => {
    const sets = [
      makeSet({ id: 'gs-1', energy_system: 'aerobic' }),
      makeSet({ id: 'gs-2', energy_system: 'aerobic' }),
      makeSet({ id: 'gs-3', energy_system: 'aerobic' }),
    ]
    const workouts = [
      makeWorkout({ generated_set_id: 'gs-1' }),
      makeWorkout({ generated_set_id: 'gs-2' }),
      makeWorkout({ generated_set_id: 'gs-3' }),
    ]
    expect(getDashboardMessage(workouts, sets, baseProfile)).toMatch(/pace/i)
  })

  it('suggests technique work when no technique sets in last 10 days', () => {
    const elevenDaysAgo = new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString()
    const sets = [
      makeSet({ id: 'gs-old', technique_tags: ['catch'], energy_system: 'aerobic' }),
      makeSet({ id: 'gs-recent', technique_tags: [], energy_system: 'aerobic' }),
    ]
    const workouts = [
      makeWorkout({ generated_set_id: 'gs-old', completed_at: elevenDaysAgo }),
      makeWorkout({ generated_set_id: 'gs-recent', completed_at: new Date().toISOString() }),
    ]
    expect(getDashboardMessage(workouts, sets, baseProfile)).toMatch(/stroke|technique/i)
  })

  it('returns inactive message when no workout in 5+ days', () => {
    const sixDaysAgo = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString()
    const sets = [makeSet({ id: 'gs-1', energy_system: 'aerobic' })]
    const workouts = [makeWorkout({ generated_set_id: 'gs-1', completed_at: sixDaysAgo })]
    expect(getDashboardMessage(workouts, sets, baseProfile)).toMatch(/been a while|back in/i)
  })

  it('inactive rule takes priority over pace rule', () => {
    const sixDaysAgo = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString()
    const sets = [
      makeSet({ id: 'gs-1', energy_system: 'aerobic' }),
      makeSet({ id: 'gs-2', energy_system: 'aerobic' }),
      makeSet({ id: 'gs-3', energy_system: 'aerobic' }),
    ]
    const workouts = [
      makeWorkout({ generated_set_id: 'gs-1', completed_at: sixDaysAgo }),
      makeWorkout({ generated_set_id: 'gs-2', completed_at: sixDaysAgo }),
      makeWorkout({ generated_set_id: 'gs-3', completed_at: sixDaysAgo }),
    ]
    expect(getDashboardMessage(workouts, sets, baseProfile)).toMatch(/been a while|back in/i)
  })

  it('pace-work rule takes priority over technique rule', () => {
    const sets = [
      makeSet({ id: 'gs-1', energy_system: 'aerobic', technique_tags: [] }),
      makeSet({ id: 'gs-2', energy_system: 'aerobic', technique_tags: [] }),
      makeSet({ id: 'gs-3', energy_system: 'aerobic', technique_tags: [] }),
    ]
    const workouts = [
      makeWorkout({ generated_set_id: 'gs-1' }),
      makeWorkout({ generated_set_id: 'gs-2' }),
      makeWorkout({ generated_set_id: 'gs-3' }),
    ]
    expect(getDashboardMessage(workouts, sets, baseProfile)).toMatch(/pace/i)
  })
})
