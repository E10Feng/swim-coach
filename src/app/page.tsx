import Link from 'next/link'

export default function HomePage() {
  return (
    <div>
      <h1>Swim Coach</h1>
      <p>Expert swim training, personalized for you.</p>
      <Link href="/signup">Get started</Link>
      <Link href="/login">Sign in</Link>
    </div>
  )
}
