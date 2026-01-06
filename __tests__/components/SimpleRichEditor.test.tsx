import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import SimpleRichEditor from '@/components/SimpleRichEditor'

describe('SimpleRichEditor', () => {
  const mockOnChange = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render the editor with toolbar buttons', () => {
    render(<SimpleRichEditor value="" onChange={mockOnChange} />)

    // Verifica se os botões da toolbar estão presentes
    expect(screen.getByTitle('Título 1')).toBeInTheDocument()
    expect(screen.getByTitle('Título 2')).toBeInTheDocument()
    expect(screen.getByTitle('Título 3')).toBeInTheDocument()
    expect(screen.getByTitle('Negrito')).toBeInTheDocument()
    expect(screen.getByTitle('Itálico')).toBeInTheDocument()
    expect(screen.getByTitle('Sublinhado')).toBeInTheDocument()
    expect(screen.getByTitle('Lista')).toBeInTheDocument()
    expect(screen.getByTitle('Lista numerada')).toBeInTheDocument()
  })

  it('should render with placeholder', () => {
    const placeholder = 'Digite aqui...'
    render(<SimpleRichEditor value="" onChange={mockOnChange} placeholder={placeholder} />)

    const editorDiv = document.querySelector('[contenteditable="true"]')
    expect(editorDiv).toHaveAttribute('data-placeholder', placeholder)
  })

  it('should display initial value', () => {
    const initialValue = '<p>Texto inicial</p>'
    render(<SimpleRichEditor value={initialValue} onChange={mockOnChange} />)

    const editorDiv = document.querySelector('[contenteditable="true"]')
    expect(editorDiv).toHaveProperty('innerHTML', initialValue)
  })

  it('should call onChange when content is edited', () => {
    render(<SimpleRichEditor value="" onChange={mockOnChange} />)

    const editorDiv = document.querySelector('[contenteditable="true"]')

    // Simula input no editor
    if (editorDiv) {
      editorDiv.innerHTML = '<p>Novo texto</p>'
      fireEvent.input(editorDiv)
    }

    expect(mockOnChange).toHaveBeenCalled()
  })

  it('should execute formatting commands when toolbar buttons are clicked', () => {
    // Mock do execCommand
    document.execCommand = jest.fn()

    render(<SimpleRichEditor value="" onChange={mockOnChange} />)

    // Clica no botão de negrito
    const boldButton = screen.getByTitle('Negrito')
    fireEvent.click(boldButton)

    expect(document.execCommand).toHaveBeenCalledWith('bold', false, undefined)
  })

  it('should execute heading commands with correct value', () => {
    document.execCommand = jest.fn()

    render(<SimpleRichEditor value="" onChange={mockOnChange} />)

    // Clica no botão H1
    const h1Button = screen.getByTitle('Título 1')
    fireEvent.click(h1Button)

    expect(document.execCommand).toHaveBeenCalledWith('formatBlock', false, 'h1')
  })

  it('should handle list commands', () => {
    document.execCommand = jest.fn()

    render(<SimpleRichEditor value="" onChange={mockOnChange} />)

    // Clica no botão de lista não ordenada
    const listButton = screen.getByTitle('Lista')
    fireEvent.click(listButton)

    expect(document.execCommand).toHaveBeenCalledWith('insertUnorderedList', false, undefined)

    // Clica no botão de lista ordenada
    const orderedListButton = screen.getByTitle('Lista numerada')
    fireEvent.click(orderedListButton)

    expect(document.execCommand).toHaveBeenCalledWith('insertOrderedList', false, undefined)
  })

  it('should update innerHTML when value prop changes', () => {
    const { rerender } = render(<SimpleRichEditor value="<p>Initial</p>" onChange={mockOnChange} />)

    const editorDiv = document.querySelector('[contenteditable="true"]')
    expect(editorDiv).toHaveProperty('innerHTML', '<p>Initial</p>')

    // Atualiza o valor
    rerender(<SimpleRichEditor value="<p>Updated</p>" onChange={mockOnChange} />)

    expect(editorDiv).toHaveProperty('innerHTML', '<p>Updated</p>')
  })

  it('should have correct styling classes', () => {
    render(<SimpleRichEditor value="" onChange={mockOnChange} />)

    const editorDiv = document.querySelector('[contenteditable="true"]')
    expect(editorDiv).toHaveClass('min-h-[24rem]', 'p-4', 'prose', 'prose-sm')
    expect(editorDiv).toHaveClass('[&_ul]:list-disc', '[&_ol]:list-decimal')
  })

  it('should render toolbar with proper layout', () => {
    render(<SimpleRichEditor value="" onChange={mockOnChange} />)

    const toolbar = document.querySelector('.bg-gray-50.border-b')
    expect(toolbar).toBeInTheDocument()
    expect(toolbar).toHaveClass('flex', 'items-center', 'gap-1', 'p-2')
  })
})
