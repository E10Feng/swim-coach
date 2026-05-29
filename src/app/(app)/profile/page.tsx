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
    <div className="max-w-lg mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-bold">Profile</h1>

      {justUpgraded && (
        <div className="rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-green-800 text-sm">
          You are now on the Pro plan. Welcome aboard!
        </div>
      )}

      <div className="rounded-xl border border-gray-100 bg-white px-5 py-4 space-y-2">
        <p className="text-sm text-gray-500">Email</p>
        <p className="text-sm font-medium text-gray-900">{user.email}</p>
      </div>

      <div className="rounded-xl border border-gray-100 bg-white px-5 py-4 space-y-4">
        <div className="flex items-center gap-3">
          <p className="text-sm text-gray-500">Current plan</p>
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${isPaid ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
            {isPaid ? 'Pro' : 'Free'}
          </span>
        </div>

        {!isPaid && (
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              Free tier: 3 AI sets per week. Upgrade for unlimited sets, full insights, and complete history.
            </p>
            <form action="/api/stripe/checkout" method="POST">
              <button type="submit" className="rounded-full bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700">
                Upgrade to Pro — $12/mo
              </button>
            </form>
          </div>
        )}

        {isPaid && (
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              Pro plan active. You have unlimited sets, full insights, and complete history.
            </p>
            <form action={async () => { 'use server'; await cancelSubscription() }}>
              <button type="submit" className="rounded-full border border-red-200 bg-red-50 px-5 py-2 text-sm font-medium text-red-600 hover:bg-red-100">
                Cancel subscription
              </button>
            </form>
          </div>
        )}
      </div>

      <form action="/auth/signout" method="POST">
        <button type="submit" className="text-sm text-gray-500 hover:text-gray-700 underline">
          Sign out
        </button>
      </form>
    </div>
  )
}
