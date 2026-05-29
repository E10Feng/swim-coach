'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const LINKS = [
  { href: '/dashboard', label: 'Dashboard', emoji: '🏠' },
  { href: '/generate',  label: 'Generate',  emoji: '⚡' },
  { href: '/history',   label: 'History',   emoji: '📋' },
  { href: '/insights',  label: 'Insights',  emoji: '📊' },
  { href: '/profile',   label: 'Profile',   emoji: '👤' },
]

export default function NavLinks() {
  const pathname = usePathname()
  return (
    <>
      {LINKS.map(link => {
        const active = pathname.startsWith(link.href)
        return (
          <Link
            key={link.href}
            href={link.href}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all"
            style={{
              background: active ? 'var(--green)' : 'transparent',
              color: active ? 'white' : 'var(--text-secondary)',
              boxShadow: active ? '0 3px 0 var(--green-dark)' : 'none',
            }}
          >
            <span>{link.emoji}</span>
            <span className="hidden sm:inline">{link.label}</span>
          </Link>
        )
      })}
    </>
  )
}
