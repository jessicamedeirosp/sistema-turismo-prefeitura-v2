'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import Link from 'next/link'
import { ArrowLeft, Save } from 'lucide-react'
import SimpleRichEditor from '@/components/SimpleRichEditor'
import ImageUpload from '@/components/ImageUpload'
import DistrictSelect from '@/components/DistrictSelect'
import LoadingSpinner from '@/components/LoadingSpinner'

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

export default function AgencyEditPage() {
  const router = useRouter()
  const params = useParams()
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
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
  })

  useEffect(() => {
    if (!session?.user) return

    const fetchData = async () => {
      try {
        // Buscar tags disponíveis
        const tagsRes = await fetch('/api/tags?category=AGENCY')
        if (tagsRes.ok) {
          const tagsData = await tagsRes.json()
          setTags(tagsData)
        }

        // Buscar dados da agência
        const agencyRes = await fetch(`/api/agency/${params.id}`)
        if (!agencyRes.ok) {
          toast.error('Agência não encontrada')
          router.push('/dash/agencies')
          return
        }

        const data = await agencyRes.json()
        const agency = data.agency

        // Preencher formulário
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
        setAgencyType(agency.type)

        // Imagens
        const images = agency.images || []
        if (agency.image) {
          images.unshift(agency.image)
        }
        setAllImages(images)

        // Tags
        const tagIds = agency.tags?.map((t: any) => t.tag.id) || []
        setSelectedTags(tagIds)
      } catch (error) {
        console.error('Error fetching data:', error)
        toast.error('Erro ao carregar dados')
      } finally {
        setLoadingData(false)
      }
    }

    fetchData()
  }, [session, params.id])

  const onSubmit = async (data: AgencyFormData) => {
    if (!session?.user) {
      toast.error('Você precisa estar logado')
      return
    }

    setIsLoading(true)

    try {
      const [mainImage, ...restImages] = allImages

      const payload = {
        ...data,
        details: detailsContent,
        image: mainImage || null,
        images: restImages,
        tags: selectedTags,
      }

      const res = await fetch(`/api/agency/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        toast.success('Agência atualizada com sucesso!')
        router.push('/dash/agencies')
      } else {
        const errorData = await res.json()
        toast.error(errorData.error || 'Erro ao atualizar agência')
      }
    } catch (error) {
      console.error('Error updating agency:', error)
      toast.error('Erro ao atualizar agência')
    } finally {
      setIsLoading(false)
    }
  }

  const toggleTag = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    )
  }

  if (loadingData) {
    return <LoadingSpinner message="Carregando agência..." />
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Botão Voltar */}
      <Link
        href="/dash/agencies"
        className="inline-flex items-center gap-2 text-gray-700 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar
      </Link>

      {/* Título */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Editar Agência/Guia</h1>
        <p className="text-sm text-gray-600">* Campos obrigatórios</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          {/* Tipo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo *
            </label>
            <select
              {...register('type')}
              value={agencyType}
              onChange={(e) => {
                const value = e.target.value as 'AGENCY' | 'GUIDE'
                setAgencyType(value)
                setValue('type', value)
              }}
              disabled
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
            >
              <option value="AGENCY">Agência de Turismo</option>
              <option value="GUIDE">Guia Autônomo</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">O tipo não pode ser alterado</p>
          </div>

          {/* Nome */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome {agencyType === 'AGENCY' ? 'da Agência' : 'do Guia'} *
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

          {/* CNPJ/CPF */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {agencyType === 'AGENCY' ? 'CNPJ' : 'CPF'} *
            </label>
            <input
              type="text"
              {...register('cnpj_cpf')}
              placeholder={agencyType === 'AGENCY' ? '00.000.000/0000-00' : '000.000.000-00'}
              disabled
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 ${errors.cnpj_cpf ? 'border-red-500' : 'border-gray-300'
                }`}
            />
            <p className="text-xs text-gray-500 mt-1">O CPF/CNPJ não pode ser alterado</p>
          </div>

          {/* Credencial */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Credencial/Cadastur *
            </label>
            <input
              type="text"
              {...register('credential')}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.credential ? 'border-red-500' : 'border-gray-300'
                }`}
            />
            {errors.credential && (
              <p className="text-red-600 text-sm mt-1">{errors.credential.message}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email *
            </label>
            <input
              type="email"
              {...register('email')}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
            />
            {errors.email && (
              <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>

          {/* Telefones */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Telefone Principal *
              </label>
              <input
                type="text"
                {...register('phone_primary')}
                placeholder="(12) 98765-4321"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.phone_primary ? 'border-red-500' : 'border-gray-300'
                  }`}
              />
              {errors.phone_primary && (
                <p className="text-red-600 text-sm mt-1">{errors.phone_primary.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Telefone Secundário
              </label>
              <input
                type="text"
                {...register('phone_secondary')}
                placeholder="(12) 3892-0000"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Endereço */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rua *
                </label>
                <input
                  type="text"
                  {...register('address_street')}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.address_street ? 'border-red-500' : 'border-gray-300'
                    }`}
                />
                {errors.address_street && (
                  <p className="text-red-600 text-sm mt-1">{errors.address_street.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número *
                </label>
                <input
                  type="text"
                  {...register('address_number')}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.address_number ? 'border-red-500' : 'border-gray-300'
                    }`}
                />
                {errors.address_number && (
                  <p className="text-red-600 text-sm mt-1">{errors.address_number.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Complemento
                </label>
                <input
                  type="text"
                  {...register('address_complement')}
                  placeholder="Sala, andar, etc"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Redes Sociais */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Website
              </label>
              <input
                type="url"
                {...register('website')}
                placeholder="https://www.exemplo.com.br"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Instagram
                </label>
                <input
                  type="text"
                  {...register('instagram')}
                  placeholder="@usuario"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Facebook
                </label>
                <input
                  type="text"
                  {...register('facebook')}
                  placeholder="facebook.com/pagina"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Tags */}
          {tags.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Especialidades
              </label>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTag(tag.id)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition ${selectedTags.includes(tag.id)
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

          {/* Imagens */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Imagens
            </label>
            <ImageUpload images={allImages} onImagesChange={setAllImages} maxImages={10} />
            <p className="text-xs text-gray-500 mt-1">A primeira imagem será a principal</p>
          </div>

          {/* Detalhes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sobre {agencyType === 'AGENCY' ? 'a Agência' : 'o Guia'}
            </label>
            <SimpleRichEditor value={detailsContent} onChange={setDetailsContent} />
          </div>
        </div>
      </form>

      {/* Botões de ação */}
      <div className="bg-white rounded-lg shadow p-6 mt-6">
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => router.push('/dash/agencies')}
            className="px-6 py-3 border border-gray-900 text-gray-900 rounded-lg hover:bg-gray-50 font-medium"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isLoading}
            onClick={handleSubmit(onSubmit)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
          >
            {isLoading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                Salvando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Salvar
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
