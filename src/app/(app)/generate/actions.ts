'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { generateSet } from '@/lib/ai/generate-set'
import type { SessionInput, UserProfile, UserProgress, EnergySystem } from '@/lib/types/database'
import { checkFreemiumGate, buildGeneratedSetRecord } from './helpers'

export async function generateSetAction(formData: FormData) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect('/login')
  }

  const [profileResult, progressResult, recentSetsResult] = await Promise.all([
    supabase.from('user_profiles').select('*').eq('user_id', user.id).single(),
    supabase.from('user_progress').select('*').eq('user_id', user.id).single(),
    supabase
      .from('generated_sets')
      .select('base_set_id')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10),
  ])

  if (profileResult.error || !profileResult.data) {
    throw new Error('Profile not found — please complete onboarding first')
  }
  if (progressResult.error || !progressResult.data) {
    throw new Error('Progress record not found')
  }

  const profile = profileResult.data as UserProfile
  const progress = progressResult.data as UserProgress

  const gate = checkFreemiumGate({ ...progress, subscription_status: profile.subscription_status })
  if (!gate.allowed) {
    redirect(`/generate?error=${encodeURIComponent(gate.reason!)}`)
  }

  if (gate.weekReset) {
    await supabase
      .from('user_progress')
      .update({ sets_generated_this_week: 0, week_start: new Date().toISOString() })
      .eq('user_id', user.id)
  }

  const recentBaseSetIds = (recentSetsResult.data ?? []).map(
    (r: { base_set_id: string }) => r.base_set_id
  )

  const sessionInput: SessionInput = {
    duration_min:
      parseInt(formData.get('duration_min') as string, 10) || profile.session_duration_min,
    focus_stroke: (formData.get('focus_stroke') as import('@/lib/types/database').Stroke) || undefined,
    energy_system: (formData.get('energy_system') as EnergySystem) || undefined,
    technique_focus: (formData.get('technique_focus') as string) || undefined,
    energy_level:
      (formData.get('energy_level') as 'easy' | 'moderate' | 'hard') || 'moderate',
    free_text: (formData.get('free_text') as string) || undefined,
  }

  const aiResult = await generateSet(profile, sessionInput, recentBaseSetIds)

  const { data: baseSet } = await supabase
    .from('sets')
    .select('difficulty, technique_tags')
    .eq('id', aiResult.base_set_id)
    .single()

  const record = buildGeneratedSetRecord({
    userId: user.id,
    baseSetId: aiResult.base_set_id,
    sessionInput,
    adaptedSetText: aiResult.adapted_set_text,
    coachCommentary: aiResult.coach_commentary,
    energySystem: (sessionInput.energy_system ?? 'aerobic') as EnergySystem,
    techniqueTags: baseSet?.technique_tags ?? [],
    difficulty: baseSet?.difficulty ?? 3,
  })

  const { data: inserted, error: insertError } = await supabase
    .from('generated_sets')
    .insert(record)
    .select('id')
    .single()

  if (insertError || !inserted) {
    throw new Error('Failed to save generated set')
  }

  await supabase
    .from('user_progress')
    .update({
      sets_generated_this_week: gate.weekReset ? 1 : (progress.sets_generated_this_week + 1),
    })
    .eq('user_id', user.id)

  redirect(`/set/${inserted.id}`)
}
