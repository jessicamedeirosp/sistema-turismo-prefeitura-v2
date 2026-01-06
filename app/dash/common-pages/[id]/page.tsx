'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import Link from 'next/link'
import { ArrowLeft, Save } from 'lucide-react'
import ImageUpload from '@/components/ImageUpload'
import SimpleRichEditor from '@/components/SimpleRichEditor'

const commonPageSchema = z.object({
  title: z.string().min(3, 'Título deve ter no mínimo 3 caracteres'),
  video: z.string().url('URL inválida').optional().or(z.literal('')),
  images: z.array(z.string()).optional(),
  details: z.string().min(10, 'Conteúdo deve ter no mínimo 10 caracteres'),
  page: z.string(),
  active: z.boolean().default(true),
  visibleInHeader: z.boolean().default(false),
  visibleInFooter: z.boolean().default(false),
})

type CommonPageFormData = z.infer<typeof commonPageSchema>

export default function CommonPageFormPage() {
  const router = useRouter()
  const params = useParams()
  const pageId = params.id as string
  const isEdit = pageId && pageId !== 'new'

  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(false)
  const [detailsContent, setDetailsContent] = useState('')
  const [images, setImages] = useState<string[]>([])

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<CommonPageFormData>({
    resolver: zodResolver(commonPageSchema),
    defaultValues: {
      active: true,
      page: 'HOME'
    }
  })

  useEffect(() => {
    if (isEdit) {
      setLoadingData(true)
      fetch(`/api/common-pages/${pageId}`, {
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
        .then((page) => {
          setValue('title', page.title)
          setValue('video', page.video || '')
          setValue('page', page.page)
          setValue('active', page.active)
          setValue('visibleInHeader', page.visibleInHeader ?? page.visible_header ?? false)
          setValue('visibleInFooter', page.visibleInFooter ?? page.only_footer ?? false)
          setDetailsContent(page.details)
          setValue('details', page.details || '')
          setImages(page.images || [])
        })
        .catch((err) => {
          console.error('Erro ao buscar página:', err)
        })
        .finally(() => setLoadingData(false))
    }
  }, [isEdit, pageId, setValue])

  const watchedVisibleInHeader = watch('visibleInHeader');
  const watchedVisibleInFooter = watch('visibleInFooter');
  const onSubmit = async (data: CommonPageFormData) => {
    setLoading(true)

    try {
      const payload = {
        ...data,
        visibleInHeader: typeof watchedVisibleInHeader === 'boolean' ? watchedVisibleInHeader : false,
        visibleInFooter: typeof watchedVisibleInFooter === 'boolean' ? watchedVisibleInFooter : false,
        details: detailsContent,
        images
      }

      const url = isEdit ? `/api/common-pages/${pageId}` : '/api/common-pages'
      const method = isEdit ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error)
      }

      toast.success(isEdit ? 'Página atualizada com sucesso!' : 'Página cadastrada com sucesso!')
      router.push('/dash/common-pages')
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || 'Erro ao salvar página')
    } finally {
      setLoading(false)
    }
  }

  const moveImageToFirst = (index: number) => {
    if (index === 0) return
    const newImages = [...images]
    const [movedImage] = newImages.splice(index, 1)
    newImages.unshift(movedImage)
    setImages(newImages)
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
      <div className="mb-6">
        <Link
          href="/dash/common-pages"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">
          {isEdit ? 'Editar Página' : 'Cadastrar Página'}
        </h1>
        <p className="text-sm text-gray-600 mt-2">* Campos obrigatórios</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          {/* Categoria da Página */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categoria da Página *
            </label>
            <select
              {...register('page')}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.page ? 'border-red-600' : 'border-gray-300'
                }`}
              disabled={!!isEdit}
            >
              <option value="OBSERVATORY">Observatório do Turismo</option>
              <option value="MARRIAGE">Casamento Coletivo</option>
              <option value="VEHICLE">Estacionamento</option>
              <option value="COMTUR">Conselho Municipal de Turismo</option>
              <option value="INFOS">Informações Gerais</option>
              <option value="HOME">Página Inicial</option>
              <option value="DOWNLOAD">Downloads</option>
              <option value="USEFULLINFO">Informações Úteis</option>
              <option value="BEACH">Praias</option>
              <option value="BUSINESS_FOOD">Gastronomia</option>
              <option value="BUSINESS_ACCOMMODATION">Hospedagem</option>
              <option value="GUIDE">Guias</option>
              <option value="TOUR">Passeios</option>
              <option value="EVENTS">Eventos</option>
              <option value="NEWS">Notícias</option>
            </select>
            {isEdit && (
              <p className="text-xs text-gray-500 mt-1">
                A categoria não pode ser alterada após criação
              </p>
            )}
            {errors.page && <p className="text-red-600 text-sm mt-1">{errors.page.message}</p>}
          </div>

          {/* Título */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Título *</label>
            <input
              type="text"
              {...register('title')}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.title ? 'border-red-600' : 'border-gray-300'
                }`}
              placeholder="Ex: Bem-vindo ao Portal de Turismo"
            />
            {errors.title && <p className="text-red-600 text-sm mt-1">{errors.title.message}</p>}
          </div>

          {/* Vídeo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Link do Vídeo (YouTube/Vimeo)
            </label>
            <input
              type="url"
              {...register('video')}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.video ? 'border-red-600' : 'border-gray-300'
                }`}
              placeholder="https://youtube.com/watch?v=..."
            />
            {errors.video && <p className="text-red-600 text-sm mt-1">{errors.video.message}</p>}
          </div>

          {/* Imagens */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Imagens (até 10)
            </label>
            <ImageUpload
              images={images}
              onImagesChange={setImages}
              maxImages={10}
            />
            {images.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">
                  A primeira imagem será exibida como principal. Clique para alterar:
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {images.map((img, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={img}
                        alt={`Imagem ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      {index === 0 && (
                        <span className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                          Principal
                        </span>
                      )}
                      {index > 0 && (
                        <button
                          type="button"
                          onClick={() => moveImageToFirst(index)}
                          className="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-sm font-medium rounded-lg"
                        >
                          Tornar Principal
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Detalhes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Conteúdo da Página *
            </label>
            <SimpleRichEditor
              value={detailsContent}
              onChange={(val) => {
                setDetailsContent(val)
                setValue('details', val, { shouldValidate: true })
              }}
            />
            {errors.details && <p className="text-red-600 text-sm mt-1">{errors.details.message}</p>}
          </div>

          {/* Ativo e visibilidade */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                {...register('active')}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Exibir no site</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                {...register('visibleInHeader')}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Visível no menu superior do site</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                {...register('visibleInFooter')}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Visível no Rodapé</span>
            </label>
          </div>
        </div>

        {/* Ações */}
        <div className="flex items-center justify-end gap-3 bg-white rounded-lg shadow p-6">
          <Link
            href="/dash/common-pages"
            className="px-6 py-2 border border-gray-900 text-gray-900 rounded-lg hover:bg-gray-50 transition"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </form>
    </div>
  )
}
