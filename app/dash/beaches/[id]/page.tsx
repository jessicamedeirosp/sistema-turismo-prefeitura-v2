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
import DistrictSelect from '@/components/DistrictSelect'

const beachSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  address_district: z.string().min(2, 'Bairro obrigatório'),
  details: z.string().optional(),
  images: z.array(z.string()).optional(),
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED']),
  tagIds: z.array(z.string()).optional()
})

type BeachFormData = z.infer<typeof beachSchema>

export default function BeachFormPage() {
  const router = useRouter()
  const params = useParams()
  const beachId = params.id as string
  const isEdit = beachId && beachId !== 'new'
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [tags, setTags] = useState<any[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [detailsContent, setDetailsContent] = useState('')
  const [images, setImages] = useState<string[]>([])

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<BeachFormData>({
    resolver: zodResolver(beachSchema),
    defaultValues: {
      status: 'PENDING'
    }
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Buscar tags disponíveis
        const tagsRes = await fetch('/api/beaches/tags')
        const tagsData = await tagsRes.json()
        setTags(tagsData)

        // Se for edição, buscar dados da praia
        if (isEdit) {
          setLoadingData(true)
          const beachRes = await fetch(`/api/beaches/admin/${beachId}`, {
            credentials: 'include'
          })

          if (!beachRes.ok) {
            const errorData = await beachRes.json()
            toast.error(errorData.error || 'Erro ao carregar dados')
            throw new Error(errorData.error)
          }

          const beach = await beachRes.json()
          setValue('name', beach.name)
          setValue('address_district', beach.address_district)
          setValue('status', beach.status)
          setDetailsContent(beach.details || '')
          setImages(beach.images || [])
          setSelectedTags(beach.tags.map((t: any) => t.tag_id))
        }
      } catch (err) {
        console.error('Erro ao buscar dados:', err)
      } finally {
        setLoadingData(false)
      }
    }

    fetchData()
  }, [beachId, isEdit, setValue])

  const onSubmit = async (data: BeachFormData) => {
    setLoading(true)

    try {
      const payload = {
        ...data,
        details: detailsContent,
        images,
        tagIds: selectedTags
      }

      const url = isEdit ? `/api/beaches/admin/${beachId}` : '/api/beaches/admin'
      const method = isEdit ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error)
      }

      toast.success(isEdit ? 'Praia atualizada com sucesso!' : 'Praia cadastrada com sucesso!')
      router.push('/dash/beaches')
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || 'Erro ao salvar praia')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!isEdit) return

    try {
      const response = await fetch(`/api/beaches/admin/${beachId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error)
      }

      toast.success('Praia excluída com sucesso!')
      router.push('/dash/beaches')
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || 'Erro ao excluir praia')
    } finally {
      setShowDeleteModal(false)
    }
  }

  const toggleTag = (tagId: string) => {
    setSelectedTags(prev =>
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    )
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
        href="/dash/beaches"
        className="inline-flex items-center gap-2 text-gray-700 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar
      </Link>

      {/* Título e informação de campos obrigatórios */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {isEdit ? 'Editar Praia' : 'Cadastrar Praia'}
        </h1>
        <p className="text-sm text-gray-600">* Campos obrigatórios</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          {/* Nome */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome da Praia *
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

          {/* Bairro */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bairro *
            </label>
            <DistrictSelect
              value={watch('address_district') || ''}
              onChange={(value) => setValue('address_district', value)}
              placeholder="Digite ou selecione um bairro"
            />
            {errors.address_district && (
              <p className="text-red-600 text-sm mt-1">{errors.address_district.message}</p>
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
              Imagens
            </label>
            <ImageUpload
              images={images}
              onImagesChange={setImages}
              maxImages={10}
            />
          </div>

          {/* Tags */}
          {tags.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTag(tag.id)}
                    className={`px-4 py-2 rounded-full border-2 transition ${selectedTags.includes(tag.id)
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                      }`}
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Checkbox Exibir no site */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="active"
              checked={watch('status') === 'APPROVED'}
              onChange={(e) => setValue('status', e.target.checked ? 'APPROVED' : 'PENDING')}
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
                onClick={() => router.push('/dash/beaches')}
                className="px-6 py-3 border border-gray-900 text-gray-900 rounded-lg hover:bg-gray-50 transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
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
        title="Deletar Praia"
        message="Tem certeza que deseja deletar esta praia? Esta ação não pode ser desfeita."
        confirmText="Deletar"
      />
    </div>
  )
}
