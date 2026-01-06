'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { hasPermission } from '@/lib/permissions'
import { ArrowLeft, Save, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import ConfirmModal from '@/components/ConfirmModal'
import IconPicker from '@/components/IconPicker'
import { UserRole } from '@prisma/client'

const tagSchema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  category: z.enum(['FOOD', 'ACCOMMODATION', 'BEACH']),
  icon: z.string().optional()
})

type TagFormData = z.infer<typeof tagSchema>

interface Tag {
  id: string
  name: string
  category: 'FOOD' | 'ACCOMMODATION' | 'BEACH'
  icon?: string
}

export default function TagFormPage() {
  const router = useRouter()
  const params = useParams()
  const { data: session } = useSession()
  const [tag, setTag] = useState<Tag | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [iconValue, setIconValue] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<TagFormData>({
    resolver: zodResolver(tagSchema),
    defaultValues: {
      category: 'FOOD'
    }
  })

  const isEdit = params?.id && params.id !== 'new'

  useEffect(() => {
    if (!session) return

    // Verificar permissão baseada em edit ou create
    const permission = isEdit ? 'editTags' : 'createTags'
    if (!hasPermission(session.user.role as UserRole, permission)) {
      router.push('/dash')
      return
    }

    if (isEdit) {
      fetchTag()
    } else {
      setIsLoading(false)
    }
  }, [session, params.id])

  const fetchTag = async () => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/tags/${params.id}`)
      if (res.ok) {
        const data = await res.json()
        setTag(data.tag)
        setValue('name', data.tag.name)
        setValue('category', data.tag.category)
        setValue('icon', data.tag.icon || '')
        setIconValue(data.tag.icon || '')
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

  const onSubmit = async (data: TagFormData) => {
    setIsSaving(true)
    try {
      const payload = {
        ...data,
        icon: iconValue
      }

      // Se for categoria BEACH, usar API de beach tags
      if (data.category === 'BEACH') {
        const url = isEdit ? `/api/beaches/tags/${params.id}` : '/api/beaches/tags'
        const method = isEdit ? 'PUT' : 'POST'

        const res = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: data.name,
            icon: iconValue
          }),
        })

        if (!res.ok) {
          const errorData = await res.json()
          throw new Error(errorData.error)
        }

        toast.success(isEdit ? 'Tag atualizada com sucesso!' : 'Tag criada com sucesso!')
        router.push('/dash/tags')
        router.refresh()
      } else {
        // Tags normais (FOOD/ACCOMMODATION)
        const url = isEdit ? `/api/tags/${params.id}` : '/api/tags'
        const method = isEdit ? 'PUT' : 'POST'

        const res = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })

        if (!res.ok) {
          const errorData = await res.json()
          throw new Error(errorData.error)
        }

        toast.success(isEdit ? 'Tag atualizada com sucesso!' : 'Tag criada com sucesso!')
        router.push('/dash/tags')
        router.refresh()
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao salvar tag')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/tags/${params.id}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error)
      }

      toast.success('Tag excluída com sucesso!')
      router.push('/dash/tags')
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || 'Erro ao excluir tag')
    } finally {
      setIsDeleting(false)
      setShowDeleteModal(false)
    }
  }

  if (isLoading) {
    return (
      <div>
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-gray-600">Carregando...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="max-w-2xl mx-auto">
        {/* Botão Voltar */}
        <Link
          href="/dash/tags"
          className="inline-flex items-center gap-2 text-gray-700 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Link>

        {/* Título e informação de campos obrigatórios */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {isEdit ? 'Editar Tag' : 'Cadastrar Tag'}
          </h1>
          <p className="text-sm text-gray-600">* Campos obrigatórios</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
            {/* Nome */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Nome da Tag *
              </label>
              <input
                id="name"
                type="text"
                {...register('name')}
                placeholder="Ex: Restaurante, Hotel, Pousada..."
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
              />
              {errors.name && (
                <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>
              )}
            </div>

            {/* Categoria */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Categoria *
              </label>
              <select
                id="category"
                {...register('category')}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.category ? 'border-red-500' : 'border-gray-300'
                  }`}
              >
                <option value="FOOD">Alimentação</option>
                <option value="ACCOMMODATION">Acomodação</option>
                <option value="BEACH">Praias</option>
              </select>
              {errors.category && (
                <p className="text-red-600 text-sm mt-1">{errors.category.message}</p>
              )}
            </div>

            {/* Ícone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ícone - Opcional
              </label>
              <IconPicker
                value={iconValue}
                onChange={(iconName) => {
                  setIconValue(iconName)
                  setValue('icon', iconName)
                }}
                onClear={() => {
                  setIconValue('')
                  setValue('icon', '')
                }}
              />
              <p className="text-sm text-gray-500 mt-2">
                Selecione um ícone visual para a tag. Ícones relacionados a turismo aparecem primeiro.
              </p>
            </div>
          </div>

          {/* Botões */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              {/* Botão Excluir à esquerda */}
              <div>
                {isEdit && (
                  <button
                    type="button"
                    onClick={() => setShowDeleteModal(true)}
                    disabled={isSaving || isDeleting}
                    className="inline-flex items-center gap-2 px-6 py-3 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition disabled:opacity-50"
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
                  onClick={() => router.push('/dash/tags')}
                  className="px-6 py-3 border border-gray-900 text-gray-900 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Modal de Exclusão */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)
        }
        onConfirm={handleDelete}
        title="Excluir Tag"
        message="Tem certeza que deseja excluir esta tag? Esta ação não pode ser desfeita e a tag será removida de todas as empresas associadas."
        confirmText="Excluir"
        confirmButtonClass="bg-red-600 hover:bg-red-700"
        isLoading={isDeleting}
      />
    </div >
  )
}
