import type { Rating } from '@/lib/types/database'

export function calculateXp(_opts: { difficulty: number }): number {
  return 100
}

export function buildCompletedWorkoutRecord(opts: {
  userId: string
  generatedSetId: string
  xpEarned: number
  durationMin: number | null
  rating?: Rating
  notes?: string
}) {
  return {
    user_id: opts.userId,
    generated_set_id: opts.generatedSetId,
    xp_earned: opts.xpEarned,
    duration_min: opts.durationMin ?? null,
    rating: opts.rating ?? null,
    notes: opts.notes ?? null,
    completed_at: new Date().toISOString(),
  }
}
