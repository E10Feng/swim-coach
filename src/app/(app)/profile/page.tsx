import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { cancelSubscription } from './actions'

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ upgraded?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('subscription_status, stripe_customer_id')
    .eq('user_id', user.id)
    .single()

  const isPaid = profile?.subscription_status === 'paid'
  const params = await searchParams
  const justUpgraded = params.upgraded === '1'

  return (
    <div className="max-w-lg mx-auto px-4 py-8 space-y-4">
      <h1
        className="text-2xl font-bold text-text-primary"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        Profile
      </h1>

      {justUpgraded && (
        <div
          className="rounded-2xl border px-4 py-3 text-sm font-medium"
          style={{ borderColor: 'var(--green)', color: 'var(--green)', background: 'rgba(88,204,2,0.08)' }}
        >
          🎉 You&apos;re now on the Pro plan. Welcome aboard!
        </div>
      )}

      {/* Email */}
      <div
        className="rounded-2xl p-4"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
      >
        <p className="text-xs font-semibold uppercase tracking-widest text-text-secondary mb-1">Email</p>
        <p className="text-sm font-medium text-text-primary">{user.email}</p>
      </div>

      {/* Subscription */}
      <div
        className="rounded-2xl p-5 space-y-4"
        style={{
          background: 'var(--surface)',
          border: `2px solid ${isPaid ? 'var(--amber)' : 'var(--border)'}`,
        }}
      >
        <div className="flex items-center gap-3">
          <p className="text-sm text-text-secondary">Current plan</p>
          <span
            className="rounded-full px-3 py-1 text-xs font-bold"
            style={{
              background: isPaid ? 'rgba(255,184,0,0.15)' : 'rgba(107,138,173,0.15)',
              color: isPaid ? 'var(--amber)' : 'var(--text-secondary)',
            }}
          >
            {isPaid ? '⭐ Pro' : 'Free'}
          </span>
        </div>

        {!isPaid && (
          <div className="space-y-3">
            <p className="text-sm text-text-secondary leading-relaxed">
              Free tier: 3 AI sets per week. Upgrade for unlimited sets, full insights, and complete training history.
            </p>
            <form action="/api/stripe/checkout" method="POST">
              <button
                type="submit"
                className="btn-game btn-game-amber w-full rounded-2xl py-3.5 text-base font-bold"
              >
                ⭐ Upgrade to Pro — $12/mo
              </button>
            </form>
          </div>
        )}

        {isPaid && (
          <div className="space-y-3">
            <p className="text-sm text-text-secondary leading-relaxed">
              Pro plan active. Unlimited sets, full insights, complete training history. 🏆
            </p>
            <form action={async () => { 'use server'; await cancelSubscription() }}>
              <button
                type="submit"
                className="w-full rounded-2xl py-3 text-sm font-semibold transition-all hover:opacity-80"
                style={{ border: '1px solid var(--coral)', color: 'var(--coral)', background: 'rgba(255,107,107,0.06)' }}
              >
                Cancel subscription
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Sign out */}
      <form action="/auth/signout" method="POST">
        <button
          type="submit"
          className="text-sm underline"
          style={{ color: 'var(--text-muted)' }}
        >
          Sign out
        </button>
      </form>
    </div>
  )
}
