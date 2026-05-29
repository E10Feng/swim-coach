'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { ExperienceLevel, Goal, PoolFormat } from '@/lib/types/database'

export interface ProfileData {
  experience_level: ExperienceLevel
  goal: Goal
  strokes: string[]
  session_duration_min: number
  days_per_week: number
  pool_format: PoolFormat
  physical_notes?: string
}

export async function saveProfile(data: ProfileData): Promise<{ error: string } | undefined> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  // TODO: add Zod validation
  const { error } = await supabase
    .from('user_profiles')
    .upsert({
      user_id: user.id,
      experience_level: data.experience_level,
      goal: data.goal,
      strokes: data.strokes,
      session_duration_min: data.session_duration_min,
      days_per_week: data.days_per_week,
      pool_format: data.pool_format,
      physical_notes: data.physical_notes ?? null,
      updated_at: new Date().toISOString(),
    })

  if (error) {
    return { error: error.message }
  }

  redirect('/dashboard')
}
