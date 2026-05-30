import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { adminLogout } from './login/actions'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const session = cookieStore.get('admin_session')
  const isAuthenticated = session?.value === 'authenticated'

  if (!isAuthenticated) {
    redirect('/admin/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <a href="/admin" className="font-semibold text-gray-900 hover:text-blue-600">
          Swimify Admin
        </a>
        <form action={adminLogout}>
          <button
            type="submit"
            className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            Log out
          </button>
        </form>
      </header>
      <main className="max-w-5xl mx-auto px-6 py-8">{children}</main>
    </div>
  )
}
