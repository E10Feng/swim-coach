import type { GeneratedSet } from '@/lib/types/database'

export const LEVELS = [
  { name: 'Lap Swimmer',      minXp: 0 },
  { name: 'Distance Swimmer', minXp: 500 },
  { name: 'Race Pace',        minXp: 1500 },
  { name: 'Black Line',       minXp: 3500 },
  { name: 'Champion',         minXp: 7500 },
] as const

export function calculateXP(set: GeneratedSet, userUsualStrokes: string[]): number {
  let xp = 100
  if (set.difficulty > 3) xp += 25
  if (set.technique_tags.length > 0) xp += 25
  const focusStroke = set.session_input.focus_stroke
  if (focusStroke && !userUsualStrokes.includes(focusStroke)) xp += 50
  return xp
}

export function calculateLevel(totalXp: number): string {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (totalXp >= LEVELS[i].minXp) return LEVELS[i].name
  }
  return LEVELS[0].name
}

export function getNextLevel(totalXp: number): { name: string; minXp: number } | null {
  for (const level of LEVELS) {
    if (totalXp < level.minXp) return level
  }
  return null
}
