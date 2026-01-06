'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Building2, User, Save } from 'lucide-react'
import SimpleRichEditor from '@/components/SimpleRichEditor'
import ImageUpload from '@/components/ImageUpload'
import DistrictSelect from '@/components/DistrictSelect'

const agencySchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  type: z.enum(['AGENCY', 'GUIDE']),
  email: z.string().email('Email inválido'),
  phone_primary: z.string().min(1, 'Telefone principal é obrigatório'),
  phone_secondary: z.string().optional(),
  address_street: z.string().min(1, 'Rua é obrigatória'),
  address_number: z.string().min(1, 'Número é obrigatório'),
  address_district: z.string().min(1, 'Bairro é obrigatório'),
  address_complement: z.string().optional(),
  cnpj_cpf: z.string().min(11, 'CPF/CNPJ inválido').max(14),
  credential: z.string().min(1, 'Credencial é obrigatória'),
  website: z.string().optional(),
  instagram: z.string().optional(),
  facebook: z.string().optional(),
  details: z.string().optional(),
  tags: z.array(z.string()).default([]),
})

type AgencyFormData = z.infer<typeof agencySchema>

export default function AgencyFormPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [detailsContent, setDetailsContent] = useState('')
  const [allImages, setAllImages] = useState<string[]>([])
  const [tags, setTags] = useState<any[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [agencyType, setAgencyType] = useState<'AGENCY' | 'GUIDE'>('AGENCY')

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<AgencyFormData>({
    resolver: zodResolver(agencySchema),
    defaultValues: {
      type: 'AGENCY',
      tags: [],
    },
  })

  const watchType = watch('type')

  useEffect(() => {
    if (watchType) {
      setAgencyType(watchType)
      fetchTags(watchType)
    }
  }, [watchType])

  useEffect(() => {
    fetchExistingAgency()
  }, [])

  const fetchTags = async (type: 'AGENCY' | 'GUIDE') => {
    try {
      const res = await fetch(`/api/agency/tags?type=${type}`)
      if (res.ok) {
        const data = await res.json()
        setTags(data.tags)
      }
    } catch (error) {
      console.error('Error fetching tags:', error)
    }
  }

  const fetchExistingAgency = async () => {
    try {
      const res = await fetch('/api/agency/my-agency')
      if (res.ok) {
        const data = await res.json()
        if (data.agency) {
          const agency = data.agency
          setValue('name', agency.name)
          setValue('type', agency.type)
          setValue('email', agency.email)
          setValue('phone_primary', agency.phone_primary)
          setValue('phone_secondary', agency.phone_secondary || '')
          setValue('address_street', agency.address_street)
          setValue('address_number', agency.address_number)
          setValue('address_district', agency.address_district)
          setValue('address_complement', agency.address_complement || '')
          setValue('cnpj_cpf', agency.cnpj_cpf)
          setValue('credential', agency.credential)
          setValue('website', agency.website || '')
          setValue('instagram', agency.instagram || '')
          setValue('facebook', agency.facebook || '')
          setDetailsContent(agency.details || '')

          // Combinar image e images em um único array
          const images = []
          if (agency.image) images.push(agency.image)
          if (agency.images) images.push(...agency.images)
          setAllImages(images)

          setAgencyType(agency.type)

          const tagIds = agency.tags.map((t: any) => t.tag_id)
          setSelectedTags(tagIds)
          setValue('tags', tagIds)
        }
      }
    } catch (error) {
      console.error('Error fetching agency:', error)
    }
  }

  const handleTagToggle = (tagId: string) => {
    const newTags = selectedTags.includes(tagId)
      ? selectedTags.filter((id) => id !== tagId)
      : [...selectedTags, tagId]

    setSelectedTags(newTags)
    setValue('tags', newTags)
  }

  const onSubmit = async (data: AgencyFormData) => {
    if (allImages.length === 0) {
      toast.error('Adicione pelo menos uma imagem')
      return
    }

    setIsLoading(true)
    try {
      const payload = {
        ...data,
        details: detailsContent,
        image: allImages[0], // Primeira imagem como perfil
        images: allImages.slice(1), // Restante como galeria
        tags: selectedTags,
      }

      const res = await fetch('/api/agency/upsert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        toast.success('Cadastro salvo com sucesso!')
        router.push('/dash/agency/status')
        router.refresh()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Erro ao salvar cadastro')
      }
    } catch (error) {
      toast.error('Erro ao salvar cadastro')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Cadastro de Agência/Guia</h1>
          <p className="text-gray-600 mt-1">Preencha os dados para cadastrar sua agência ou perfil de guia</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Tipo */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Tipo de Cadastro</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition ${watchType === 'AGENCY' ? 'border-blue-600 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                }`}>
                <input
                  type="radio"
                  value="AGENCY"
                  {...register('type')}
                  className="w-4 h-4"
                />
                <Building2 className="w-6 h-6 text-blue-600" />
                <div>
                  <p className="font-semibold text-gray-900">Agência de Turismo</p>
                  <p className="text-sm text-gray-600">Empresa com CNPJ</p>
                </div>
              </label>

              <label className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition ${watchType === 'GUIDE' ? 'border-blue-600 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                }`}>
                <input
                  type="radio"
                  value="GUIDE"
                  {...register('type')}
                  className="w-4 h-4"
                />
                <User className="w-6 h-6 text-blue-600" />
                <div>
                  <p className="font-semibold text-gray-900">Guia Autônomo</p>
                  <p className="text-sm text-gray-600">Profissional independente</p>
                </div>
              </label>
            </div>
          </div>

          {/* Informações Básicas */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Informações Básicas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome {agencyType === 'AGENCY' ? 'da Agência' : 'do Guia'} *
                </label>
                <input
                  type="text"
                  {...register('name')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={agencyType === 'AGENCY' ? 'Nome da empresa' : 'Seu nome completo'}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {agencyType === 'AGENCY' ? 'CNPJ' : 'CPF'} *
                </label>
                <input
                  type="text"
                  {...register('cnpj_cpf')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={agencyType === 'AGENCY' ? '00.000.000/0000-00' : '000.000.000-00'}
                  maxLength={14}
                />
                {errors.cnpj_cpf && (
                  <p className="mt-1 text-sm text-red-600">{errors.cnpj_cpf.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Credencial/Cadastur *
                </label>
                <input
                  type="text"
                  {...register('credential')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Número da credencial"
                />
                {errors.credential && (
                  <p className="mt-1 text-sm text-red-600">{errors.credential.message}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email de Contato *
                </label>
                <input
                  type="email"
                  {...register('email')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="email@exemplo.com"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Este email será exibido como forma de contato no site
                </p>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefone Principal *
                </label>
                <input
                  type="tel"
                  {...register('phone_primary')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="(00) 00000-0000"
                />
                {errors.phone_primary && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone_primary.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefone Secundário
                </label>
                <input
                  type="tel"
                  {...register('phone_secondary')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="(00) 00000-0000"
                />
              </div>
            </div>
          </div>

          {/* Endereço */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Endereço</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rua *
                </label>
                <input
                  type="text"
                  {...register('address_street')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.address_street && (
                  <p className="mt-1 text-sm text-red-600">{errors.address_street.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Número *
                </label>
                <input
                  type="text"
                  {...register('address_number')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.address_number && (
                  <p className="mt-1 text-sm text-red-600">{errors.address_number.message}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bairro *
                </label>
                <DistrictSelect
                  value={watch('address_district') || ''}
                  onChange={(value) => setValue('address_district', value)}
                  placeholder="Digite ou selecione um bairro"
                />
                {errors.address_district && (
                  <p className="mt-1 text-sm text-red-600">{errors.address_district.message}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Complemento
                </label>
                <input
                  type="text"
                  {...register('address_complement')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Redes Sociais */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Presença Online</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Website
                </label>
                <input
                  type="url"
                  {...register('website')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Instagram
                </label>
                <input
                  type="text"
                  {...register('instagram')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="@usuario"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Facebook
                </label>
                <input
                  type="text"
                  {...register('facebook')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="facebook.com/pagina"
                />
              </div>
            </div>
          </div>

          {/* Tags */}
          {tags.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Especialidades</h2>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => handleTagToggle(tag.id)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition ${selectedTags.includes(tag.id)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Imagens - Componente Reutilizável */}
          <ImageUpload
            images={allImages}
            onImagesChange={setAllImages}
            maxImages={10}
            title="Fotos"
            description="Adicione fotos da agência ou do seu trabalho como guia. Clique na estrela para definir qual será a foto principal."
          />

          {/* Descrição */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Sobre {agencyType === 'AGENCY' ? 'a Agência' : 'Você'}
            </h2>
            <SimpleRichEditor
              value={detailsContent}
              onChange={setDetailsContent}
              placeholder="Conte mais sobre seus serviços, experiência e diferenciais..."
            />
          </div>

          {/* Botões */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Salvar Cadastro
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
