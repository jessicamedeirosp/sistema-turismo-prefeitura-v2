'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Building2, MapPin, Phone, Globe, Instagram, Facebook, FileText, Tag as TagIcon, ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'
import SimpleRichEditor from './SimpleRichEditor'
import ImageUpload from './ImageUpload'
import DistrictSelect from './DistrictSelect'

const businessSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  category: z.enum(['FOOD', 'ACCOMMODATION'], { required_error: 'Selecione uma categoria' }),
  cnpj_cpf: z.string().min(11, 'CPF/CNPJ inválido').max(14),
  cadastur: z.string().min(3, 'Cadastur obrigatório'),
  address_street: z.string().min(3, 'Rua obrigatória'),
  address_number: z.string().min(1, 'Número obrigatório'),
  address_district: z.string().min(2, 'Bairro obrigatório'),
  address_complement: z.string().optional(),
  phone_primary: z.string().min(10, 'Telefone inválido'),
  phone_secondary: z.string().optional(),
  website: z.string().url('URL inválida').optional().or(z.literal('')),
  instagram: z.string().optional(),
  facebook: z.string().optional(),
  link_menu: z.string().url('URL inválida').optional().or(z.literal('')),
  details: z.string().optional(),
  coupon: z.string().optional(),
  tags: z.array(z.string()).optional(),
  images: z.array(z.string()).optional(),
})

type BusinessFormData = z.infer<typeof businessSchema>

interface BusinessFormProps {
  mode: 'create' | 'edit' | 'admin-edit'
  businessId?: string
  userRole?: string
  onLoadingChange?: (loading: boolean) => void
}

