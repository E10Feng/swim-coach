import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
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

function NavBar() {
  return (
    <header className="sticky top-0 z-20 bg-white/80 backdrop-blur border-b border-gray-100">
      <div className="mx-auto max-w-5xl px-4 h-14 flex items-center justify-between">
        <span className="font-bold text-lg tracking-tight">Swim Coach</span>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/login" className="text-gray-600 hover:text-gray-900">Sign in</Link>
          <Link href="/signup" className="rounded-full bg-blue-600 px-4 py-1.5 text-white text-sm font-medium hover:bg-blue-700">
            Get started free
          </Link>
        </nav>
      </div>
    </header>
  )
}

function Hero() {
  return (
    <section className="mx-auto max-w-3xl px-4 pt-24 pb-16 text-center">
      <h1 className="text-5xl font-extrabold leading-tight tracking-tight text-gray-900 sm:text-6xl">
        Train smarter.<br />
        <span className="text-blue-600">Swim faster.</span>
      </h1>
      <p className="mt-6 text-xl text-gray-600 max-w-xl mx-auto">
        AI-powered swim sets built around your goals, your schedule, and your
        fitness level — not a generic plan designed for someone else.
      </p>
      <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
        <Link href="/signup" className="rounded-full bg-blue-600 px-7 py-3 text-base font-semibold text-white hover:bg-blue-700 shadow-sm">
          Start free — no credit card
        </Link>
        <Link href="/login" className="rounded-full border border-gray-200 px-7 py-3 text-base font-semibold text-gray-700 hover:border-gray-300 hover:bg-gray-50">
          Sign in
        </Link>
      </div>
    </section>
  )
}

function HowItWorks() {
  const steps = [
    { number: '1', title: 'Tell us about yourself', description: 'Answer a quick 2-minute quiz: your experience level, goals, strokes, and how long you like to swim.' },
    { number: '2', title: 'Get your personalized set', description: 'Our AI coach picks the right workout from our expert-curated database and adapts it to your session — energy level, time available, and focus for the day.' },
    { number: '3', title: 'Track and improve', description: 'Log completions, earn XP and badges, and watch your training balance improve week over week.' },
  ]
  return (
    <section className="bg-gray-50 py-20">
      <div className="mx-auto max-w-4xl px-4">
        <h2 className="text-3xl font-bold text-center mb-12">How it works</h2>
        <ol className="grid gap-8 sm:grid-cols-3">
          {steps.map(s => (
            <li key={s.number} className="flex flex-col gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white font-bold text-lg">{s.number}</span>
              <h3 className="text-lg font-semibold">{s.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{s.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

function ValueProps() {
  const props = [
    { icon: '🏊', title: 'Expert sets', body: 'Every workout is drawn from a coach-curated database — not hallucinated on the fly.' },
    { icon: '🎯', title: 'Actually personalized', body: 'Your stroke preferences, energy level, and session length shape every set you get.' },
    { icon: '🔥', title: 'Streak & XP system', body: "Duolingo-style gamification keeps you coming back — even when the pool's cold." },
    { icon: '📊', title: 'Training balance insights', body: 'See your aerobic vs. speed mix, consistency score, and volume trends over time.' },
  ]
  return (
    <section className="py-20">
      <div className="mx-auto max-w-4xl px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Everything your coach should tell you</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          {props.map(p => (
            <div key={p.title} className="rounded-2xl border border-gray-100 bg-white px-6 py-5 shadow-sm">
              <div className="text-3xl mb-3">{p.icon}</div>
              <h3 className="text-base font-semibold mb-1">{p.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{p.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Pricing() {
  return (
    <section className="bg-gray-50 py-20">
      <div className="mx-auto max-w-3xl px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Simple pricing</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="rounded-2xl border border-gray-200 bg-white px-6 py-7 flex flex-col gap-4">
            <div>
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Free</p>
              <p className="mt-1 text-4xl font-extrabold">$0</p>
              <p className="text-sm text-gray-500 mt-1">Forever free</p>
            </div>
            <ul className="space-y-2 text-sm text-gray-700 flex-1">
              <li className="flex gap-2"><Checkmark />3 AI sets per week</li>
              <li className="flex gap-2"><Checkmark />Full streak & XP system</li>
              <li className="flex gap-2"><Checkmark />All badges</li>
              <li className="flex gap-2"><Checkmark />Last 4 weeks of history</li>
              <li className="flex gap-2 text-gray-400"><Cross />Insights (blurred)</li>
              <li className="flex gap-2 text-gray-400"><Cross />Full history</li>
            </ul>
            <Link href="/signup" className="rounded-full border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 text-center hover:border-gray-300 hover:bg-gray-50">
              Get started free
            </Link>
          </div>
          <div className="rounded-2xl border-2 border-blue-600 bg-white px-6 py-7 flex flex-col gap-4 shadow-md">
            <div>
              <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide">Pro</p>
              <p className="mt-1 text-4xl font-extrabold">$12</p>
              <p className="text-sm text-gray-500 mt-1">per month</p>
            </div>
            <ul className="space-y-2 text-sm text-gray-700 flex-1">
              <li className="flex gap-2"><Checkmark />Unlimited AI sets</li>
              <li className="flex gap-2"><Checkmark />Full streak & XP system</li>
              <li className="flex gap-2"><Checkmark />All badges</li>
              <li className="flex gap-2"><Checkmark />Full workout history</li>
              <li className="flex gap-2"><Checkmark />Training balance insights</li>
              <li className="flex gap-2"><Checkmark />Monthly trend analysis</li>
            </ul>
            <Link href="/signup" className="rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white text-center hover:bg-blue-700">
              Start free trial
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

function Checkmark() {
  return <span className="mt-0.5 flex-shrink-0 text-green-500 font-bold" aria-hidden>✓</span>
}

function Cross() {
  return <span className="mt-0.5 flex-shrink-0 text-gray-300 font-bold" aria-hidden>✗</span>
}

function Footer() {
  return (
    <footer className="border-t border-gray-100 py-8">
      <div className="mx-auto max-w-5xl px-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-gray-500">
        <span>© {new Date().getFullYear()} Swim Coach. All rights reserved.</span>
        <div className="flex gap-4">
          <Link href="/login" className="hover:text-gray-700">Sign in</Link>
          <Link href="/signup" className="hover:text-gray-700">Sign up</Link>
        </div>
      </div>
    </footer>
  )
}
