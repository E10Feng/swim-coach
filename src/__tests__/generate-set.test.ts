/**
 * @jest-environment node
 */
import { generateSet } from '@/lib/ai/generate-set'
import type { UserProfile, SessionInput } from '@/lib/types/database'

jest.mock('@/lib/ai/client', () => ({
  model: {
    generateContent: jest.fn(),
  },
}))

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
}))

import { model } from '@/lib/ai/client'
import { createClient } from '@/lib/supabase/server'

const mockProfile: UserProfile = {
  user_id: 'user-123',
  experience_level: 'recreational',
  goal: 'fitness',
  strokes: ['freestyle', 'backstroke'],
  session_duration_min: 45,
  days_per_week: 3,
  pool_format: 'yards_25',
  physical_notes: null,
  subscription_status: 'free',
  stripe_customer_id: null,
  updated_at: '2026-01-01T00:00:00Z',
}

const mockSessionInput: SessionInput = {
  duration_min: 45,
  energy_system: 'aerobic',
  energy_level: 'moderate',
}

const mockSet = {
  id: 'set-abc',
  stroke: 'freestyle',
  energy_system: 'aerobic',
  technique_tags: ['catch', 'rotation'],
  estimated_duration_min: 45,
  estimated_distance_yards: 2000,
  difficulty: 2,
  pool_format: 'yards',
  set_text: '400 warm-up easy freestyle\n4x100 on 2:00 aerobic pace\n200 cool-down',
  coach_notes: 'Focus on long strokes',
  is_active: true,
  created_at: '2026-01-01T00:00:00Z',
}

function buildMockFunctionCallResponse(args: Record<string, unknown>) {
  return {
    response: {
      candidates: [{ content: { parts: [{ functionCall: { name: 'get_sets', args } }] } }],
      functionCalls: () => [{ name: 'get_sets', args }],
    },
  }
}

function buildMockTextResponse(text: string) {
  return {
    response: {
      candidates: [{ content: { parts: [{ text }] } }],
      functionCalls: () => [],
      text: () => text,
    },
  }
}

describe('generateSet', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns adapted_set_text, coach_commentary, and base_set_id on success', async () => {
    const mockSupabase = {
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        not: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        lte: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue({ data: [mockSet], error: null }),
      }),
    }
    ;(createClient as jest.Mock).mockResolvedValue(mockSupabase)

    const finalJsonText = JSON.stringify({
      adapted_set_text: '400 warm-up\n4x100 aerobic pace\n200 cool-down',
      coach_commentary: 'Good aerobic day. Keep that stroke long.',
    })

    const mockGenerateContent = model.generateContent as jest.Mock
    mockGenerateContent
      .mockResolvedValueOnce(buildMockFunctionCallResponse({ energy_system: 'aerobic', duration_min: 40, duration_max: 50 }))
      .mockResolvedValueOnce(buildMockTextResponse(finalJsonText))

    const result = await generateSet(mockProfile, mockSessionInput, [])

    expect(result).toEqual({
      adapted_set_text: '400 warm-up\n4x100 aerobic pace\n200 cool-down',
      coach_commentary: 'Good aerobic day. Keep that stroke long.',
      base_set_id: 'set-abc',
    })
  })

  it('throws when Gemini returns no function call', async () => {
    const mockSupabase = {
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        not: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        lte: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue({ data: [], error: null }),
      }),
    }
    ;(createClient as jest.Mock).mockResolvedValue(mockSupabase)

    const mockGenerateContent = model.generateContent as jest.Mock
    mockGenerateContent.mockResolvedValueOnce(buildMockTextResponse('I cannot find a set.'))

    await expect(generateSet(mockProfile, mockSessionInput, [])).rejects.toThrow(
      'No function call returned by Gemini'
    )
  })

  it('passes recentBaseSetIds as excludeIds to executeSetsQuery', async () => {
    const recentIds = ['id-1', 'id-2']
    const mockNot = jest.fn().mockReturnThis()
    const mockSupabase = {
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        not: mockNot,
        gte: jest.fn().mockReturnThis(),
        lte: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue({ data: [mockSet], error: null }),
      }),
    }
    ;(createClient as jest.Mock).mockResolvedValue(mockSupabase)

    const finalJsonText = JSON.stringify({
      adapted_set_text: 'some set',
      coach_commentary: 'some commentary',
    })
    const mockGenerateContent = model.generateContent as jest.Mock
    mockGenerateContent
      .mockResolvedValueOnce(buildMockFunctionCallResponse({ energy_system: 'aerobic', duration_min: 40, duration_max: 50 }))
      .mockResolvedValueOnce(buildMockTextResponse(finalJsonText))

    await generateSet(mockProfile, mockSessionInput, recentIds)

    expect(mockNot).toHaveBeenCalledWith('id', 'in', expect.stringContaining('id-1'))
  })
})
