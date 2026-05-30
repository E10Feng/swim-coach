'use client'

import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }
    router.push('/dashboard')
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-bg px-4">
      <a
        href="/"
        className="mb-8 text-2xl font-bold tracking-tight text-accent"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        SWIMIFY
      </a>

      <div
        className="w-full max-w-sm rounded-2xl border p-8"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
      >
        <h1
          className="mb-6 text-2xl font-bold text-text-primary"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          SIGN IN
        </h1>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-text-secondary">
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full rounded-lg border bg-bg px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted transition-colors focus:outline-none"
              style={{ borderColor: 'var(--border)' }}
              onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
              onBlur={e => (e.target.style.borderColor = 'var(--border)')}
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-text-secondary">
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full rounded-lg border bg-bg px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted transition-colors focus:outline-none"
              style={{ borderColor: 'var(--border)' }}
              onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
              onBlur={e => (e.target.style.borderColor = 'var(--border)')}
            />
          </div>

          {error && (
            <p role="alert" className="rounded-lg border px-3 py-2 text-sm" style={{ borderColor: 'var(--error)', color: 'var(--error)', background: 'rgba(248,113,113,0.08)' }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full py-2.5 text-sm font-semibold text-bg transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 mt-2"
            style={{ background: 'var(--accent)' }}
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-text-secondary">
          No account?{' '}
          <a href="/signup" className="text-accent hover:underline">
            Create one free
          </a>
        </p>
      </div>
    </div>
  )
}
