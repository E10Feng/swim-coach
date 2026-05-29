import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-bg text-text-primary">
      <NavBar />
      <main>
        <Hero />
        <HowItWorks />
        <ValueProps />
        <Pricing />
      </main>
      <Footer />
    </div>
  )
}

// ─── NavBar ──────────────────────────────────────────────────────────────────

function NavBar() {
  return (
    <header className="sticky top-0 z-20 border-b bg-bg/90 backdrop-blur-md"
      style={{ borderColor: 'var(--border)' }}>
      <div className="mx-auto max-w-5xl px-4 h-14 flex items-center justify-between">
        <span
          className="text-xl font-bold tracking-tight text-accent"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          SWIM COACH
        </span>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/login" className="text-text-secondary hover:text-text-primary transition-colors">
            Sign in
          </Link>
          <Link
            href="/signup"
            className="rounded-full px-4 py-1.5 text-sm font-semibold text-bg transition-all hover:scale-105"
            style={{ background: 'var(--accent)' }}
          >
            Get started free
          </Link>
        </nav>
      </div>
    </header>
  )
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-y-0 right-0 w-px opacity-20"
        style={{ background: 'linear-gradient(to bottom, transparent, var(--accent), transparent)' }} />
      <div className="pointer-events-none absolute inset-y-0 right-8 w-px opacity-10"
        style={{ background: 'linear-gradient(to bottom, transparent, var(--accent), transparent)' }} />
      <div className="pointer-events-none absolute inset-y-0 right-16 w-px opacity-5"
        style={{ background: 'linear-gradient(to bottom, transparent, var(--accent), transparent)' }} />

      <div className="mx-auto max-w-5xl px-4 pt-24 pb-20">
        <div className="max-w-2xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs text-text-secondary"
            style={{ borderColor: 'var(--border)' }}>
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            AI-powered coaching
          </div>
          <h1
            className="text-6xl font-bold leading-none tracking-tight text-text-primary sm:text-7xl"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            TRAIN SMARTER.
            <br />
            <span style={{ color: 'var(--accent)' }}>SWIM FASTER.</span>
          </h1>
          <p className="mt-6 max-w-lg text-lg text-text-secondary leading-relaxed">
            Expert swim sets built around your goals, your schedule, and your fitness
            level — adapted by an AI coach who knows the water.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/signup"
              className="rounded-full px-7 py-3 text-base font-semibold text-bg transition-all hover:scale-105"
              style={{ background: 'var(--accent)' }}
            >
              Start free — no credit card
            </Link>
            <Link
              href="/login"
              className="rounded-full border px-7 py-3 text-base font-semibold text-text-secondary transition-colors hover:text-text-primary hover:border-accent"
              style={{ borderColor: 'var(--border)' }}
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── HowItWorks ───────────────────────────────────────────────────────────────

function HowItWorks() {
  const steps = [
    {
      number: '01',
      title: 'Tell us about yourself',
      description: 'A 2-minute quiz: experience level, goals, strokes, session length. Your profile shapes every set you receive.',
    },
    {
      number: '02',
      title: 'Get your set',
      description: 'Coach Alex picks the right workout from our expert-curated database and adapts it to your energy level and available time.',
    },
    {
      number: '03',
      title: 'Track and improve',
      description: 'Log completions, earn XP and badges, monitor your aerobic/speed balance week over week.',
    },
  ]

  return (
    <section className="border-y py-20" style={{ borderColor: 'var(--border)' }}>
      <div className="mx-auto max-w-5xl px-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-text-secondary">
          How it works
        </p>
        <h2
          className="mb-12 text-4xl font-bold text-text-primary"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          THREE LAPS TO YOUR FIRST SET
        </h2>
        <ol className="grid gap-6 sm:grid-cols-3">
          {steps.map(s => (
            <li
              key={s.number}
              className="rounded-xl border p-6 transition-colors hover:border-accent"
              style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
            >
              <span
                className="block text-4xl font-bold mb-4"
                style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}
              >
                {s.number}
              </span>
              <h3
                className="text-lg font-bold mb-2 text-text-primary"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {s.title.toUpperCase()}
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">{s.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

// ─── ValueProps ───────────────────────────────────────────────────────────────

function ValueProps() {
  const props = [
    { label: 'Expert sets', body: 'Every workout is drawn from a coach-curated database — not hallucinated on the fly.' },
    { label: 'Actually personalized', body: 'Your strokes, energy level, and session length shape every set you receive.' },
    { label: 'Streak & XP system', body: 'Duolingo-style gamification keeps you coming back — even when the pool is cold.' },
    { label: 'Training insights', body: 'See your aerobic vs. speed balance, consistency score, and volume trends.' },
  ]
  return (
    <section className="py-20">
      <div className="mx-auto max-w-5xl px-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-text-secondary">
          Why Swim Coach
        </p>
        <h2
          className="mb-12 text-4xl font-bold text-text-primary"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          EVERYTHING YOUR COACH SHOULD TELL YOU
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {props.map(p => (
            <div
              key={p.label}
              className="rounded-xl border p-6 transition-colors hover:border-accent"
              style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
            >
              <h3
                className="text-base font-bold mb-2 text-text-primary"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {p.label.toUpperCase()}
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">{p.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Pricing ─────────────────────────────────────────────────────────────────

function Pricing() {
  return (
    <section className="border-t py-20" style={{ borderColor: 'var(--border)' }}>
      <div className="mx-auto max-w-3xl px-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-text-secondary text-center">
          Pricing
        </p>
        <h2
          className="mb-12 text-4xl font-bold text-text-primary text-center"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          SIMPLE. NO SURPRISES.
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Free */}
          <div
            className="rounded-xl border p-6 flex flex-col gap-6"
            style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-text-secondary mb-1">Free</p>
              <p className="text-5xl font-bold text-text-primary" style={{ fontFamily: 'var(--font-display)' }}>$0</p>
              <p className="text-sm text-text-muted mt-1">Forever free</p>
            </div>
            <ul className="space-y-2.5 text-sm flex-1">
              <PricingItem included>3 AI sets per week</PricingItem>
              <PricingItem included>Full streak & XP system</PricingItem>
              <PricingItem included>All badges</PricingItem>
              <PricingItem included>Last 4 weeks of history</PricingItem>
              <PricingItem>Insights (blurred)</PricingItem>
              <PricingItem>Full history</PricingItem>
            </ul>
            <Link
              href="/signup"
              className="block w-full rounded-full border py-2.5 text-center text-sm font-semibold text-text-secondary transition-colors hover:text-text-primary hover:border-accent"
              style={{ borderColor: 'var(--border)' }}
            >
              Get started free
            </Link>
          </div>

          {/* Pro */}
          <div
            className="rounded-xl border-2 p-6 flex flex-col gap-6 relative"
            style={{ background: 'var(--surface)', borderColor: 'var(--accent)', boxShadow: '0 0 32px rgba(0,229,255,0.08)' }}
          >
            <div
              className="absolute -top-px left-6 right-6 h-px"
              style={{ background: 'var(--accent)' }}
            />
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--accent)' }}>Pro</p>
              <p className="text-5xl font-bold text-text-primary" style={{ fontFamily: 'var(--font-display)' }}>$12</p>
              <p className="text-sm text-text-muted mt-1">per month</p>
            </div>
            <ul className="space-y-2.5 text-sm flex-1">
              <PricingItem included>Unlimited AI sets</PricingItem>
              <PricingItem included>Full streak & XP system</PricingItem>
              <PricingItem included>All badges</PricingItem>
              <PricingItem included>Full workout history</PricingItem>
              <PricingItem included>Training balance insights</PricingItem>
              <PricingItem included>Monthly trend analysis</PricingItem>
            </ul>
            <Link
              href="/signup"
              className="block w-full rounded-full py-2.5 text-center text-sm font-semibold text-bg transition-all hover:scale-105"
              style={{ background: 'var(--accent)' }}
            >
              Start free trial
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

function PricingItem({ children, included = false }: { children: React.ReactNode; included?: boolean }) {
  return (
    <li className="flex items-center gap-2">
      <span
        className="flex-shrink-0 text-xs font-bold"
        style={{ color: included ? 'var(--success)' : 'var(--text-muted)' }}
      >
        {included ? '✓' : '✗'}
      </span>
      <span style={{ color: included ? 'var(--text-secondary)' : 'var(--text-muted)' }}>
        {children}
      </span>
    </li>
  )
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="border-t py-8" style={{ borderColor: 'var(--border)' }}>
      <div className="mx-auto max-w-5xl px-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-text-muted">
        <span
          className="font-bold text-text-secondary"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          SWIM COACH
        </span>
        <span>© {new Date().getFullYear()} Swim Coach. All rights reserved.</span>
        <div className="flex gap-4">
          <Link href="/login" className="hover:text-text-secondary transition-colors">Sign in</Link>
          <Link href="/signup" className="hover:text-text-secondary transition-colors">Sign up</Link>
        </div>
      </div>
    </footer>
  )
}
