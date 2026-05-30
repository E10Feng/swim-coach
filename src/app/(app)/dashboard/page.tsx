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
    <div className="bg-bg px-4 pt-4 pb-2 max-w-2xl mx-auto">

      {/* Coach speech bubble */}
      <div className="mb-5 flex gap-3 items-start">
        <div
          className="flex-shrink-0 h-11 w-11 rounded-full flex items-center justify-center text-xl border-2"
          style={{ background: 'var(--surface)', borderColor: 'var(--coral)' }}
        >
          🏊
        </div>
        <div className="relative flex-1">
          {/* Triangle pointer */}
          <div
            className="absolute -left-2.5 top-4 w-3 h-3 rotate-45"
            style={{
              background: 'rgba(255,107,107,0.1)',
              borderLeft: '1px solid rgba(255,107,107,0.25)',
              borderBottom: '1px solid rgba(255,107,107,0.25)',
            }}
          />
          <div
            className="rounded-2xl px-4 py-3"
            style={{
              background: 'rgba(255,107,107,0.08)',
              border: '1px solid rgba(255,107,107,0.25)',
            }}
          >
            <p className="text-xs font-bold mb-1" style={{ color: 'var(--coral)' }}>
              Splash 🦭
            </p>
            <p className="text-sm text-text-primary leading-relaxed">{coachMessage}</p>
          </div>
        </div>
      </div>

      {/* Streak + Weekly goal */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        {/* Streak */}
        <div
          className="btn-game btn-game-surface rounded-2xl p-4 text-center"
          style={{ boxShadow: '0 5px 0 var(--amber-dark)' }}
        >
          <div className="text-3xl mb-1">🔥</div>
          <div
            className="text-6xl font-bold leading-none"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--amber)' }}
          >
            {currentStreak}
          </div>
          <p className="text-xs text-text-secondary mt-1">week streak</p>
          {longestStreak > 0 && (
            <p className="text-xs mt-1.5 font-medium" style={{ color: 'var(--amber)' }}>
              Best: {longestStreak}
            </p>
          )}
        </div>

        {/* Weekly goal ring */}
        <div
          className="btn-game btn-game-surface rounded-2xl p-4 text-center"
          style={{ boxShadow: `0 5px 0 ${weeklyGoalMet ? 'var(--green-dark)' : 'var(--amber-dark)'}` }}
        >
          <svg width="88" height="88" viewBox="0 0 96 96" className="mx-auto" aria-label="Weekly goal">
            <circle cx="48" cy="48" r={RING_RADIUS} fill="none" stroke="#132840" strokeWidth="10" />
            <circle
              cx="48" cy="48" r={RING_RADIUS} fill="none"
              stroke={weeklyGoalMet ? 'var(--green)' : 'var(--amber)'}
              strokeWidth="10" strokeLinecap="round"
              strokeDasharray={RING_CIRCUMFERENCE}
              strokeDashoffset={ringDashoffset}
              transform="rotate(-90 48 48)"
            />
            <text x="48" y="52" textAnchor="middle" fill="white" fontSize="15" fontWeight="bold">
              {sessionsThisWeek}/{daysPerWeek}
            </text>
          </svg>
          <p className="text-xs text-text-secondary mt-1">this week</p>
        </div>
      </div>

      {/* XP card */}
      <div
        className="btn-game btn-game-surface rounded-2xl p-4 mb-5"
        style={{ boxShadow: '0 5px 0 var(--green-dark)' }}
      >
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs text-text-secondary mb-0.5">Level</p>
            <p className="text-base font-bold text-text-primary">{levelName}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-text-secondary mb-0.5">Total XP</p>
            <p
              className="text-base font-bold"
              style={{ fontFamily: 'var(--font-mono)', color: 'var(--amber)' }}
            >
              {totalXp.toLocaleString()}
            </p>
          </div>
        </div>
        <div className="w-full rounded-full h-4 overflow-hidden" style={{ background: 'var(--bg)' }}>
          <div
            className="h-4 rounded-full transition-all duration-700"
            style={{
              width: `${xpProgressPercent}%`,
              background: 'var(--green)',
              boxShadow: '0 0 10px rgba(88,204,2,0.4)',
            }}
          />
        </div>
        {nextLevel ? (
          <p className="text-xs text-right mt-2" style={{ color: 'var(--text-muted)' }}>
            {xpToNextLevel} XP to {nextLevel.name}
          </p>
        ) : (
          <p className="text-xs text-right mt-2" style={{ color: 'var(--amber)' }}>
            🏆 Max Level!
          </p>
        )}
      </div>

      {/* Primary CTA */}
      <Link
        href="/generate"
        className="btn-game btn-game-green block w-full text-center rounded-2xl py-5 mb-5 text-xl font-extrabold"
      >
        Get Today&apos;s Set ⚡
      </Link>

      {/* Recent activity */}
      {recentWorkouts.length > 0 && (
        <section className="mb-5">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-text-secondary mb-3">
            Recent Activity
          </h2>
          <div className="space-y-2">
            {recentWorkouts.map(workout => {
              const set = recentSets.find(s => s.id === workout.generated_set_id)
              const energyEmoji: Record<string, string> = {
                aerobic: '💨', threshold: '⚡', anaerobic: '🔥', speed: '🚀',
              }
              const emoji = energyEmoji[set?.energy_system ?? ''] ?? '🏊'
              return (
                <div
                  key={workout.id}
                  className="rounded-xl px-4 py-3 flex items-center justify-between"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{emoji}</span>
                    <div>
                      <p className="text-sm font-medium text-text-primary capitalize">
                        {set?.energy_system ?? 'Workout'}
                      </p>
                      <p className="text-xs text-text-secondary">
                        {new Date(workout.completed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        {workout.duration_min ? ` · ${workout.duration_min} min` : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className="text-xs font-bold px-2 py-1 rounded-full"
                      style={{ background: 'rgba(255,184,0,0.12)', color: 'var(--amber)' }}
                    >
                      +{workout.xp_earned} XP
                    </span>
                    {workout.rating === 'thumbs_up' && <span>👍</span>}
                    {workout.rating === 'thumbs_down' && <span>👎</span>}
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* Badges */}
      {earnedBadges.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-text-secondary mb-3">
            Badges
          </h2>
          <div className="flex flex-wrap gap-2">
            {earnedBadges.map(badge => (
              <span
                key={badge.id}
                title={badge.description}
                className="rounded-full px-3 py-1 text-xs font-semibold"
                style={{
                  background: 'rgba(255,184,0,0.12)',
                  color: 'var(--amber)',
                  border: '1px solid rgba(255,184,0,0.25)',
                }}
              >
                🏅 {badge.name}
              </span>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
