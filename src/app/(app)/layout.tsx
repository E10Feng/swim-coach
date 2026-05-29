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
    <div className="min-h-screen flex flex-col">
      <nav className="border-b border-gray-100 bg-white px-4 py-3 flex gap-5 text-sm text-gray-700">
        <Link href="/dashboard" className="hover:text-black">Dashboard</Link>
        <Link href="/generate" className="hover:text-black">Generate</Link>
        <Link href="/history" className="hover:text-black">History</Link>
        <Link href="/insights" className="hover:text-black">Insights</Link>
        <Link href="/profile" className="hover:text-black">Profile</Link>
      </nav>
      <main className="flex-1">{children}</main>
    </div>
  )
}
