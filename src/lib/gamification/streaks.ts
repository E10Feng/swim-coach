import type { UserProgress } from '@/lib/types/database'

function getWeekStart(date: Date): string {
  const d = new Date(date)
  const day = d.getUTCDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setUTCDate(d.getUTCDate() + diff)
  return d.toISOString().slice(0, 10)
}

export function updateStreak(
  progress: UserProgress,
  completedAt: Date,
  daysPerWeek: number,
): Partial<UserProgress> {
  const currentWeekStart = getWeekStart(completedAt)
  const storedWeekStart = progress.week_start
  const update: Partial<UserProgress> = {}

  if (currentWeekStart !== storedWeekStart) {
    update.week_start = currentWeekStart
    update.sets_generated_this_week = 1
    update.last_completed_at = completedAt.toISOString()

    const storedDate = new Date(storedWeekStart + 'T00:00:00Z')
    const expectedPreviousWeek = new Date(currentWeekStart + 'T00:00:00Z')
    expectedPreviousWeek.setUTCDate(expectedPreviousWeek.getUTCDate() - 7)
    const isConsecutiveWeek = storedDate.getTime() === expectedPreviousWeek.getTime()

    if (!isConsecutiveWeek) {
      update.current_streak = 0
    } else {
      update.current_streak = progress.current_streak
    }
    return update
  }

  const newCount = progress.sets_generated_this_week + 1
  update.sets_generated_this_week = newCount
  update.last_completed_at = completedAt.toISOString()

  const goalAlreadyMet = progress.sets_generated_this_week >= daysPerWeek
  const goalJustMet = !goalAlreadyMet && newCount >= daysPerWeek

  if (goalJustMet) {
    const newStreak = progress.current_streak + 1
    update.current_streak = newStreak
    if (newStreak > progress.longest_streak) {
      update.longest_streak = newStreak
    }
  } else {
    update.current_streak = progress.current_streak
  }

  return update
}
