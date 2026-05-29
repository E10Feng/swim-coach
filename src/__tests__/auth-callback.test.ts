/**
 * @jest-environment node
 */
import { GET } from '../app/auth/callback/route'

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn().mockResolvedValue({
    auth: {
      exchangeCodeForSession: jest.fn().mockResolvedValue({ error: null }),
    },
  }),
}))

describe('GET /auth/callback', () => {
  it('redirects to /dashboard when code exchange succeeds', async () => {
    const request = new Request('http://localhost:3000/auth/callback?code=abc123')
    const response = await GET(request)
    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toBe('http://localhost:3000/dashboard')
  })

  it('redirects to /login with error param when no code provided', async () => {
    const request = new Request('http://localhost:3000/auth/callback')
    const response = await GET(request)
    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toContain('/login')
    expect(response.headers.get('location')).toContain('error=')
  })
})
