/**
 * @jest-environment node
 */
import { getSetsToolDeclaration, executeSetsQuery } from '@/lib/ai/get-sets'

describe('getSetsToolDeclaration', () => {
  it('has correct name and required fields', () => {
    expect(getSetsToolDeclaration.name).toBe('get_sets')
    expect(getSetsToolDeclaration.parameters.required).toEqual(
      expect.arrayContaining(['energy_system', 'duration_min', 'duration_max'])
    )
  })

  it('energy_system enum contains all valid values', () => {
    const energyEnum =
      getSetsToolDeclaration.parameters.properties.energy_system.enum
    expect(energyEnum).toEqual(['aerobic', 'threshold', 'anaerobic', 'speed'])
  })
})

describe('executeSetsQuery', () => {
  it('excludes recently used base_set_ids from results', async () => {
    const mockSelect = jest.fn().mockReturnThis()
    const mockEq = jest.fn().mockReturnThis()
    const mockNot = jest.fn().mockReturnThis()
    const mockGte = jest.fn().mockReturnThis()
    const mockLte = jest.fn().mockReturnThis()
    const mockLimit = jest.fn().mockResolvedValue({ data: [], error: null })

    const mockClient = {
      from: jest.fn().mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        not: mockNot,
        gte: mockGte,
        lte: mockLte,
        limit: mockLimit,
      }),
    } as any

    await executeSetsQuery(
      mockClient,
      { energy_system: 'aerobic', duration_min: 30, duration_max: 60 },
      ['set-id-1', 'set-id-2']
    )

    expect(mockClient.from).toHaveBeenCalledWith('sets')
    expect(mockNot).toHaveBeenCalledWith(
      'id',
      'in',
      expect.stringContaining('set-id-1')
    )
  })

  it('returns empty array when supabase returns error', async () => {
    const mockClient = {
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        not: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        lte: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue({
          data: null,
          error: new Error('db error'),
        }),
      }),
    } as any

    const result = await executeSetsQuery(
      mockClient,
      { energy_system: 'aerobic', duration_min: 30, duration_max: 60 },
      []
    )
    expect(result).toEqual([])
  })
})
