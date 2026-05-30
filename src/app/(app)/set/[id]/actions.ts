'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Rating } from '@/lib/types/database'
import { calculateXp, buildCompletedWorkoutRecord } from './helpers'

export async function markDoneAction(formData: FormData) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect('/login')
  }

  const generatedSetId = formData.get('generated_set_id') as string
  const durationMin = formData.get('duration_min')
    ? parseInt(formData.get('duration_min') as string, 10)
    : null
  const rating = (formData.get('rating') as Rating | null) || null
  const notes = (formData.get('notes') as string | null) || null

  const { data: genSet, error: genSetError } = await supabase
    .from('generated_sets')
    .select('id, user_id, difficulty')
    .eq('id', generatedSetId)
    .eq('user_id', user.id)
    .single()

  if (genSetError || !genSet) {
    throw new Error('Generated set not found or access denied')
  }

  const xpEarned = calculateXp({ difficulty: genSet.difficulty })

  const record = buildCompletedWorkoutRecord({
    userId: user.id,
    generatedSetId,
    xpEarned,
    durationMin,
    rating: rating ?? undefined,
    notes: notes ?? undefined,
  })

  const { error: insertError } = await supabase
    .from('completed_workouts')
    .insert(record)

  if (insertError) {
    throw new Error('Failed to save completed workout')
  }

  const { data: progress } = await supabase
    .from('user_progress')
    .select('total_xp, current_streak, last_completed_at')
    .eq('user_id', user.id)
    .single()

  if (progress) {
    await supabase
      .from('user_progress')
      .update({
        total_xp: (progress.total_xp ?? 0) + xpEarned,
        current_streak: (progress.current_streak ?? 0) + 1,
        last_completed_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)
  }

  redirect('/dashboard')
}
