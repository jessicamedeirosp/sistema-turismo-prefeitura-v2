'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Trash2, ArrowLeft, Save } from 'lucide-react'
import IconPicker from '@/components/IconPicker'
import ConfirmModal from '@/components/ConfirmModal'
import { toast } from 'sonner'

interface SocialMediaFormData {
  name: string
  link: string
  icon: string
  active: boolean
}

export default function SocialMediaFormPage({
  params,
}: {
  params: { id: string }
}) {
  const router = useRouter()
  const { data: session } = useSession()
  const isEditing = params.id !== 'new'

  const [formData, setFormData] = useState<SocialMediaFormData>({
    name: '',
    link: '',
    icon: 'Share2',
    active: true,
  })
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(isEditing)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (isEditing) {
      fetchSocialMedia()
    }
  }, [isEditing, params.id])

  const fetchSocialMedia = async () => {
    try {
      const response = await fetch(`/api/social-media/${params.id}`)
      if (!response.ok) {
        throw new Error('Rede social não encontrada')
      }
      const data = await response.json()
      setFormData({
        name: data.name,
        link: data.link,
        icon: data.icon,
        active: data.active,
      })
    } catch (error: any) {
      console.error('Erro ao carregar rede social:', error)
      toast.error(error.message || 'Erro ao carregar rede social')
      router.push('/dash/social-media')
    } finally {
      setLoadingData(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = isEditing
        ? `/api/social-media/${params.id}`
        : '/api/social-media'
      const method = isEditing ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao salvar rede social')
      }

      toast.success(
        isEditing
          ? 'Rede social atualizada com sucesso!'
          : 'Rede social criada com sucesso!'
      )
      router.push('/dash/social-media')
      router.refresh()
    } catch (error: any) {
      console.error('Erro ao salvar rede social:', error)
      toast.error(error.message || 'Erro ao salvar rede social')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)

    try {
      const response = await fetch(`/api/social-media/${params.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erro ao excluir rede social')
      }

      toast.success('Rede social excluída com sucesso!')
      router.push('/dash/social-media')
      router.refresh()
    } catch (error: any) {
      console.error('Erro ao excluir rede social:', error)
      toast.error(error.message || 'Erro ao excluir rede social')
      setDeleting(false)
      setShowDeleteModal(false)
    }
  }

  if (loadingData) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Botão Voltar */}
      <Link
        href="/dash/social-media"
        className="inline-flex items-center gap-2 text-gray-700 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar
      </Link>

      {/* Título */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {isEditing ? 'Editar Rede Social' : 'Nova Rede Social'}
        </h1>
        <p className="text-sm text-gray-600">* Campos obrigatórios</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="space-y-4">
            {/* Nome */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Nome *
              </label>
              <input
                type="text"
                id="name"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Ex: Facebook, Instagram, Twitter"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              />
            </div>

            {/* Link */}
            <div>
              <label
                htmlFor="link"
                className="block text-sm font-medium text-gray-700"
              >
                Link *
              </label>
              <input
                type="url"
                id="link"
                required
                value={formData.link}
                onChange={(e) =>
                  setFormData({ ...formData, link: e.target.value })
                }
                placeholder="https://..."
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              />
              <p className="mt-1 text-sm text-gray-500">
                URL completa da rede social (incluindo https://)
              </p>
            </div>

            {/* Ícone */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Ícone *
              </label>
              <IconPicker
                value={formData.icon}
                onChange={(icon: string) =>
                  setFormData({ ...formData, icon })
                }
                onClear={() => setFormData({ ...formData, icon: '' })}
              />
            </div>

            {/* Status */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="active"
                checked={formData.active}
                onChange={(e) =>
                  setFormData({ ...formData, active: e.target.checked })
                }
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="active" className="text-sm text-gray-700">
                Rede social ativa (visível no site público)
              </label>
            </div>
          </div>
        </div>

        {/* Botões */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            {/* Botão Excluir à esquerda */}
            <div>
              {isEditing && (
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition"
                >
                  <Trash2 className="w-4 h-4" />
                  Excluir
                </button>
              )}
            </div>

            {/* Botões Cancelar e Salvar à direita */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => router.push('/dash/social-media')}
                className="px-6 py-3 border border-gray-900 text-gray-900 rounded-lg hover:bg-gray-50 transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Salvar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Modal de confirmação de exclusão */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Excluir Rede Social"
        message={`Tem certeza que deseja excluir "${formData.name}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        confirmButtonClass="bg-red-600 hover:bg-red-700"
        isLoading={deleting}
      />
    </div>
  )
}
