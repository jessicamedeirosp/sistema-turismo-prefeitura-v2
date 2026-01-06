'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import IconPicker from '@/components/IconPicker'

export default function NewBeachTagPage() {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    icon: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      toast.error('Nome é obrigatório')
      return
    }

    setIsSaving(true)
    try {
      const res = await fetch('/api/beaches/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        toast.success('Tag de praia criada com sucesso!')
        router.push('/dash/tags')
        router.refresh()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Erro ao criar tag')
      }
    } catch (error) {
      toast.error('Erro ao criar tag')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/dash/tags"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para lista
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Nova Tag de Praia</h1>
          <p className="text-gray-600 mt-1">
            Crie uma nova tag para categorizar praias
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
            {/* Nome */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Nome da Tag *
              </label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: Surf, Família, Pet-Friendly..."
                required
              />
            </div>

            {/* Ícone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ícone
              </label>
              <IconPicker
                value={formData.icon}
                onChange={(icon) => setFormData({ ...formData, icon })}
                onClear={() => setFormData({ ...formData, icon: '' })}
              />
              <p className="text-sm text-gray-500 mt-2">
                Selecione um ícone para representar a tag visualmente
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex items-center justify-end gap-3">
            <Link
              href="/dash/tags"
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 font-medium"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Salvando...' : 'Criar Tag'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
