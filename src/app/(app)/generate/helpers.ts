import type { SessionInput, UserProgress, EnergySystem, SubscriptionStatus } from '@/lib/types/database'

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