export default function BusinessForm({ mode, businessId, userRole, onLoadingChange }: BusinessFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isFetchingData, setIsFetchingData] = useState(true)
  const [availableTags, setAvailableTags] = useState<any[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [detailsContent, setDetailsContent] = useState('')
  const [banners, setBanners] = useState<string[]>([])

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<BusinessFormData>({
    resolver: zodResolver(businessSchema),
  })

  const category = watch('category')

  useEffect(() => {
    const fetchData = async () => {
      setIsFetchingData(true)
      try {
        // Define categoria baseada no role do usuário (apenas para create/edit)
        if (mode !== 'admin-edit' && userRole) {
          if (userRole === 'BUSINESS_FOOD') {
            setValue('category', 'FOOD')
          } else if (userRole === 'BUSINESS_ACCOMMODATION') {
            setValue('category', 'ACCOMMODATION')
          }
        }

        // Busca negócio existente
        if (mode === 'edit' || mode === 'admin-edit') {
          const endpoint = mode === 'admin-edit'
            ? `/api/business/${businessId}`
            : '/api/business/my-business'

          const businessRes = await fetch(endpoint)
          if (businessRes.ok) {
            const data = await businessRes.json()
            const business = mode === 'admin-edit' ? data.business : data.business

            if (business) {
              // Define campos do formulário
              const fieldsToSet = ['category', 'name', 'cnpj_cpf', 'cadastur',
                'address_street', 'address_number', 'address_district', 'address_complement',
                'phone_primary', 'phone_secondary', 'website', 'instagram', 'facebook',
                'link_menu', 'coupon']

              fieldsToSet.forEach((field) => {
                if (business[field]) {
                  setValue(field as any, business[field])
                }
              })

              // Tags em estado separado
              if (business.tags) {
                setSelectedTags(business.tags.map((t: any) => t.tag_id))
              }

              // Details em estado separado
              if (business.details) {
                setDetailsContent(business.details)
              }

              // Banners
              if (business.images && business.images.length > 0) {
                setBanners(business.images)
              }
            }
          }
        }

        // Busca tags disponíveis
        const tagsRes = await fetch('/api/tags')
        if (tagsRes.ok) {
          const tagsData = await tagsRes.json()
          setAvailableTags(tagsData.tags || [])
        }
      } catch (error) {
        console.error('Erro ao buscar dados:', error)
        toast.error('Erro ao carregar dados')
      } finally {
        setIsFetchingData(false)
      }
    }

    fetchData()
  }, [mode, businessId, userRole, setValue])

  const filteredTags = availableTags.filter((tag) => tag.category === category)

  const toggleTag = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    )
  }

  const onSubmit = async (data: BusinessFormData) => {
    if (banners.length === 0) {
      toast.error('Adicione pelo menos uma imagem')
      return
    }

    setIsLoading(true)
    onLoadingChange?.(true)

    try {
      const payload = {
        ...data,
        details: detailsContent,
        tags: selectedTags,
        images: banners,
      }

      let endpoint = '/api/business/upsert'
      let method = 'POST'

      if (mode === 'admin-edit') {
        endpoint = `/api/business/${businessId}/update`
        method = 'PUT'
      }

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao salvar')
      }

      // Mensagem de sucesso baseada no modo
      if (mode === 'admin-edit') {
        toast.success('Cadastro atualizado com sucesso!')
        router.push(`/dash/businesses/${businessId}`)
        router.refresh()
      } else {
        const isEditing = mode === 'edit'
        toast.success(
          isEditing
            ? '✅ Cadastro atualizado! Aguarde aprovação da Administrador.'
            : '✅ Cadastro criado com sucesso! Aguarde aprovação da Administrador.',
          { duration: 5000 }
        )
        setTimeout(() => {
          router.push('/dash/business/status')
          router.refresh()
        }, 1500)
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao salvar cadastro')
    } finally {
      setIsLoading(false)
      onLoadingChange?.(false)
    }
  }

  if (isFetchingData) {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-600">Carregando dados...</p>
        </div>
      </div>
    )
  }

  const getTitle = () => {
    if (mode === 'create') return 'Cadastrar Empresa'
    if (mode === 'edit') return 'Editar Empresa'
    return 'Editar Empresa'
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Botão Voltar */}
      <Link
        href={mode === 'admin-edit' && businessId ? `/dash/businesses/${businessId}` : '/dash/business/status'}
        className="inline-flex items-center gap-2 text-gray-700 hover:text-gray-900"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar
      </Link>

      {/* Título e informação de campos obrigatórios */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{getTitle()}</h1>
        <p className="text-sm text-gray-600">* Campos obrigatórios</p>
      </div>

      {/* Categoria */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Building2 className="w-5 h-5" />
          Categoria
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="relative cursor-pointer">
            <input
              type="radio"
              value="FOOD"
              {...register('category')}
              className="peer sr-only"
            />
            <div className="border-2 border-gray-200 rounded-lg p-4 peer-checked:border-blue-500 peer-checked:bg-blue-50 transition">
              <p className="font-semibold text-gray-900">🍽️ Alimentação</p>
              <p className="text-sm text-gray-600">Restaurantes, lanchonetes, etc.</p>
            </div>
          </label>
          <label className="relative cursor-pointer">
            <input
              type="radio"
              value="ACCOMMODATION"
              {...register('category')}
              className="peer sr-only"
            />
            <div className="border-2 border-gray-200 rounded-lg p-4 peer-checked:border-purple-500 peer-checked:bg-purple-50 transition">
              <p className="font-semibold text-gray-900">🏨 Acomodação</p>
              <p className="text-sm text-gray-600">Hotéis, pousadas, etc.</p>
            </div>
          </label>
        </div>
        {errors.category && (
          <p className="text-red-600 text-sm mt-2">{errors.category.message}</p>
        )}
      </div>

      {/* Informações Básicas */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Informações Básicas
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome da Empresa *
            </label>
            <input
              {...register('name')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ex: Restaurante do João"
            />
            {errors.name && (
              <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CPF/CNPJ *
              </label>
              <input
                {...register('cnpj_cpf')}
                maxLength={14}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="00000000000000"
              />
              {errors.cnpj_cpf && (
                <p className="text-red-600 text-sm mt-1">{errors.cnpj_cpf.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cadastur *
              </label>
              <input
                {...register('cadastur')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Número do cadastur"
              />
              {errors.cadastur && (
                <p className="text-red-600 text-sm mt-1">{errors.cadastur.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Descrição da Empresa *
            </label>
            <SimpleRichEditor
              value={detailsContent}
              onChange={setDetailsContent}
              placeholder="Descreva sua empresa, serviços, diferenciais..."
            />
          </div>
        </div>
      </div>

      {/* Imagens do Estabelecimento */}
      <ImageUpload
        images={banners}
        onImagesChange={setBanners}
        maxImages={10}
        title="Imagens do Estabelecimento"
        description="Adicione fotos que representem seu estabelecimento. Clique na estrela para definir a foto principal."
      />

      {/* Endereço */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Endereço
        </h2>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rua *
              </label>
              <input
                {...register('address_street')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nome da rua"
              />
              {errors.address_street && (
                <p className="text-red-600 text-sm mt-1">{errors.address_street.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Número *
              </label>
              <input
                {...register('address_number')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="123"
              />
              {errors.address_number && (
                <p className="text-red-600 text-sm mt-1">{errors.address_number.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Complemento
              </label>
              <input
                {...register('address_complement')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Sala, Bloco, etc."
              />
            </div>
          </div>
        </div>
      </div>

      {/* Contato */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Phone className="w-5 h-5" />
          Contato
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Telefone Principal *
            </label>
            <input
              {...register('phone_primary')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="(00) 00000-0000"
            />
            {errors.phone_primary && (
              <p className="text-red-600 text-sm mt-1">{errors.phone_primary.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Telefone Secundário
            </label>
            <input
              {...register('phone_secondary')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="(00) 00000-0000"
            />
          </div>
        </div>
      </div>

      {/* Redes Sociais */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Globe className="w-5 h-5" />
          Online
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Website
            </label>
            <input
              {...register('website')}
              type="url"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://example.com"
            />
            {errors.website && (
              <p className="text-red-600 text-sm mt-1">{errors.website.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                <Instagram className="w-4 h-4" />
                Instagram
              </label>
              <input
                {...register('instagram')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="@seuusuario"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                <Facebook className="w-4 h-4" />
                Facebook
              </label>
              <input
                {...register('facebook')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="@suapagina"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Link do Cardápio/Informações
            </label>
            <input
              {...register('link_menu')}
              type="url"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://link-do-cardapio.com"
            />
            {errors.link_menu && (
              <p className="text-red-600 text-sm mt-1">{errors.link_menu.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cupom de Desconto
            </label>
            <input
              {...register('coupon')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ex: BEMVINDO10"
            />
          </div>
        </div>
      </div>

      {/* Tags */}
      {category && filteredTags.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <TagIcon className="w-5 h-5" />
            Tags
          </h2>
          <div className="flex flex-wrap gap-2">
            {filteredTags.map((tag) => (
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

      {/* Botões */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 border border-gray-900 text-gray-900 rounded-lg hover:bg-gray-50 transition"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            {isLoading ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </form>
  )
}
