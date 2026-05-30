'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const TABS = [
  { href: '/dashboard', label: 'Home',     emoji: '🏠' },
  { href: '/generate',  label: 'Train',    emoji: '⚡' },
  { href: '/history',   label: 'History',  emoji: '📋' },
  { href: '/insights',  label: 'Insights', emoji: '📊' },
  { href: '/profile',   label: 'Profile',  emoji: '👤' },
]

export default function BottomTabBar() {
  const pathname = usePathname()
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex items-stretch"
      style={{
        background: 'var(--surface)',
        borderTop: '1px solid var(--border)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        height: '64px',
      }}
    >
      {TABS.map(tab => {
        const active = pathname.startsWith(tab.href)
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className="flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors min-h-[44px]"
            style={{ color: active ? 'var(--green)' : 'var(--text-muted)' }}
          >
            <span
              className="leading-none transition-transform duration-150"
              style={{ fontSize: '24px', transform: active ? 'scale(1.15)' : 'scale(1)' }}
            >
              {tab.emoji}
            </span>
            <span
              className="font-semibold leading-none"
              style={{ fontSize: '10px', fontFamily: 'var(--font-body)' }}
            >
              {tab.label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
