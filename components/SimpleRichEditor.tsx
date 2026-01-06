'use client'

import { useRef, useEffect } from 'react'
import { Bold, Italic, Underline, List, ListOrdered, Heading1, Heading2, Heading3 } from 'lucide-react'

interface SimpleRichEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export default function SimpleRichEditor({ value, onChange, placeholder }: SimpleRichEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (editorRef.current) {
      const safeValue = typeof value === 'string' ? value : ''
      if (editorRef.current.innerHTML !== safeValue) {
        editorRef.current.innerHTML = safeValue
      }
    }
  }, [value])

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
  }

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value)
    editorRef.current?.focus()
  }

  const insertLink = () => {
    const url = prompt('Digite a URL:')
    if (url) {
      execCommand('createLink', url)
    }
  }

  const buttons = [
    { icon: Heading1, command: 'formatBlock', value: 'h1', title: 'Título 1' },
    { icon: Heading2, command: 'formatBlock', value: 'h2', title: 'Título 2' },
    { icon: Heading3, command: 'formatBlock', value: 'h3', title: 'Título 3' },
    { icon: Bold, command: 'bold', title: 'Negrito' },
    { icon: Italic, command: 'italic', title: 'Itálico' },
    { icon: Underline, command: 'underline', title: 'Sublinhado' },
    { icon: List, command: 'insertUnorderedList', title: 'Lista' },
    { icon: ListOrdered, command: 'insertOrderedList', title: 'Lista numerada' },
  ]

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 bg-gray-50 border-b border-gray-200 flex-wrap">
        {buttons.map((btn, idx) => {
          const Icon = btn.icon
          return (
            <button
              key={idx}
              type="button"
              onClick={() => {
                if (btn.command === 'link') {
                  insertLink()
                } else {
                  execCommand(btn.command, btn.value)
                }
              }}
              title={btn.title}
              className="p-2 hover:bg-gray-200 rounded transition"
            >
              <Icon className="w-4 h-4 text-gray-700" />
            </button>
          )
        })}
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        className="min-h-[24rem] p-4 focus:outline-none prose prose-sm max-w-none [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:ml-0"
        data-placeholder={placeholder}
        suppressContentEditableWarning
      />

      <style jsx>{`
        [contentEditable='true']:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
        }
        [contentEditable='true'] ul {
          list-style-type: disc;
          padding-left: 1.5rem;
          margin: 1rem 0;
        }
        [contentEditable='true'] ol {
          list-style-type: decimal;
          padding-left: 1.5rem;
          margin: 1rem 0;
        }
        [contentEditable='true'] li {
          margin: 0.5rem 0;
          display: list-item;
        }
        [contentEditable='true'] h1 {
          font-size: 2rem;
          font-weight: bold;
          margin: 1rem 0;
        }
        [contentEditable='true'] h2 {
          font-size: 1.5rem;
          font-weight: bold;
          margin: 1rem 0;
        }
        [contentEditable='true'] h3 {
          font-size: 1.25rem;
          font-weight: bold;
          margin: 1rem 0;
        }
        [contentEditable='true'] a {
          color: #2563eb;
          text-decoration: underline;
        }
      `}</style>
    </div>
  )
}
