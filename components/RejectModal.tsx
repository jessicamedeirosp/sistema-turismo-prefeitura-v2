import { useState } from 'react'

interface RejectModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (reason: string) => void
  title?: string
  message?: string
  placeholder?: string
  confirmText?: string
  isLoading?: boolean
}

export default function RejectModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Rejeitar Cadastro',
  message = 'Informe o motivo da rejeição. Esta mensagem será exibida para o responsável.',
  placeholder = 'Ex: Documentação incompleta, informações incorretas...',
  confirmText = 'Confirmar Rejeição',
  isLoading = false,
}: RejectModalProps) {
  const [reason, setReason] = useState('')

  if (!isOpen) return null

  const handleClose = () => {
    setReason('')
    onClose()
  }

  const handleConfirm = () => {
    if (reason.trim()) {
      onConfirm(reason)
      setReason('')
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">{title}</h3>
        <p className="text-gray-600 mb-4">{message}</p>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none resize-none"
          rows={4}
          placeholder={placeholder}
        />
        <div className="flex gap-3 mt-6">
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading || !reason.trim()}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
          >
            {isLoading ? 'Processando...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
