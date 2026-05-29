/**
 * @jest-environment node
 */
import { middleware } from '../middleware'
import { NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

jest.mock('@/lib/supabase/middleware', () => ({
  updateSession: jest.fn().mockResolvedValue(new Response()),
}))

describe('middleware', () => {
  it('delegates to updateSession', async () => {
    const request = new NextRequest('http://localhost:3000/dashboard')
    await middleware(request)
    expect(updateSession).toHaveBeenCalledWith(request)
  })
})
