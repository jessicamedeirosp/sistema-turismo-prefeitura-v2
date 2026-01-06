import { render, screen, fireEvent } from '@testing-library/react'
import ConfirmModal from '@/components/ConfirmModal'

describe('ConfirmModal', () => {
  const mockOnClose = jest.fn()
  const mockOnConfirm = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should not render when isOpen is false', () => {
    render(
      <ConfirmModal
        isOpen={false}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        title="Test Title"
        message="Test Message"
      />
    )

    expect(screen.queryByText('Test Title')).not.toBeInTheDocument()
  })

  it('should render when isOpen is true', () => {
    render(
      <ConfirmModal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        title="Test Title"
        message="Test Message"
      />
    )

    expect(screen.getByText('Test Title')).toBeInTheDocument()
    expect(screen.getByText('Test Message')).toBeInTheDocument()
  })

  it('should call onClose when cancel button is clicked', () => {
    render(
      <ConfirmModal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        title="Test Title"
        message="Test Message"
      />
    )

    fireEvent.click(screen.getByText('Cancelar'))
    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  it('should call onConfirm when confirm button is clicked', () => {
    render(
      <ConfirmModal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        title="Test Title"
        message="Test Message"
      />
    )

    fireEvent.click(screen.getByText('Confirmar'))
    expect(mockOnConfirm).toHaveBeenCalledTimes(1)
  })

  it('should use custom confirm text', () => {
    render(
      <ConfirmModal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        title="Test Title"
        message="Test Message"
        confirmText="Aprovar"
      />
    )

    expect(screen.getByText('Aprovar')).toBeInTheDocument()
  })

  it('should disable buttons when isLoading is true', () => {
    render(
      <ConfirmModal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        title="Test Title"
        message="Test Message"
        isLoading={true}
      />
    )

    expect(screen.getByText('Cancelar')).toBeDisabled()
    expect(screen.getByText('Processando...')).toBeDisabled()
  })

  it('should apply custom button class', () => {
    render(
      <ConfirmModal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        title="Test Title"
        message="Test Message"
        confirmButtonClass="bg-blue-600 hover:bg-blue-700"
      />
    )

    const confirmButton = screen.getByText('Confirmar')
    expect(confirmButton).toHaveClass('bg-blue-600')
  })
})
