'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Save, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import IconPicker from '@/components/IconPicker'
import ConfirmModal from '@/components/ConfirmModal'

interface BeachTag {
  id: string
  name: string
  icon?: string
}

export default function EditBeachTagPage() {
  const router = useRouter()
  const params = useParams()
  const [tag, setTag] = useState<BeachTag | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    icon: '',
  })

  useEffect(() => {
    fetchTag()
  }, [params.id])

  const fetchTag = async () => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/beaches/tags/${params.id}`)
      if (res.ok) {
        const data = await res.json()
        setTag(data)
        setFormData({
          name: data.name,
          icon: data.icon || '',
        })
      } else {
        toast.error('Tag não encontrada')
        router.push('/dash/tags')
      }
    } catch (error) {
      toast.error('Erro ao carregar tag')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      toast.error('Nome é obrigatório')
      return
    }

    setIsSaving(true)
    try {
      const res = await fetch(`/api/beaches/tags/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        toast.success('Tag atualizada com sucesso!')
        router.push('/dash/tags')
        router.refresh()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Erro ao atualizar tag')
      }
    } catch (error) {
      toast.error('Erro ao atualizar tag')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/beaches/tags/${params.id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        toast.success('Tag excluída com sucesso!')
        router.push('/dash/tags')
        router.refresh()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Erro ao excluir tag')
      }
    } catch (error) {
      toast.error('Erro ao excluir tag')
    } finally {
      setIsDeleting(false)
      setShowDeleteModal(false)
    }
  }

  if (isLoading) {
    return (
      <div>
        <div className="max-w-2xl mx-auto">
          <p className="text-center text-gray-500">Carregando...</p>
        </div>
      </div>
    )
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
          <h1 className="text-3xl font-bold text-gray-900">Editar Tag de Praia</h1>
          <p className="text-gray-600 mt-1">
            Atualize as informações da tag
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
          <div className="mt-6 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition font-medium"
            >
              <Trash2 className="w-4 h-4" />
              Excluir
            </button>
            <div className="flex items-center gap-3">
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
                {isSaving ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </div>
          </div>
        </form>

        {/* Delete Modal */}
        <ConfirmModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDelete}
          title="Excluir Tag"
          message="Tem certeza que deseja excluir esta tag? Esta ação não pode ser desfeita."
          confirmText="Excluir"
          isLoading={isDeleting}
        />
      </div>
    </div>
  )
}
