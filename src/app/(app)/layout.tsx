import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import NavLinks from './NavLinks'

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
    <div className="min-h-screen flex flex-col bg-bg">
      <nav
        className="border-b px-4 py-2 flex items-center gap-2 flex-wrap"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
      >
        <Link
          href="/dashboard"
          className="text-base font-bold tracking-tight mr-3 text-accent flex-shrink-0"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          SWIM COACH
        </Link>
        <NavLinks />
      </nav>
      <main className="flex-1">{children}</main>
    </div>
  )
}
