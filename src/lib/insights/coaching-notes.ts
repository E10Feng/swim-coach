import type { WeeklyStats } from './aggregations'

export function getInsightsNote(stats: WeeklyStats): string {
  if (stats.sessionCount === 0) return "No sessions recorded yet this week. Every lap counts!"
  if (stats.aerobicPct < 40) return "Add more aerobic base work — aim for at least 40% of your sessions at easy/moderate pace."
  if (stats.speedPct > 40) return "You're doing a lot of speed work — mix in more threshold and aerobic sets to build your base."
  if (stats.techniquePct < 25) return "Consider adding technique-focused sets to reinforce good habits."
  if (stats.thresholdPct > 50) return "Heavy threshold loading — make sure you're balancing with easy aerobic recovery days."
  return "Great balance this week — keep building consistency."
}
