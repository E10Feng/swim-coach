import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

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
        className="border-b px-4 py-3 flex items-center gap-6 text-sm"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
      >
        <Link
          href="/dashboard"
          className="text-base font-bold tracking-tight mr-4 text-accent"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          SWIM COACH
        </Link>
        {[
          { href: '/dashboard', label: 'Dashboard' },
          { href: '/generate', label: 'Generate' },
          { href: '/history', label: 'History' },
          { href: '/insights', label: 'Insights' },
          { href: '/profile', label: 'Profile' },
        ].map(link => (
          <Link
            key={link.href}
            href={link.href}
            className="text-text-secondary hover:text-text-primary transition-colors"
          >
            {link.label}
          </Link>
        ))}
      </nav>
      <main className="flex-1">{children}</main>
    </div>
  )
}
