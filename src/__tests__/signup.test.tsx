import { render, screen } from '@testing-library/react'
import SignupPage from '../app/(auth)/signup/page'

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}))

jest.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      signUp: jest.fn().mockResolvedValue({ error: null }),
    },
  }),
}))

describe('SignupPage', () => {
  it('renders email and password inputs', () => {
    render(<SignupPage />)
    expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('At least 6 characters')).toBeInTheDocument()
  })

  it('renders create account button', () => {
    render(<SignupPage />)
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument()
  })
})
