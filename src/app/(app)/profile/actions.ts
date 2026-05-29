'use server'

import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { stripe } from '@/lib/stripe'
import { revalidatePath } from 'next/cache'

export async function cancelSubscription(): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const { data: profile } = await supabaseAdmin
    .from('user_profiles')
    .select('stripe_customer_id, subscription_status')
    .eq('user_id', user.id)
    .single()

  if (!profile?.stripe_customer_id) {
    return { error: 'No Stripe customer found' }
  }

  if (profile.subscription_status !== 'paid') {
    return { error: 'No active subscription to cancel' }
  }

  const subscriptions = await stripe.subscriptions.list({
    customer: profile.stripe_customer_id,
    status: 'active',
    limit: 1,
  })

  if (subscriptions.data.length === 0) {
    return { error: 'No active Stripe subscription found' }
  }

  await stripe.subscriptions.update(subscriptions.data[0].id, {
    cancel_at_period_end: true,
  })

  revalidatePath('/profile')
  return { success: true }
}
