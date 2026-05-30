import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import BottomTabBar from './BottomTabBar'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="flex flex-col min-h-[100dvh] bg-bg">
      <main className="flex-1 overflow-y-auto" style={{ paddingBottom: '80px' }}>
        {children}
      </main>
      <BottomTabBar />
    </div>
  )
}
