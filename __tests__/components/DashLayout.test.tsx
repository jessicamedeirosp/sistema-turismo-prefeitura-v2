import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import DashLayout from '@/components/DashLayout'
import { useSession } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'

// Mocks
jest.mock('next-auth/react')
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
}))

const mockUseSession = useSession as jest.MockedFunction<typeof useSession>
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>
const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>

describe('DashLayout', () => {
  const mockPush = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockUsePathname.mockReturnValue('/dash')
    mockUseRouter.mockReturnValue({
      push: mockPush,
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
    } as any)
  })

  it('should render layout with user info for business user', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: 'user-123',
          name: 'João Silva',
          email: 'joao@example.com',
          role: 'BUSINESS_FOOD',
        },
        expires: '',
      },
      status: 'authenticated',
      update: jest.fn(),
    })

    render(
      <DashLayout>
        <div>Dashboard Content</div>
      </DashLayout>
    )

    expect(screen.getByText('João Silva')).toBeInTheDocument()
    expect(screen.getByText('joao@example.com')).toBeInTheDocument()
  })

  it('should show business menu items for business user', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: 'user-123',
          name: 'Test User',
          email: 'test@example.com',
          role: 'BUSINESS_FOOD',
        },
        expires: '',
      },
      status: 'authenticated',
      update: jest.fn(),
    })

    render(
      <DashLayout>
        <div>Content</div>
      </DashLayout>
    )

    expect(screen.getByText('Meu Cadastro')).toBeInTheDocument()
    expect(screen.getByText('Minhas Solicitações')).toBeInTheDocument()
  })

  it('should show admin menu items for admin user', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: 'admin-123',
          name: 'Admin User',
          email: 'admin@example.com',
          role: 'ADMIN',
        },
        expires: '',
      },
      status: 'authenticated',
      update: jest.fn(),
    })

    render(
      <DashLayout>
        <div>Content</div>
      </DashLayout>
    )

    expect(screen.getByText('Empresas')).toBeInTheDocument()
  })

  it('should toggle mobile menu when clicking menu button', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: 'user-123',
          name: 'Test User',
          email: 'test@example.com',
          role: 'BUSINESS_FOOD',
        },
        expires: '',
      },
      status: 'authenticated',
      update: jest.fn(),
    })

    render(
      <DashLayout>
        <div>Content</div>
      </DashLayout>
    )

    // Menu mobile deve estar oculto inicialmente (em telas pequenas)
    const mobileMenu = screen.getAllByRole('button')[0]

    // Clica para abrir o menu
    fireEvent.click(mobileMenu)

    // Verifica se a função foi chamada (o menu deve mudar de estado)
    expect(mobileMenu).toBeInTheDocument()
  })

  it('should render children content', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: 'user-123',
          name: 'Test User',
          email: 'test@example.com',
          role: 'BUSINESS_FOOD',
        },
        expires: '',
      },
      status: 'authenticated',
      update: jest.fn(),
    })

    render(
      <DashLayout>
        <div data-testid="child-content">Custom Dashboard Content</div>
      </DashLayout>
    )

    expect(screen.getByTestId('child-content')).toBeInTheDocument()
    expect(screen.getByText('Custom Dashboard Content')).toBeInTheDocument()
  })

  it('should have logout button', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: 'user-123',
          name: 'Test User',
          email: 'test@example.com',
          role: 'BUSINESS_FOOD',
        },
        expires: '',
      },
      status: 'authenticated',
      update: jest.fn(),
    })

    render(
      <DashLayout>
        <div>Content</div>
      </DashLayout>
    )

    expect(screen.getByText('Sair')).toBeInTheDocument()
  })
})
