/**
 * @jest-environment node
 */
import { saveProfile } from '../app/(app)/onboarding/actions'

const mockUpsert = jest.fn()
const mockGetUser = jest.fn()
const mockFrom = jest.fn()

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn().mockImplementation(async () => ({
    auth: { getUser: (...args: unknown[]) => mockGetUser(...args) },
    from: (...args: unknown[]) => {
      mockFrom(...args)
      return { upsert: (...a: unknown[]) => mockUpsert(...a) }
    },
  })),
}))

jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}))

describe('saveProfile', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUpsert.mockResolvedValue({ error: null })
  })

  it('upserts profile for authenticated user', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-123' } } })

    await saveProfile({
      experience_level: 'recreational',
      goal: 'fitness',
      strokes: ['freestyle'],
      session_duration_min: 45,
      days_per_week: 3,
      pool_format: 'yards_25',
    })

    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: 'user-123',
        experience_level: 'recreational',
        goal: 'fitness',
        strokes: ['freestyle'],
        session_duration_min: 45,
        days_per_week: 3,
        pool_format: 'yards_25',
        physical_notes: null,
      })
    )
    expect(mockFrom).toHaveBeenCalledWith('user_profiles')
    const { redirect } = require('next/navigation')
    expect(redirect).toHaveBeenCalledWith('/dashboard')
  })

  it('returns error when not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })

    const result = await saveProfile({
      experience_level: 'recreational',
      goal: 'fitness',
      strokes: ['freestyle'],
      session_duration_min: 45,
      days_per_week: 3,
      pool_format: 'yards_25',
    })

    expect(result).toEqual({ error: 'Not authenticated' })
    expect(mockUpsert).not.toHaveBeenCalled()
  })

  it('returns error when upsert fails', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-123' } } })
    mockUpsert.mockResolvedValue({ error: { message: 'DB error' } })

    const result = await saveProfile({
      experience_level: 'recreational',
      goal: 'fitness',
      strokes: ['freestyle'],
      session_duration_min: 45,
      days_per_week: 3,
      pool_format: 'yards_25',
    })

    expect(result).toEqual({ error: 'DB error' })
  })
})
