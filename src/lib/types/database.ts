export type ExperienceLevel = 'beginner' | 'recreational' | 'masters' | 'former_competitive'
export type Goal = 'fitness' | 'triathlon' | 'get_faster' | 'consistency' | 'enjoyment'
export type PoolFormat = 'yards_25' | 'meters_25' | 'meters_50'
export type SubscriptionStatus = 'free' | 'paid'
export type Stroke = 'freestyle' | 'backstroke' | 'breaststroke' | 'butterfly' | 'IM' | 'mixed'
export type EnergySystem = 'aerobic' | 'threshold' | 'anaerobic' | 'speed'
export type SetPoolFormat = 'yards' | 'meters' | 'both'
export type Rating = 'thumbs_up' | 'thumbs_down'
export type EnergyLevel = 'easy' | 'moderate' | 'hard'

export interface UserProfile {
  user_id: string
  experience_level: ExperienceLevel
  goal: Goal
  strokes: string[]
  session_duration_min: number
  days_per_week: number
  pool_format: PoolFormat
  physical_notes: string | null
  subscription_status: SubscriptionStatus
  stripe_customer_id: string | null
  updated_at: string
}

// Named SwimSet to avoid collision with the built-in Set type
export interface SwimSet {
  id: string
  stroke: Stroke
  energy_system: EnergySystem
  technique_tags: string[]
  estimated_duration_min: number
  estimated_distance_yards: number
  difficulty: number
  pool_format: SetPoolFormat
  set_text: string
  coach_notes: string | null
  is_active: boolean
  created_at: string
}

export interface SessionInput {
  duration_min: number
  focus_stroke?: Stroke
  energy_system?: EnergySystem
  technique_focus?: string
  energy_level: EnergyLevel
  free_text?: string
}

export interface GeneratedSet {
  id: string
  user_id: string
  base_set_id: string
  session_input: SessionInput
  generated_set_text: string
  coach_commentary: string
  energy_system: EnergySystem
  technique_tags: string[]
  difficulty: number
  created_at: string
}

export interface CompletedWorkout {
  id: string
  user_id: string
  generated_set_id: string
  completed_at: string
  rating: Rating | null
  notes: string | null
  xp_earned: number
  duration_min: number | null
}

export interface UserProgress {
  user_id: string
  current_streak: number
  longest_streak: number
  total_xp: number
  level: string
  last_completed_at: string | null
  sets_generated_this_week: number
  week_start: string
}

export interface Badge {
  id: string
  slug: string
  name: string
  description: string
}

export interface UserBadge {
  user_id: string
  badge_id: string
  earned_at: string
}
