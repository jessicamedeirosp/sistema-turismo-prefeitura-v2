import { render, screen, fireEvent } from '@testing-library/react'
import RejectModal from '@/components/RejectModal'

describe('RejectModal', () => {
  const mockOnClose = jest.fn()
  const mockOnConfirm = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should not render when isOpen is false', () => {
    render(
      <RejectModal
        isOpen={false}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />
    )

    expect(screen.queryByText('Rejeitar Cadastro')).not.toBeInTheDocument()
  })

  it('should render when isOpen is true', () => {
    render(
      <RejectModal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />
    )

    expect(screen.getByText('Rejeitar Cadastro')).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/Documentação incompleta/i)).toBeInTheDocument()
  })

  it('should call onClose when cancel button is clicked', () => {
    render(
      <RejectModal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />
    )

    fireEvent.click(screen.getByText('Cancelar'))
    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  it('should call onConfirm with reason when confirm button is clicked', () => {
    render(
      <RejectModal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />
    )

    const textarea = screen.getByPlaceholderText(/Documentação incompleta/i)
    fireEvent.change(textarea, { target: { value: 'Motivo da rejeição' } })

    fireEvent.click(screen.getByText('Confirmar Rejeição'))
    expect(mockOnConfirm).toHaveBeenCalledWith('Motivo da rejeição')
  })

  it('should disable confirm button when reason is empty', () => {
    render(
      <RejectModal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />
    )

    expect(screen.getByText('Confirmar Rejeição')).toBeDisabled()
  })

  it('should enable confirm button when reason is provided', () => {
    render(
      <RejectModal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />
    )

    const textarea = screen.getByPlaceholderText(/Documentação incompleta/i)
    fireEvent.change(textarea, { target: { value: 'Valid reason' } })

    expect(screen.getByText('Confirmar Rejeição')).not.toBeDisabled()
  })

  it('should clear reason when modal is closed', () => {
    render(
      <RejectModal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />
    )

    const textarea = screen.getByPlaceholderText(/Documentação incompleta/i) as HTMLTextAreaElement
    fireEvent.change(textarea, { target: { value: 'Some reason' } })
    expect(textarea.value).toBe('Some reason')

    fireEvent.click(screen.getByText('Cancelar'))
    expect(mockOnClose).toHaveBeenCalled()
  })

  it('should use custom title and message', () => {
    render(
      <RejectModal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        title="Custom Title"
        message="Custom Message"
      />
    )

    expect(screen.getByText('Custom Title')).toBeInTheDocument()
    expect(screen.getByText('Custom Message')).toBeInTheDocument()
  })

  it('should disable buttons when isLoading is true', () => {
    render(
      <RejectModal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        isLoading={true}
      />
    )

    expect(screen.getByText('Cancelar')).toBeDisabled()
    expect(screen.getByText('Processando...')).toBeDisabled()
  })
})
