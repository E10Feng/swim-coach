'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { generateSet } from '@/lib/ai/generate-set'
import type { SessionInput, UserProfile, UserProgress, EnergySystem, SubscriptionStatus } from '@/lib/types/database'

// ── Exported helpers (unit-tested) ───────────────────────────────────────────

interface FreemiumCheckInput extends UserProgress {
  subscription_status: SubscriptionStatus
}

export interface FreemiumCheckResult {
  allowed: boolean
  reason?: string
  weekReset?: boolean
}

export function checkFreemiumGate(progress: FreemiumCheckInput): FreemiumCheckResult {
  if (progress.subscription_status === 'paid') {
    return { allowed: true }
  }

  const weekStart = new Date(progress.week_start)
  const msInWeek = 7 * 24 * 60 * 60 * 1000
  const weekExpired = Date.now() - weekStart.getTime() > msInWeek

  if (weekExpired) {
    return { allowed: true, weekReset: true }
  }

  if (progress.sets_generated_this_week >= 3) {
    return {
      allowed: false,
      reason: 'You have used your 3 free sets this week. Upgrade to get unlimited sets.',
    }
  }

  return { allowed: true }
}

export function buildGeneratedSetRecord(input: {
  userId: string
  baseSetId: string
  sessionInput: SessionInput | Record<string, unknown>
  adaptedSetText: string
  coachCommentary: string
  energySystem: EnergySystem
  techniqueTags: string[]
  difficulty: number
}) {
  return {
    user_id: input.userId,
    base_set_id: input.baseSetId,
    session_input: input.sessionInput,
    generated_set_text: input.adaptedSetText,
    coach_commentary: input.coachCommentary,
    energy_system: input.energySystem,
    technique_tags: input.techniqueTags,
    difficulty: input.difficulty,
  }
}

// ── Server action ─────────────────────────────────────────────────────────────

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
    focus_stroke: (formData.get('focus_stroke') as string) || undefined,
    energy_system: (formData.get('energy_system') as EnergySystem) || undefined,
    technique_focus: (formData.get('technique_focus') as string) || undefined,
    energy_level:
      (formData.get('energy_level') as 'easy' | 'moderate' | 'hard') || 'moderate',
    free_text: (formData.get('free_text') as string) || undefined,
  }

  const aiResult = await generateSet(profile, sessionInput, recentBaseSetIds)

  // Fetch base set for metadata
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
