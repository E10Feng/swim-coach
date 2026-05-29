import { render, screen, fireEvent } from '@testing-library/react'
import OnboardingPage from '../app/(app)/onboarding/page'

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
  redirect: jest.fn(),
}))

jest.mock('../app/(app)/onboarding/actions', () => ({
  saveProfile: jest.fn().mockResolvedValue(undefined),
}))

describe('OnboardingPage', () => {
  it('renders the first quiz step', () => {
    render(<OnboardingPage />)
    expect(screen.getByText(/what kind of swimmer are you/i)).toBeInTheDocument()
  })

  it('advances to next step when a single-select option is clicked', () => {
    render(<OnboardingPage />)
    fireEvent.click(screen.getByRole('button', { name: /recreational adult/i }))
    expect(screen.getByText(/what's your main goal/i)).toBeInTheDocument()
  })

  it('requires at least one stroke before advancing from strokes step', () => {
    render(<OnboardingPage />)
    // advance past experience and goal
    fireEvent.click(screen.getByRole('button', { name: /recreational adult/i }))
    fireEvent.click(screen.getByRole('button', { name: /fitness & health/i }))
    // now on strokes step — continue button should be disabled
    expect(screen.getByRole('button', { name: /continue/i })).toBeDisabled()
  })

  it('enables continue on strokes step after selecting a stroke', () => {
    render(<OnboardingPage />)
    fireEvent.click(screen.getByRole('button', { name: /recreational adult/i }))
    fireEvent.click(screen.getByRole('button', { name: /fitness & health/i }))
    fireEvent.click(screen.getByRole('checkbox', { name: /freestyle/i }))
    expect(screen.getByRole('button', { name: /continue/i })).toBeEnabled()
  })

  it('renders meet coach step after all quiz steps', () => {
    render(<OnboardingPage />)
    // experience
    fireEvent.click(screen.getByRole('button', { name: /recreational adult/i }))
    // goal
    fireEvent.click(screen.getByRole('button', { name: /fitness & health/i }))
    // strokes
    fireEvent.click(screen.getByRole('checkbox', { name: /freestyle/i }))
    fireEvent.click(screen.getByRole('button', { name: /continue/i }))
    // duration
    fireEvent.click(screen.getByRole('button', { name: /45 min/i }))
    // days
    fireEvent.click(screen.getByRole('button', { name: /3x \/ week/i }))
    // pool format
    fireEvent.click(screen.getByRole('button', { name: /25 yards/i }))
    // notes — skip
    fireEvent.click(screen.getByRole('button', { name: /skip/i }))
    // should now be on meet coach
    expect(screen.getByText(/meet coach alex/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /let's swim!/i })).toBeInTheDocument()
  })
})
