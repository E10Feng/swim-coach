import type { SupabaseClient } from '@supabase/supabase-js'
import type { Badge, CompletedWorkout, UserProgress } from '@/lib/types/database'

export const BADGE_SLUGS = {
  FIRST_SET: 'first_set',
  FIRST_BUTTERFLY: 'first_butterfly',
  STREAK_7: 'streak_7',
  STREAK_30: 'streak_30',
  YARDS_10K: 'yards_10k',
  ALL_FOUR_STROKES: 'all_four_strokes',
} as const

export async function checkAndAwardBadges(
  userId: string,
  supabase: SupabaseClient,
  completedWorkouts: CompletedWorkout[],
  progress: UserProgress,
  userStrokes: string[],
): Promise<Badge[]> {
  const { data: allBadges, error: badgesError } = await supabase.from('badges').select('*')
  if (badgesError || !allBadges) return []

  const { data: earnedRows, error: earnedError } = await supabase
    .from('user_badges')
    .select('badge_id')
    .eq('user_id', userId)
  if (earnedError) return []

  const earnedBadgeIds = new Set((earnedRows ?? []).map((r: { badge_id: string }) => r.badge_id))
  const badgeMap = new Map<string, Badge>(allBadges.map((b: Badge) => [b.slug, b]))
  const toAward: Badge[] = []

  function shouldAward(slug: string, condition: boolean): void {
    const badge = badgeMap.get(slug)
    if (!badge || earnedBadgeIds.has(badge.id)) return
    if (condition) toAward.push(badge)
  }

  shouldAward(BADGE_SLUGS.FIRST_SET, completedWorkouts.length >= 1)
  shouldAward(BADGE_SLUGS.STREAK_7, progress.current_streak >= 7)
  shouldAward(BADGE_SLUGS.STREAK_30, progress.current_streak >= 30)
  shouldAward(BADGE_SLUGS.FIRST_BUTTERFLY, userStrokes.includes('butterfly'))
  const fourStrokes = ['freestyle', 'backstroke', 'breaststroke', 'butterfly']
  shouldAward(BADGE_SLUGS.ALL_FOUR_STROKES, fourStrokes.every(s => userStrokes.includes(s)))

  if (toAward.length === 0) return []

  await supabase.from('user_badges').insert(
    toAward.map(badge => ({ user_id: userId, badge_id: badge.id, earned_at: new Date().toISOString() }))
  )

  return toAward
}
