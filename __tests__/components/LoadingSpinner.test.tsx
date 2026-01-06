import { render, screen } from '@testing-library/react'
import LoadingSpinner from '@/components/LoadingSpinner'

describe('LoadingSpinner', () => {
  it('renderiza com mensagem padrão', () => {
    render(<LoadingSpinner />)
    expect(screen.getByText('Carregando...')).toBeInTheDocument()
  })

  it('renderiza com mensagem customizada', () => {
    render(<LoadingSpinner message="Buscando dados..." />)
    expect(screen.getByText('Buscando dados...')).toBeInTheDocument()
  })

  it('renderiza o spinner de loading', () => {
    const { container } = render(<LoadingSpinner />)
    const spinner = container.querySelector('.animate-spin')
    expect(spinner).toBeInTheDocument()
  })
})
