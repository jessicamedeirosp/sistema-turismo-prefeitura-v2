import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import IconPicker from '@/components/IconPicker'

describe('IconPicker', () => {
  const mockOnChange = jest.fn()
  const mockOnClear = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render with placeholder when no value', () => {
    render(<IconPicker onChange={mockOnChange} onClear={mockOnClear} />)
    expect(screen.getByText('Selecionar ícone (opcional)')).toBeInTheDocument()
  })

  it('should render selected icon when value is provided', () => {
    render(
      <IconPicker
        value="Palmtree"
        onChange={mockOnChange}
        onClear={mockOnClear}
      />
    )
    expect(screen.getByText('Palmtree')).toBeInTheDocument()
  })

  it('should show clear button when icon is selected', () => {
    render(
      <IconPicker
        value="Sun"
        onChange={mockOnChange}
        onClear={mockOnClear}
      />
    )
    const clearButton = screen.getByTitle('Limpar ícone')
    expect(clearButton).toBeInTheDocument()
  })

  it('should not show clear button when no icon is selected', () => {
    render(<IconPicker onChange={mockOnChange} onClear={mockOnClear} />)
    const clearButton = screen.queryByTitle('Limpar ícone')
    expect(clearButton).not.toBeInTheDocument()
  })

  it('should open modal when clicking select button', () => {
    render(<IconPicker onChange={mockOnChange} onClear={mockOnClear} />)
    const selectButton = screen.getByText('Selecionar ícone (opcional)')
    fireEvent.click(selectButton)
    expect(screen.getByPlaceholderText('Buscar ícone...')).toBeInTheDocument()
  })

  it('should close modal when clicking overlay', () => {
    render(<IconPicker onChange={mockOnChange} onClear={mockOnClear} />)
    const selectButton = screen.getByText('Selecionar ícone (opcional)')
    fireEvent.click(selectButton)

    const overlay = document.querySelector('.fixed.inset-0')
    fireEvent.click(overlay!)

    waitFor(() => {
      expect(screen.queryByPlaceholderText('Buscar ícone...')).not.toBeInTheDocument()
    })
  })

  it('should display category buttons', () => {
    render(<IconPicker onChange={mockOnChange} onClear={mockOnClear} />)
    const selectButton = screen.getByText('Selecionar ícone (opcional)')
    fireEvent.click(selectButton)

    expect(screen.getByText('Natureza & Turismo')).toBeInTheDocument()
    expect(screen.getByText('Clima')).toBeInTheDocument()
    expect(screen.getByText('Atividades')).toBeInTheDocument()
    expect(screen.getByText('Alimentação')).toBeInTheDocument()
    expect(screen.getByText('Acomodação')).toBeInTheDocument()
    expect(screen.getByText('Outros')).toBeInTheDocument()
  })

  it('should show icons from Natureza & Turismo category by default', () => {
    render(<IconPicker onChange={mockOnChange} onClear={mockOnClear} />)
    const selectButton = screen.getByText('Selecionar ícone (opcional)')
    fireEvent.click(selectButton)

    // Verifica se alguns ícones da categoria Natureza & Turismo aparecem
    expect(screen.getByTitle('Palmtree')).toBeInTheDocument()
    expect(screen.getByTitle('Sun')).toBeInTheDocument()
  })

  it('should switch categories when clicking category button', () => {
    render(<IconPicker onChange={mockOnChange} onClear={mockOnClear} />)
    const selectButton = screen.getByText('Selecionar ícone (opcional)')
    fireEvent.click(selectButton)

    const climaButton = screen.getByText('Clima')
    fireEvent.click(climaButton)

    // Verifica se ícones da categoria Clima aparecem
    expect(screen.getByTitle('Cloud')).toBeInTheDocument()
  })

  it('should filter icons when searching', () => {
    render(<IconPicker onChange={mockOnChange} onClear={mockOnClear} />)
    const selectButton = screen.getByText('Selecionar ícone (opcional)')
    fireEvent.click(selectButton)

    const searchInput = screen.getByPlaceholderText('Buscar ícone...')
    fireEvent.change(searchInput, { target: { value: 'sun' } })

    expect(screen.getByTitle('Sun')).toBeInTheDocument()
    expect(screen.getByTitle('Sunrise')).toBeInTheDocument()
    expect(screen.getByTitle('Sunset')).toBeInTheDocument()
  })

  it('should show no results message when search has no matches', () => {
    render(<IconPicker onChange={mockOnChange} onClear={mockOnClear} />)
    const selectButton = screen.getByText('Selecionar ícone (opcional)')
    fireEvent.click(selectButton)

    const searchInput = screen.getByPlaceholderText('Buscar ícone...')
    fireEvent.change(searchInput, { target: { value: 'xyznonexistent' } })

    expect(screen.getByText('Nenhum ícone encontrado')).toBeInTheDocument()
  })

  it('should hide category buttons when searching', () => {
    render(<IconPicker onChange={mockOnChange} onClear={mockOnClear} />)
    const selectButton = screen.getByText('Selecionar ícone (opcional)')
    fireEvent.click(selectButton)

    const searchInput = screen.getByPlaceholderText('Buscar ícone...')
    fireEvent.change(searchInput, { target: { value: 'sun' } })

    // Categorias não devem aparecer durante busca
    expect(screen.queryByText('Natureza & Turismo')).not.toBeInTheDocument()
  })

  it('should call onChange and close modal when selecting icon', () => {
    render(<IconPicker onChange={mockOnChange} onClear={mockOnClear} />)
    const selectButton = screen.getByText('Selecionar ícone (opcional)')
    fireEvent.click(selectButton)

    const sunIcon = screen.getByTitle('Sun')
    fireEvent.click(sunIcon)

    expect(mockOnChange).toHaveBeenCalledWith('Sun')
    waitFor(() => {
      expect(screen.queryByPlaceholderText('Buscar ícone...')).not.toBeInTheDocument()
    })
  })

  it('should call onClear when clicking clear button', () => {
    render(
      <IconPicker
        value="Sun"
        onChange={mockOnChange}
        onClear={mockOnClear}
      />
    )

    const clearButton = screen.getByTitle('Limpar ícone')
    fireEvent.click(clearButton)

    expect(mockOnClear).toHaveBeenCalled()
  })

  it('should show load more button when there are more icons', () => {
    render(<IconPicker onChange={mockOnChange} onClear={mockOnClear} />)
    const selectButton = screen.getByText('Selecionar ícone (opcional)')
    fireEvent.click(selectButton)

    // Categoria Natureza & Turismo tem 13 ícones, mostra 10 inicialmente
    expect(screen.getByText(/Carregar mais \(3 restantes\)/)).toBeInTheDocument()
  })

  it('should load more icons when clicking load more button', () => {
    render(<IconPicker onChange={mockOnChange} onClear={mockOnClear} />)
    const selectButton = screen.getByText('Selecionar ícone (opcional)')
    fireEvent.click(selectButton)

    const loadMoreButton = screen.getByText(/Carregar mais/)
    fireEvent.click(loadMoreButton)

    // Após carregar mais, deve mostrar mais ícones
    // Categoria tem 13 ícones, agora mostra 13 (10+3)
    expect(screen.queryByText(/Carregar mais/)).not.toBeInTheDocument()
  })

  it('should reset visible count when changing category', () => {
    render(<IconPicker onChange={mockOnChange} onClear={mockOnClear} />)
    const selectButton = screen.getByText('Selecionar ícone (opcional)')
    fireEvent.click(selectButton)

    // Carrega mais na primeira categoria
    const loadMoreButton = screen.getByText(/Carregar mais/)
    fireEvent.click(loadMoreButton)

    // Muda de categoria
    const alimentacaoButton = screen.getByText('Alimentação')
    fireEvent.click(alimentacaoButton)

    // Deve voltar a mostrar apenas 10 ícones
    const icons = screen.getAllByRole('button').filter(btn =>
      btn.getAttribute('title') && btn.getAttribute('title') !== 'Limpar ícone'
    )
    expect(icons.length).toBeLessThanOrEqual(10)
  })

  it('should highlight selected icon in the grid', () => {
    render(
      <IconPicker
        value="Sun"
        onChange={mockOnChange}
        onClear={mockOnClear}
      />
    )
    const selectButton = screen.getByText('Sun')
    fireEvent.click(selectButton)

    const sunIconButton = screen.getByTitle('Sun')
    expect(sunIconButton).toHaveClass('border-blue-600', 'bg-blue-50')
  })
})
