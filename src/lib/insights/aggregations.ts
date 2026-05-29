import type { CompletedWorkout, GeneratedSet, EnergySystem } from '@/lib/types/database'

export interface WeeklyStats {
  sessionCount: number
  totalVolume: number
  aerobicPct: number
  thresholdPct: number
  anaerobicPct: number
  speedPct: number
  techniquePct: number
}

export interface MonthlyStats extends WeeklyStats {
  consistencyScore: number
}

function daysAgo(anchor: Date, days: number): Date {
  const d = new Date(anchor)
  d.setUTCDate(d.getUTCDate() - days)
  return d
}

function inWindow(completedAt: string, windowStart: Date, windowEnd: Date): boolean {
  const t = new Date(completedAt)
  return t >= windowStart && t <= windowEnd
}

function buildSetMap(generatedSets: GeneratedSet[]): Map<string, GeneratedSet> {
  return new Map(generatedSets.map(s => [s.id, s]))
}

function computeStats(workouts: CompletedWorkout[], setMap: Map<string, GeneratedSet>): WeeklyStats {
  const sessionCount = workouts.length
  const totalVolume = workouts.reduce((acc, w) => acc + (w.duration_min ?? 0), 0)

  const energyCounts: Record<EnergySystem, number> = { aerobic: 0, threshold: 0, anaerobic: 0, speed: 0 }
  let techniqueCount = 0

  for (const w of workouts) {
    const s = setMap.get(w.generated_set_id)
    if (s) {
      energyCounts[s.energy_system]++
      if (s.technique_tags.length > 0) techniqueCount++
    }
  }

  const matchedCount = workouts.filter(w => setMap.has(w.generated_set_id)).length || 1

  return {
    sessionCount,
    totalVolume,
    aerobicPct: Math.round((energyCounts.aerobic / matchedCount) * 100),
    thresholdPct: Math.round((energyCounts.threshold / matchedCount) * 100),
    anaerobicPct: Math.round((energyCounts.anaerobic / matchedCount) * 100),
    speedPct: Math.round((energyCounts.speed / matchedCount) * 100),
    techniquePct: Math.round((techniqueCount / matchedCount) * 100),
  }
}

export function weeklyStats(
  workouts: CompletedWorkout[],
  generatedSets: GeneratedSet[],
  anchorDate: Date = new Date()
): WeeklyStats {
  const windowStart = daysAgo(anchorDate, 7)
  const filtered = workouts.filter(w => inWindow(w.completed_at, windowStart, anchorDate))
  if (filtered.length === 0) {
    return { sessionCount: 0, totalVolume: 0, aerobicPct: 0, thresholdPct: 0, anaerobicPct: 0, speedPct: 0, techniquePct: 0 }
  }
  return computeStats(filtered, buildSetMap(generatedSets))
}

export function monthlyStats(
  workouts: CompletedWorkout[],
  generatedSets: GeneratedSet[],
  anchorDate: Date = new Date()
): MonthlyStats {
  const windowStart = daysAgo(anchorDate, 28)
  const filtered = workouts.filter(w => inWindow(w.completed_at, windowStart, anchorDate))
  if (filtered.length === 0) {
    return { sessionCount: 0, totalVolume: 0, aerobicPct: 0, thresholdPct: 0, anaerobicPct: 0, speedPct: 0, techniquePct: 0, consistencyScore: 0 }
  }
  return { ...computeStats(filtered, buildSetMap(generatedSets)), consistencyScore: consistencyScore(workouts, anchorDate) }
}

export function consistencyScore(workouts: CompletedWorkout[], anchorDate: Date = new Date()): number {
  const windowStart = daysAgo(anchorDate, 21)
  const filtered = workouts.filter(w => inWindow(w.completed_at, windowStart, anchorDate))
  const weeksWithWorkout = new Set<number>()
  for (const w of filtered) {
    const msSinceStart = new Date(w.completed_at).getTime() - windowStart.getTime()
    const weekIndex = Math.floor(msSinceStart / (7 * 24 * 60 * 60 * 1000))
    weeksWithWorkout.add(weekIndex)
  }
  return Math.round((weeksWithWorkout.size / 4) * 100)
}
