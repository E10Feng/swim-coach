'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function adminLogin(
  _prevState: string | null,
  formData: FormData
): Promise<string | null> {
  const password = formData.get('password')
  const expected = process.env.ADMIN_PASSWORD

  if (!expected) {
    return 'ADMIN_PASSWORD env var is not set'
  }

  if (typeof password !== 'string' || password !== expected) {
    return 'Incorrect password'
  }

  const cookieStore = await cookies()
  cookieStore.set('admin_session', 'authenticated', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 8,
    path: '/',
  })

  redirect('/admin')
}

export async function adminLogout(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete('admin_session')
  redirect('/admin/login')
}
