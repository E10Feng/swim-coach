/**
 * @jest-environment node
 */
const mockConstructEvent = jest.fn()
const mockEq = jest.fn().mockResolvedValue({ error: null })
const mockUpdate = jest.fn().mockReturnValue({ eq: mockEq })

jest.mock('@/lib/stripe', () => ({
  stripe: { webhooks: { constructEvent: (...args: unknown[]) => mockConstructEvent(...args) } },
}))

jest.mock('@/lib/supabase/admin', () => ({
  supabaseAdmin: { from: jest.fn(() => ({ update: (...args: unknown[]) => mockUpdate(...args) })) },
}))

import { POST } from '../app/api/stripe/webhook/route'

function makeSubscriptionEvent(type: string, status: string, userId: string) {
  return {
    type,
    data: { object: { id: 'sub_123', status, metadata: { supabase_user_id: userId } } },
  }
}

function makeRequest(body: string) {
  return {
    text: jest.fn().mockResolvedValue(body),
    headers: { get: jest.fn().mockReturnValue('test-sig') },
  } as unknown as Request
}

describe('POST /api/stripe/webhook', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns 400 when signature verification fails', async () => {
    mockConstructEvent.mockImplementation(() => { throw new Error('Invalid signature') })
    const res = await POST(makeRequest('{}'))
    expect(res.status).toBe(400)
  })

  it('sets subscription_status to paid on subscription.created with active status', async () => {
    const event = makeSubscriptionEvent('customer.subscription.created', 'active', 'user-abc')
    mockConstructEvent.mockReturnValue(event)
    const res = await POST(makeRequest(JSON.stringify(event)))
    expect(res.status).toBe(200)
    expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({ subscription_status: 'paid' }))
  })

  it('sets subscription_status to free on subscription.deleted', async () => {
    const event = makeSubscriptionEvent('customer.subscription.deleted', 'canceled', 'user-abc')
    mockConstructEvent.mockReturnValue(event)
    const res = await POST(makeRequest(JSON.stringify(event)))
    expect(res.status).toBe(200)
    expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({ subscription_status: 'free' }))
  })

  it('sets paid when subscription.updated has active status', async () => {
    const event = makeSubscriptionEvent('customer.subscription.updated', 'active', 'user-abc')
    mockConstructEvent.mockReturnValue(event)
    const res = await POST(makeRequest(JSON.stringify(event)))
    expect(res.status).toBe(200)
    expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({ subscription_status: 'paid' }))
  })

  it('sets free when subscription.updated has past_due status', async () => {
    const event = makeSubscriptionEvent('customer.subscription.updated', 'past_due', 'user-abc')
    mockConstructEvent.mockReturnValue(event)
    const res = await POST(makeRequest(JSON.stringify(event)))
    expect(res.status).toBe(200)
    expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({ subscription_status: 'free' }))
  })

  it('returns 200 and ignores unhandled event types', async () => {
    const event = { type: 'payment_intent.created', data: { object: {} } }
    mockConstructEvent.mockReturnValue(event)
    const res = await POST(makeRequest(JSON.stringify(event)))
    expect(res.status).toBe(200)
    expect(mockUpdate).not.toHaveBeenCalled()
  })
})
