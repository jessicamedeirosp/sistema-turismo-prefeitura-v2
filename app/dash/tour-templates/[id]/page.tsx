'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Loader2, Trash2, Save, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import ImageUpload from '@/components/ImageUpload'
import SimpleRichEditor from '@/components/SimpleRichEditor'
import LoadingSpinner from '@/components/LoadingSpinner'

const tourTemplateSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().optional(),
  requires_guide: z.boolean(),
})

type TourTemplateFormData = z.infer<typeof tourTemplateSchema>

export default function TourTemplateFormPage() {
  const router = useRouter()
  const params = useParams()
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [images, setImages] = useState<string[]>([])
  const [description, setDescription] = useState('')

  const isEdit = !!params?.id && params.id !== 'new'

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<TourTemplateFormData>({
    resolver: zodResolver(tourTemplateSchema),
    defaultValues: {
      requires_guide: false,
    },
  })

  const requiresGuide = watch('requires_guide')

  useEffect(() => {
    if (isEdit) {
      fetchTemplate()
    } else {
      setLoadingData(false)
    }
  }, [isEdit])

  const fetchTemplate = async () => {
    try {
      const res = await fetch(`/api/tour-templates/${params.id}`)
      if (res.ok) {
        const template = await res.json()
        setValue('name', template.name)
        setValue('requires_guide', template.requires_guide)
        setDescription(template.description || '')
        setImages(template.images || [])
      } else {
        toast.error('Template não encontrado')
        router.push('/dash/tour-templates')
      }
    } catch (error) {
      toast.error('Erro ao carregar template')
      router.push('/dash/tour-templates')
    } finally {
      setLoadingData(false)
    }
  }

  const onSubmit = async (data: TourTemplateFormData) => {
    if (images.length === 0) {
      toast.error('Adicione pelo menos uma imagem')
      return
    }

    setIsLoading(true)
    try {
      const payload = {
        ...data,
        description: description || null,
        images,
      }

      const url = isEdit
        ? `/api/tour-templates/${params.id}`
        : '/api/tour-templates'
      const method = isEdit ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        toast.success(isEdit ? 'Passeio atualizado!' : 'Passeio cadastrado!')
        router.push('/dash/tour-templates')
        router.refresh()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Erro ao salvar passeio')
      }
    } catch (error) {
      toast.error('Erro ao salvar passeio')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja excluir este passeio?')) {
      return
    }

    setIsDeleting(true)
    try {
      const res = await fetch(`/api/tour-templates/${params.id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        toast.success('Passeio excluído!')
        router.push('/dash/tour-templates')
        router.refresh()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Erro ao excluir passeio')
      }
    } catch (error) {
      toast.error('Erro ao excluir passeio')
    } finally {
      setIsDeleting(false)
    }
  }

  if (loadingData) {
    return <LoadingSpinner message="Carregando..." />
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Botão Voltar */}
      <Link
        href="/dash/tour-templates"
        className="inline-flex items-center gap-2 text-gray-700 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar
      </Link>

      {/* Título */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {isEdit ? 'Editar Passeio' : 'Novo Passeio'}
        </h1>
        <p className="text-sm text-gray-600">* Campos obrigatórios</p>
      </div>

      <div className="max-w-4xl mx-auto">

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Informações Básicas */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Informações Básicas</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome do Passeio *
                </label>
                <input
                  type="text"
                  {...register('name')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: Ilhabela Tour Completo"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    {...register('requires_guide')}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Este passeio requer guia turístico
                  </span>
                </label>
                <p className="mt-1 text-xs text-gray-500 ml-6">
                  {requiresGuide
                    ? 'Somente guias aprovados poderão oferecer este passeio'
                    : 'Este passeio pode ser realizado sem acompanhamento de guia'}
                </p>
              </div>
            </div>
          </div>

          {/* Imagens */}
          <ImageUpload
            images={images}
            onImagesChange={setImages}
            maxImages={10}
            title="Fotos do Passeio"
            description="Adicione fotos que representem bem este passeio. A primeira imagem será usada como capa."
          />

          {/* Descrição */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Descrição Detalhada</h2>
            <SimpleRichEditor
              value={description}
              onChange={setDescription}
              placeholder="Descreva o passeio: roteiro, duração, o que está incluso, nível de dificuldade, etc..."
            />
          </div>

          {/* Botões */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              {/* Botão Excluir à esquerda */}
              <div>
                {isEdit && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="inline-flex items-center gap-2 px-6 py-3 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition disabled:opacity-50"
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Excluindo...
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4" />
                        Excluir
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Botões Cancelar e Salvar à direita */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => router.push('/dash/tour-templates')}
                  className="px-6 py-3 border border-gray-900 text-gray-900 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      {isEdit ? 'Salvar' : 'Salvar'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
