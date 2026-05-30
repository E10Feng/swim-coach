'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

function IconHome({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      {active ? (
        <>
          <path d="M3 12L12 3L21 12V21H15V15H9V21H3V12Z" fill="currentColor" />
        </>
      ) : (
        <path d="M3 12L12 3L21 12V21H15V15H9V21H3V12Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      )}
    </svg>
  )
}

function IconZap({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      {active ? (
        <path d="M13 2L4.5 13.5H11.5L11 22L19.5 10.5H12.5L13 2Z" fill="currentColor" />
      ) : (
        <path d="M13 2L4.5 13.5H11.5L11 22L19.5 10.5H12.5L13 2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      )}
    </svg>
  )
}

function IconHistory({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      {active ? (
        <>
          <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12C2 17.523 6.477 22 12 22C17.523 22 22 17.523 22 12C22 6.477 17.523 2 12 2ZM13 7H11V13L16.5 16.5L17.5 14.83L13 12V7Z" fill="currentColor" />
        </>
      ) : (
        <>
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
          <path d="M12 7V12L16 14.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </>
      )}
    </svg>
  )
}

function IconChart({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      {active ? (
        <>
          <rect x="3" y="12" width="4" height="9" rx="1" fill="currentColor" />
          <rect x="10" y="7" width="4" height="14" rx="1" fill="currentColor" />
          <rect x="17" y="3" width="4" height="18" rx="1" fill="currentColor" />
        </>
      ) : (
        <>
          <rect x="3" y="12" width="4" height="9" rx="1" stroke="currentColor" strokeWidth="2" />
          <rect x="10" y="7" width="4" height="14" rx="1" stroke="currentColor" strokeWidth="2" />
          <rect x="17" y="3" width="4" height="18" rx="1" stroke="currentColor" strokeWidth="2" />
        </>
      )}
    </svg>
  )
}

function IconUser({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      {active ? (
        <>
          <circle cx="12" cy="8" r="4" fill="currentColor" />
          <path d="M4 20C4 16.686 7.582 14 12 14C16.418 14 20 16.686 20 20H4Z" fill="currentColor" />
        </>
      ) : (
        <>
          <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
          <path d="M4 20C4 16.686 7.582 14 12 14C16.418 14 20 16.686 20 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </>
      )}
    </svg>
  )
}

const TABS = [
  { href: '/dashboard', label: 'Home',     Icon: IconHome },
  { href: '/generate',  label: 'Train',    Icon: IconZap },
  { href: '/history',   label: 'History',  Icon: IconHistory },
  { href: '/insights',  label: 'Insights', Icon: IconChart },
  { href: '/profile',   label: 'Profile',  Icon: IconUser },
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
        borderRadius: '24px 24px 0 0',
      }}
    >
      {TABS.map(({ href, label, Icon }) => {
        const active = pathname.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            className="flex-1 flex flex-col items-center justify-center gap-1 transition-colors min-h-[44px]"
            style={{ color: active ? 'var(--green)' : 'var(--text-muted)' }}
          >
            <span
              className="transition-transform duration-150"
              style={{ transform: active ? 'scale(1.1)' : 'scale(1)' }}
            >
              <Icon active={active} />
            </span>
            <span
              className="font-semibold leading-none"
              style={{ fontSize: '10px', fontFamily: 'var(--font-body)' }}
            >
              {label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
