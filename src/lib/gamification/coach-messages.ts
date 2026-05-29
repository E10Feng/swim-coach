import type { CompletedWorkout, GeneratedSet, UserProfile } from '@/lib/types/database'

const DAY_MS = 24 * 60 * 60 * 1000

export function getDashboardMessage(
  recentWorkouts: CompletedWorkout[],
  generatedSets: GeneratedSet[],
  _profile: UserProfile,
): string {
  const now = Date.now()
  const setMap = new Map<string, GeneratedSet>(generatedSets.map(s => [s.id, s]))
  const sorted = [...recentWorkouts].sort(
    (a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime(),
  )

  // Rule 1: inactive 5+ days (highest priority)
  if (sorted.length > 0) {
    const daysSinceLast = (now - new Date(sorted[0].completed_at).getTime()) / DAY_MS
    if (daysSinceLast >= 5) {
      return "Been a while — let's get back in the water."
    }
  }

  // Rule 2: last 3 workouts all aerobic
  if (sorted.length >= 3) {
    const allAerobic = sorted.slice(0, 3).every(w => setMap.get(w.generated_set_id)?.energy_system === 'aerobic')
    if (allAerobic) {
      return "You've been heavy on aerobic work — time to work on pace today."
    }
  }

  // Rule 3: no technique sets in last 10 days
  const tenDaysAgo = now - 10 * DAY_MS
  if (sorted.length > 0) {
    const recentWithTechnique = sorted.filter(w => {
      if (new Date(w.completed_at).getTime() < tenDaysAgo) return false
      return (setMap.get(w.generated_set_id)?.technique_tags ?? []).length > 0
    })
    if (recentWithTechnique.length === 0) {
      return "Your stroke might be drifting — let's sharpen it up."
    }
  }

  return "Ready for today's set?"
}
