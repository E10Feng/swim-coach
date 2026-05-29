'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import type { Stroke, EnergySystem, SetPoolFormat } from '@/lib/types/database'

const VALID_STROKES = ['freestyle', 'backstroke', 'breaststroke', 'butterfly', 'IM', 'mixed']
const VALID_ENERGY_SYSTEMS = ['aerobic', 'threshold', 'anaerobic', 'speed']
const VALID_POOL_FORMATS = ['yards', 'meters', 'both']

export async function updateSet(
  _prevState: string | null,
  formData: FormData
): Promise<string | null> {
  const id = formData.get('id')
  if (typeof id !== 'string' || !id) return 'id is required'

  const stroke = formData.get('stroke') as Stroke | null
  const energy_system = formData.get('energy_system') as EnergySystem | null
  const rawTags = formData.getAll('technique_tags').map(String).filter(Boolean)
  const technique_tags = rawTags.flatMap((t) => t.split(',').map((s) => s.trim())).filter(Boolean)
  const estimated_duration_min = Number(formData.get('estimated_duration_min'))
  const estimated_distance_yards = Number(formData.get('estimated_distance_yards'))
  const difficulty = Number(formData.get('difficulty'))
  const pool_format = formData.get('pool_format') as SetPoolFormat | null
  const set_text = formData.get('set_text')
  const coach_notes = formData.get('coach_notes')
  const is_active = formData.get('is_active') === 'true'

  if (!stroke || !VALID_STROKES.includes(stroke)) return 'Invalid stroke value'
  if (!energy_system || !VALID_ENERGY_SYSTEMS.includes(energy_system)) return 'Invalid energy_system value'
  if (!pool_format || !VALID_POOL_FORMATS.includes(pool_format)) return 'Invalid pool_format value'
  if (!set_text || typeof set_text !== 'string' || !set_text.trim()) return 'set_text is required'
  if (!difficulty || difficulty < 1 || difficulty > 5) return 'difficulty must be between 1 and 5'
  if (!estimated_duration_min || estimated_duration_min < 1) return 'estimated_duration_min must be a positive number'
  if (!estimated_distance_yards || estimated_distance_yards < 1) return 'estimated_distance_yards must be a positive number'

  const supabase = createAdminClient()
  const { error } = await supabase
    .from('sets')
    .update({
      stroke,
      energy_system,
      technique_tags,
      estimated_duration_min,
      estimated_distance_yards,
      difficulty,
      pool_format,
      set_text: set_text.trim(),
      coach_notes: typeof coach_notes === 'string' && coach_notes.trim() ? coach_notes.trim() : null,
      is_active,
    })
    .eq('id', id)

  if (error) return error.message

  redirect('/admin')
}
