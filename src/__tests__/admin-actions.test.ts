/**
 * @jest-environment node
 */
import { createSet } from '../app/admin/sets/new/actions'
import { updateSet } from '../app/admin/sets/[id]/edit/actions'

const mockInsert = jest.fn()
const mockUpdate = jest.fn()
const mockEq = jest.fn()
const mockFrom = jest.fn()

jest.mock('@/lib/supabase/admin', () => ({
  createAdminClient: jest.fn().mockImplementation(() => ({
    from: (...args: unknown[]) => {
      mockFrom(...args)
      return {
        insert: (...a: unknown[]) => mockInsert(...a),
        update: (...a: unknown[]) => {
          mockUpdate(...a)
          return { eq: (...b: unknown[]) => mockEq(...b) }
        },
      }
    },
  })),
}))

jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}))

const validSetData = {
  stroke: 'freestyle',
  energy_system: 'aerobic',
  technique_tags: ['catch', 'rotation'],
  estimated_duration_min: 45,
  estimated_distance_yards: 2500,
  difficulty: 3,
  pool_format: 'yards',
  set_text: '10x100 on 1:30 freestyle @ aerobic pace',
  coach_notes: 'Focus on catch and rotation',
  is_active: true,
}

describe('createSet', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockInsert.mockResolvedValue({ error: null })
  })

  it('inserts a set and redirects to /admin on success', async () => {
    const formData = new FormData()
    Object.entries(validSetData).forEach(([k, v]) => {
      if (Array.isArray(v)) {
        v.forEach((item) => formData.append(k, item))
      } else {
        formData.set(k, String(v))
      }
    })

    await createSet(null, formData)

    expect(mockFrom).toHaveBeenCalledWith('sets')
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        stroke: 'freestyle',
        energy_system: 'aerobic',
        technique_tags: ['catch', 'rotation'],
        estimated_duration_min: 45,
        estimated_distance_yards: 2500,
        difficulty: 3,
        pool_format: 'yards',
        set_text: '10x100 on 1:30 freestyle @ aerobic pace',
        coach_notes: 'Focus on catch and rotation',
        is_active: true,
      })
    )

    const { redirect } = require('next/navigation')
    expect(redirect).toHaveBeenCalledWith('/admin')
  })

  it('returns error string when insert fails', async () => {
    mockInsert.mockResolvedValue({ error: { message: 'insert failed' } })

    const formData = new FormData()
    Object.entries(validSetData).forEach(([k, v]) => {
      if (Array.isArray(v)) {
        v.forEach((item) => formData.append(k, item))
      } else {
        formData.set(k, String(v))
      }
    })

    const result = await createSet(null, formData)
    expect(result).toBe('insert failed')
  })

  it('returns validation error when required field is missing', async () => {
    const formData = new FormData()
    formData.set('stroke', 'freestyle')
    formData.set('energy_system', 'aerobic')
    formData.set('estimated_duration_min', '45')
    formData.set('estimated_distance_yards', '2500')
    formData.set('difficulty', '3')
    formData.set('pool_format', 'yards')
    // Omit set_text

    const result = await createSet(null, formData)
    expect(result).toMatch(/set_text/)
    expect(mockInsert).not.toHaveBeenCalled()
  })
})

describe('updateSet', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockEq.mockResolvedValue({ error: null })
  })

  it('updates a set by id and redirects to /admin on success', async () => {
    const formData = new FormData()
    formData.set('id', 'set-uuid-123')
    Object.entries(validSetData).forEach(([k, v]) => {
      if (Array.isArray(v)) {
        v.forEach((item) => formData.append(k, item))
      } else {
        formData.set(k, String(v))
      }
    })

    await updateSet(null, formData)

    expect(mockFrom).toHaveBeenCalledWith('sets')
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        stroke: 'freestyle',
        energy_system: 'aerobic',
      })
    )
    expect(mockEq).toHaveBeenCalledWith('id', 'set-uuid-123')

    const { redirect } = require('next/navigation')
    expect(redirect).toHaveBeenCalledWith('/admin')
  })

  it('returns error when id is missing', async () => {
    const formData = new FormData()
    Object.entries(validSetData).forEach(([k, v]) => {
      if (Array.isArray(v)) {
        v.forEach((item) => formData.append(k, item))
      } else {
        formData.set(k, String(v))
      }
    })

    const result = await updateSet(null, formData)
    expect(result).toMatch(/id/)
    expect(mockUpdate).not.toHaveBeenCalled()
  })

  it('returns error string when update fails', async () => {
    mockEq.mockResolvedValue({ error: { message: 'update failed' } })

    const formData = new FormData()
    formData.set('id', 'set-uuid-123')
    Object.entries(validSetData).forEach(([k, v]) => {
      if (Array.isArray(v)) {
        v.forEach((item) => formData.append(k, item))
      } else {
        formData.set(k, String(v))
      }
    })

    const result = await updateSet(null, formData)
    expect(result).toBe('update failed')
  })
})
