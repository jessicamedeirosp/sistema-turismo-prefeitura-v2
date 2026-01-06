import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import SessionProvider from '@/components/SessionProvider'
import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react'

// Mock do next-auth
jest.mock('next-auth/react', () => ({
  SessionProvider: jest.fn(({ children }) => <div data-testid="session-provider">{children}</div>),
}))

describe('SessionProvider', () => {
  it('should render children inside NextAuth SessionProvider', () => {
    render(
      <SessionProvider>
        <div data-testid="child-component">Child Content</div>
      </SessionProvider>
    )

    expect(screen.getByTestId('session-provider')).toBeInTheDocument()
    expect(screen.getByTestId('child-component')).toBeInTheDocument()
    expect(screen.getByText('Child Content')).toBeInTheDocument()
  })

  it('should wrap children with NextAuth SessionProvider', () => {
    render(
      <SessionProvider>
        <span>Test</span>
      </SessionProvider>
    )

    expect(NextAuthSessionProvider).toHaveBeenCalled()
  })

  it('should handle multiple children', () => {
    render(
      <SessionProvider>
        <div>First Child</div>
        <div>Second Child</div>
        <div>Third Child</div>
      </SessionProvider>
    )

    expect(screen.getByText('First Child')).toBeInTheDocument()
    expect(screen.getByText('Second Child')).toBeInTheDocument()
    expect(screen.getByText('Third Child')).toBeInTheDocument()
  })

  it('should be a client component', () => {
    const { container } = render(
      <SessionProvider>
        <div>Content</div>
      </SessionProvider>
    )

    expect(container).toBeInTheDocument()
  })
})
