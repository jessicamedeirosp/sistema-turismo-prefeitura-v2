import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import ErrorBoundaryClient from '@/components/ErrorBoundaryClient'

// Componente que sempre lança erro
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error')
  }
  return <div>No error</div>
}

describe('ErrorBoundaryClient', () => {
  // Silencia os erros no console durante os testes
  const originalError = console.error
  beforeAll(() => {
    console.error = jest.fn()
  })
  afterAll(() => {
    console.error = originalError
  })

  it('should render children when there is no error', () => {
    render(
      <ErrorBoundaryClient>
        <div data-testid="child">Child Component</div>
      </ErrorBoundaryClient>
    )

    expect(screen.getByTestId('child')).toBeInTheDocument()
    expect(screen.getByText('Child Component')).toBeInTheDocument()
  })

  it('should not crash when children are null', () => {
    render(
      <ErrorBoundaryClient>
        {null}
      </ErrorBoundaryClient>
    )

    expect(screen.queryByText('Algo deu errado.')).not.toBeInTheDocument()
  })

  it('should handle multiple children', () => {
    render(
      <ErrorBoundaryClient>
        <div>Child 1</div>
        <div>Child 2</div>
      </ErrorBoundaryClient>
    )

    expect(screen.getByText('Child 1')).toBeInTheDocument()
    expect(screen.getByText('Child 2')).toBeInTheDocument()
  })
})
