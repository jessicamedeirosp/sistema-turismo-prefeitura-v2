'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import Link from 'next/link'
import { ArrowLeft, Save, Trash2 } from 'lucide-react'
import SimpleRichEditor from '@/components/SimpleRichEditor'
import ImageUpload from '@/components/ImageUpload'
import ConfirmModal from '@/components/ConfirmModal'

const eventSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  date: z.string().min(1, 'Data e hora são obrigatórias'),
  location: z.string().min(3, 'Local deve ter no mínimo 3 caracteres'),
  details: z.string().optional(),
  images: z.array(z.string()).min(1, 'Adicione pelo menos uma imagem'),
  active: z.boolean().default(true)
})

type EventFormData = z.infer<typeof eventSchema>

export default function EventFormPage() {
  const router = useRouter()
  const params = useParams()
  const eventId = params.id as string
  const isEdit = eventId && eventId !== 'new'

  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [detailsContent, setDetailsContent] = useState('')
  const [images, setImages] = useState<string[]>([])

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      active: true
    }
  })

  useEffect(() => {
    if (isEdit) {
      setLoadingData(true)
      fetch(`/api/events/${eventId}`, {
        credentials: 'include',
      })
        .then(async (res) => {
          if (!res.ok) {
            const errorData = await res.json()
            toast.error(errorData.error || 'Erro ao carregar dados')
            throw new Error(errorData.error)
          }
          return res.json()
        })
        .then((event) => {
          // Formatar data para datetime-local (YYYY-MM-DDTHH:mm)
          const eventDate = new Date(event.date)
          const formattedDate = eventDate.toISOString().slice(0, 16)

          setValue('name', event.name)
          setValue('date', formattedDate)
          setValue('location', event.location)
          setValue('active', event.active)
          setDetailsContent(event.details || '')
          setImages(event.images || [])
        })
        .catch((err) => {
          console.error('Erro ao buscar evento:', err)
        })
        .finally(() => setLoadingData(false))
    }
  }, [isEdit, eventId, setValue])

  const onSubmit = async (data: EventFormData) => {
    if (images.length === 0) {
      toast.error('Adicione pelo menos uma imagem')
      return
    }

    setLoading(true)

    try {
      const payload = {
        ...data,
        details: detailsContent,
        images
      }

      const url = isEdit ? `/api/events/${eventId}` : '/api/events'
      const method = isEdit ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error)
      }

      toast.success(isEdit ? 'Evento atualizado com sucesso!' : 'Evento cadastrado com sucesso!')
      router.push('/dash/events')
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || 'Erro ao salvar evento')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!isEdit) return

    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error)
      }

      toast.success('Evento excluído com sucesso!')
      router.push('/dash/events')
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || 'Erro ao excluir evento')
    } finally {
      setShowDeleteModal(false)
    }
  }

  if (loadingData) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-600">Carregando...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Botão Voltar */}
      <Link
        href="/dash/events"
        className="inline-flex items-center gap-2 text-gray-700 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar
      </Link>

      {/* Título e informação de campos obrigatórios */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {isEdit ? 'Editar Evento' : 'Cadastrar Evento'}
        </h1>
        <p className="text-sm text-gray-600">* Campos obrigatórios</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          {/* Nome */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome do Evento *
            </label>
            <input
              type="text"
              {...register('name')}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
            />
            {errors.name && (
              <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Data e Hora */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data e Hora *
            </label>
            <input
              type="datetime-local"
              {...register('date')}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.date ? 'border-red-500' : 'border-gray-300'
                }`}
            />
            {errors.date && (
              <p className="text-red-600 text-sm mt-1">{errors.date.message}</p>
            )}
          </div>

          {/* Localização */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Local *
            </label>
            <input
              type="text"
              {...register('location')}
              placeholder="Ex: Praça da Matriz"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.location ? 'border-red-500' : 'border-gray-300'
                }`}
            />
            {errors.location && (
              <p className="text-red-600 text-sm mt-1">{errors.location.message}</p>
            )}
          </div>

          {/* Detalhes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Detalhes
            </label>
            <SimpleRichEditor
              value={detailsContent}
              onChange={setDetailsContent}
            />
          </div>

          {/* Imagens */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Imagens *
            </label>
            <ImageUpload
              images={images}
              onImagesChange={setImages}
              maxImages={10}
            />
            {images.length === 0 && (
              <p className="text-sm text-red-600 mt-2">Adicione pelo menos uma imagem</p>
            )}
          </div>

          {/* Checkbox Exibir no site */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="active"
              {...register('active')}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="active" className="text-sm font-medium text-gray-700">
              Exibir no site
            </label>
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
                onClick={() => router.push('/dash/events')}
                className="px-6 py-3 border border-gray-900 text-gray-900 rounded-lg hover:bg-gray-50 transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading || images.length === 0}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                {loading ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      </form>

      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Deletar Evento"
        message="Tem certeza que deseja deletar este evento? Esta ação não pode ser desfeita."
        confirmText="Deletar"
      />
    </div>
  )
}
