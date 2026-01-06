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

const newsSchema = z.object({
  title: z.string().min(3, 'Título deve ter no mínimo 3 caracteres'),
  content: z.string().min(10, 'Conteúdo deve ter no mínimo 10 caracteres'),
  image: z.string().min(1, 'Imagem é obrigatória'),
  author: z.string().optional(),
  active: z.boolean().default(true)
})

type NewsFormData = z.infer<typeof newsSchema>

export default function NewsFormPage() {
  const router = useRouter()
  const params = useParams()
  const newsId = params.id as string
  const isEdit = newsId && newsId !== 'new'

  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [contentEditor, setContentEditor] = useState('')
  const [imageUrl, setImageUrl] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<NewsFormData>({
    resolver: zodResolver(newsSchema),
    defaultValues: {
      active: true
    }
  })

  useEffect(() => {
    if (isEdit) {
      setLoadingData(true)
      fetch(`/api/news/${newsId}`, {
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
        .then((news) => {
          setValue('title', news.title)
          setValue('author', news.author || '')
          setValue('active', news.active)
          setContentEditor(news.content)
          setImageUrl(news.image)
        })
        .catch((err) => {
          console.error('Erro ao buscar notícia:', err)
        })
        .finally(() => setLoadingData(false))
    }
  }, [isEdit, newsId, setValue])

  const onSubmit = async (data: NewsFormData) => {
    if (!imageUrl) {
      toast.error('Imagem é obrigatória')
      return
    }

    setLoading(true)

    try {
      const payload = {
        ...data,
        content: contentEditor,
        image: imageUrl
      }

      const url = isEdit ? `/api/news/${newsId}` : '/api/news'
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

      toast.success(isEdit ? 'Notícia atualizada com sucesso!' : 'Notícia cadastrada com sucesso!')
      router.push('/dash/news')
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || 'Erro ao salvar notícia')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!isEdit) return

    try {
      const response = await fetch(`/api/news/${newsId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error)
      }

      toast.success('Notícia excluída com sucesso!')
      router.push('/dash/news')
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || 'Erro ao excluir notícia')
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
        href="/dash/news"
        className="inline-flex items-center gap-2 text-gray-700 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar
      </Link>

      {/* Título e informação de campos obrigatórios */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {isEdit ? 'Editar Notícia' : 'Cadastrar Notícia'}
        </h1>
        <p className="text-sm text-gray-600">* Campos obrigatórios</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          {/* Título */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Título *
            </label>
            <input
              type="text"
              {...register('title')}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.title ? 'border-red-500' : 'border-gray-300'
                }`}
            />
            {errors.title && (
              <p className="text-red-600 text-sm mt-1">{errors.title.message}</p>
            )}
          </div>

          {/* Conteúdo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Conteúdo *
            </label>
            <SimpleRichEditor
              value={contentEditor}
              onChange={setContentEditor}
            />
            {errors.content && (
              <p className="text-red-600 text-sm mt-1">{errors.content.message}</p>
            )}
          </div>

          {/* Imagem */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Imagem *
            </label>
            <ImageUpload
              images={imageUrl ? [imageUrl] : []}
              onImagesChange={(images) => setImageUrl(images[0] || '')}
              maxImages={1}
            />
            {!imageUrl && (
              <p className="text-sm text-red-600 mt-2">Imagem é obrigatória</p>
            )}
          </div>

          {/* Autor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Autor
            </label>
            <input
              type="text"
              {...register('author')}
              placeholder="Nome do autor (opcional)"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
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
                onClick={() => router.push('/dash/news')}
                className="px-6 py-3 border border-gray-900 text-gray-900 rounded-lg hover:bg-gray-50 transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading || !imageUrl}
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
        title="Deletar Notícia"
        message="Tem certeza que deseja deletar esta notícia? Esta ação não pode ser desfeita."
        confirmText="Deletar"
      />
    </div>
  )
}
