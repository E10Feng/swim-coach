import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { calculateLevel, getNextLevel, LEVELS } from '@/lib/gamification/xp'
import { getDashboardMessage } from '@/lib/gamification/coach-messages'
import type {
  UserProgress,
  CompletedWorkout,
  GeneratedSet,
  UserProfile,
  Badge,
  UserBadge,
} from '@/lib/types/database'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [
    { data: profileData },
    { data: progressData },
    { data: recentWorkoutsData },
    { data: userBadgesData },
  ] = await Promise.all([
    supabase.from('user_profiles').select('*').eq('user_id', user.id).single(),
    supabase.from('user_progress').select('*').eq('user_id', user.id).single(),
    supabase
      .from('completed_workouts')
      .select('*')
      .eq('user_id', user.id)
      .order('completed_at', { ascending: false })
      .limit(4),
    supabase
      .from('user_badges')
      .select('badge_id, earned_at, badges(id, slug, name, description)')
      .eq('user_id', user.id),
  ])

  const profile = profileData as UserProfile | null
  const progress = progressData as UserProgress | null
  const recentWorkouts = (recentWorkoutsData ?? []) as CompletedWorkout[]

  if (!profile) redirect('/onboarding')

  const recentSetIds = recentWorkouts.map(w => w.generated_set_id)
  const { data: recentSetsData } = recentSetIds.length > 0
    ? await supabase.from('generated_sets').select('*').in('id', recentSetIds)
    : { data: [] }
  const recentSets = (recentSetsData ?? []) as GeneratedSet[]

  const totalXp = progress?.total_xp ?? 0
  const currentStreak = progress?.current_streak ?? 0
  const longestStreak = progress?.longest_streak ?? 0
  const sessionsThisWeek = progress?.sets_generated_this_week ?? 0
  const daysPerWeek = profile.days_per_week
  const levelName = calculateLevel(totalXp)
  const nextLevel = getNextLevel(totalXp)
  const xpToNextLevel = nextLevel ? nextLevel.minXp - totalXp : 0
  const currentLevelMinXp = LEVELS.find(l => l.name === levelName)?.minXp ?? 0
  const xpProgressPercent = nextLevel
    ? Math.min(100, Math.round(((totalXp - currentLevelMinXp) / (nextLevel.minXp - currentLevelMinXp)) * 100))
    : 100

  const coachMessage = getDashboardMessage(recentWorkouts, recentSets, profile)
  const weeklyProgressPercent = Math.min(Math.round((sessionsThisWeek / daysPerWeek) * 100), 100)
  const weeklyGoalMet = sessionsThisWeek >= daysPerWeek

  type BadgeJoin = UserBadge & { badges: Badge }
  const earnedBadges = ((userBadgesData ?? []) as unknown as BadgeJoin[]).map(row => row.badges).filter(Boolean)

  const RING_RADIUS = 40
  const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS
  const ringDashoffset = RING_CIRCUMFERENCE * (1 - weeklyProgressPercent / 100)

  return (
    <div className="min-h-screen bg-gray-950 text-white px-4 py-8 max-w-2xl mx-auto">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 text-sm mt-1">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </header>

      <section className="bg-blue-950 border border-blue-800 rounded-xl p-5 mb-6" aria-label="Coach message">
        <p className="text-sm text-blue-300 font-semibold mb-1">Coach Alex</p>
        <p className="text-white">{coachMessage}</p>
      </section>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex flex-col items-center" aria-label="Current streak">
          <span className="text-4xl font-extrabold text-orange-400">{currentStreak}</span>
          <span className="text-sm text-gray-400 mt-1">Week streak</span>
          {longestStreak > 0 && <span className="text-xs text-gray-600 mt-2">Best: {longestStreak}</span>}
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex flex-col items-center" aria-label="Weekly goal">
          <svg width="96" height="96" viewBox="0 0 96 96" aria-hidden="true">
            <circle cx="48" cy="48" r={RING_RADIUS} fill="none" stroke="#374151" strokeWidth="8" />
            <circle
              cx="48" cy="48" r={RING_RADIUS} fill="none"
              stroke={weeklyGoalMet ? '#22c55e' : '#3b82f6'}
              strokeWidth="8" strokeLinecap="round"
              strokeDasharray={RING_CIRCUMFERENCE}
              strokeDashoffset={ringDashoffset}
              transform="rotate(-90 48 48)"
            />
            <text x="48" y="48" textAnchor="middle" dominantBaseline="central" fill="white" fontSize="14" fontWeight="bold">
              {sessionsThisWeek}/{daysPerWeek}
            </text>
          </svg>
          <span className="text-sm text-gray-400 mt-1">This week</span>
        </div>
      </div>

      <section className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-6" aria-label="XP and level">
        <div className="flex justify-between items-center mb-2">
          <span className="font-semibold text-white">{levelName}</span>
          {nextLevel
            ? <span className="text-sm text-gray-400">{xpToNextLevel} XP to {nextLevel.name}</span>
            : <span className="text-sm text-yellow-400">Max Level</span>
          }
        </div>
        <div className="w-full bg-gray-800 rounded-full h-3" role="progressbar" aria-valuenow={xpProgressPercent} aria-valuemin={0} aria-valuemax={100}>
          <div
            className="bg-gradient-to-r from-blue-500 to-cyan-400 h-3 rounded-full transition-all duration-500"
            style={{ width: `${xpProgressPercent}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-2">{totalXp.toLocaleString()} total XP</p>
      </section>

      <Link
        href="/generate"
        className="block w-full text-center bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold py-4 rounded-xl mb-6 transition-colors"
      >
        Get Today&apos;s Set →
      </Link>

      {recentWorkouts.length > 0 && (
        <section aria-label="Recent activity">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Recent Activity</h2>
          <ul className="space-y-3">
            {recentWorkouts.map(workout => {
              const set = recentSets.find(s => s.id === workout.generated_set_id)
              return (
                <li key={workout.id} className="bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white capitalize">
                      {set?.energy_system ?? 'Workout'}
                      {set?.session_input?.focus_stroke ? ` · ${set.session_input.focus_stroke}` : ''}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {new Date(workout.completed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      {workout.duration_min ? ` · ${workout.duration_min} min` : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-cyan-400">+{workout.xp_earned} XP</span>
                    {workout.rating === 'thumbs_up' && <span aria-label="Thumbs up" className="text-base">👍</span>}
                    {workout.rating === 'thumbs_down' && <span aria-label="Thumbs down" className="text-base">👎</span>}
                  </div>
                </li>
              )
            })}
          </ul>
        </section>
      )}

      {earnedBadges.length > 0 && (
        <section aria-label="Earned badges" className="mt-6">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Badges</h2>
          <div className="flex flex-wrap gap-2">
            {earnedBadges.map(badge => (
              <span
                key={badge.id}
                title={badge.description}
                className="bg-yellow-900/40 border border-yellow-700 text-yellow-300 text-xs font-medium px-3 py-1 rounded-full"
              >
                {badge.name}
              </span>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
