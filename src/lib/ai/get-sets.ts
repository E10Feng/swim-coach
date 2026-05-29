import type { SupabaseClient } from '@supabase/supabase-js'
import type { EnergySystem, Stroke, SwimSet } from '@/lib/types/database'

export const getSetsToolDeclaration = {
  name: 'get_sets',
  description: 'Retrieve swim sets matching the given criteria',
  parameters: {
    type: 'object',
    properties: {
      stroke: {
        type: 'string',
        enum: ['freestyle', 'backstroke', 'breaststroke', 'butterfly', 'IM', 'mixed'],
      },
      energy_system: {
        type: 'string',
        enum: ['aerobic', 'threshold', 'anaerobic', 'speed'],
      },
      duration_min: { type: 'number' },
      duration_max: { type: 'number' },
      difficulty: { type: 'number', description: '1-5' },
      technique_focus: { type: 'string' },
    },
    required: ['energy_system', 'duration_min', 'duration_max'],
  },
}

export interface GetSetsArgs {
  stroke?: Stroke
  energy_system: EnergySystem
  duration_min: number
  duration_max: number
  difficulty?: number
  technique_focus?: string
}

export async function executeSetsQuery(
  supabase: SupabaseClient,
  args: GetSetsArgs,
  excludeIds: string[]
): Promise<SwimSet[]> {
  let query = supabase
    .from('sets')
    .select('*')
    .eq('is_active', true)
    .eq('energy_system', args.energy_system)
    .gte('estimated_duration_min', args.duration_min)
    .lte('estimated_duration_min', args.duration_max)

  if (args.stroke) {
    query = query.eq('stroke', args.stroke)
  }

  if (args.difficulty) {
    query = query
      .gte('difficulty', args.difficulty - 1)
      .lte('difficulty', args.difficulty + 1)
  }

  if (excludeIds.length > 0) {
    query = query.not('id', 'in', `(${excludeIds.join(',')})`)
  }

  const { data, error } = await query.limit(10)

  if (error || !data) {
    console.error('executeSetsQuery error:', error)
    return []
  }

  return data as SwimSet[]
}
