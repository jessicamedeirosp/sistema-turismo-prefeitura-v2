'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Clock, CheckCircle2, XCircle, AlertCircle, Edit, Building2, User, Mail, Phone, MapPin, Globe, Instagram, Facebook, CreditCard, Award } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

// Import Swiper
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Autoplay } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

type Status = 'PENDING' | 'APPROVED' | 'REJECTED'

interface Agency {
  id: string
  name: string
  type: 'AGENCY' | 'GUIDE'
  email: string
  phone_primary: string
  phone_secondary?: string
  address_street: string
  address_number: string
  address_district: string
  address_complement?: string
  cnpj_cpf: string
  credential: string
  website?: string
  instagram?: string
  facebook?: string
  details?: string
  image?: string
  images: string[]
  status: Status
  status_details?: string
  tags: Array<{ tag: { id: string; name: string } }>
}

const statusConfig = {
  PENDING: {
    label: 'Pendente de Análise',
    icon: Clock,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    borderColor: 'border-yellow-300',
  },
  APPROVED: {
    label: 'Aprovado e Publicado',
    icon: CheckCircle2,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    borderColor: 'border-green-300',
  },
  REJECTED: {
    label: 'Recusado',
    icon: XCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    borderColor: 'border-red-300',
  },
}

export default function AgencyStatusPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [agency, setAgency] = useState<Agency | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchAgency()
  }, [])

  const fetchAgency = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/agency/my-agency')
      if (res.ok) {
        const data = await res.json()
        setAgency(data.agency)
      }
    } catch (error) {
      console.error('Error fetching agency:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!agency) {
    return (
      <div>
        <div className="max-w-4xl mx-auto text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Nenhum cadastro encontrado</h1>
          <p className="text-gray-600 mb-6">Você ainda não possui um cadastro de agência ou guia.</p>
          <Link
            href="/dash/agency/form"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Criar Cadastro
          </Link>
        </div>
      </div>
    )
  }

  const config = statusConfig[agency.status]
  const StatusIcon = config.icon
  const canEdit = agency.status !== 'PENDING'

  return (
    <div>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Status do Cadastro</h1>
          <p className="text-gray-600 mt-1">Acompanhe a situação do seu cadastro</p>
        </div>

        {/* Status Card */}
        <div className={`bg-white rounded-lg shadow-sm border-2 ${config.borderColor} p-6 mb-6`}>
          <div className="flex items-start gap-4">
            <div className={`p-3 ${config.bgColor} rounded-full`}>
              <StatusIcon className={`w-8 h-8 ${config.color}`} />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900">{config.label}</h2>

              {agency.status === 'PENDING' && (
                <p className="text-gray-600 mt-1">
                  Seu cadastro está em análise. Você será notificado quando for aprovado.
                </p>
              )}

              {agency.status === 'APPROVED' && (
                <div className="mt-2">
                  <p className="text-gray-600">
                    Parabéns! Seu cadastro foi aprovado e já está visível no site.
                  </p>
                  <Link
                    href={`/agencias/${agency.id}`}
                    className="inline-flex items-center gap-2 mt-3 text-blue-600 hover:text-blue-700 font-medium"
                  >
                    <Globe className="w-4 h-4" />
                    Ver no Site
                  </Link>
                </div>
              )}

              {agency.status === 'REJECTED' && agency.status_details && (
                <div className="mt-2 p-4 bg-red-50 rounded-lg">
                  <p className="text-sm font-medium text-red-900 mb-1">Motivo da recusa:</p>
                  <p className="text-sm text-red-800">{agency.status_details}</p>
                </div>
              )}
            </div>

            {canEdit && (
              <Link
                href="/dash/agency/form"
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <Edit className="w-4 h-4" />
                Editar
              </Link>
            )}
          </div>
        </div>

        {/* Dados do Cadastro */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Tipo */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              {agency.type === 'AGENCY' ? (
                <>
                  <Building2 className="w-6 h-6 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Tipo de Cadastro</p>
                    <p className="font-semibold text-gray-900">Agência de Turismo</p>
                  </div>
                </>
              ) : (
                <>
                  <User className="w-6 h-6 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Tipo de Cadastro</p>
                    <p className="font-semibold text-gray-900">Guia Autônomo</p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Imagens */}
          {(agency.image || agency.images.length > 0) && (
            <div className="p-6 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-3">Imagens</h3>
              <Swiper
                modules={[Navigation, Pagination, Autoplay]}
                navigation
                pagination={{ clickable: true }}
                autoplay={{ delay: 3000, disableOnInteraction: false }}
                loop={(() => {
                  const totalImages = (agency.image ? 1 : 0) + agency.images.length
                  return totalImages > 1
                })()}
                className="rounded-lg"
              >
                {agency.image && (
                  <SwiperSlide>
                    <div className="relative w-full h-[300px]">
                      <Image
                        src={agency.image}
                        alt={`${agency.name} - Imagem principal`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </SwiperSlide>
                )}
                {agency.images.map((url, idx) => (
                  <SwiperSlide key={idx}>
                    <div className="relative w-full h-[300px]">
                      <Image
                        src={url}
                        alt={`${agency.name} - Foto ${idx + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          )}

          {/* Nome */}
          <div className="p-6 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-2">{agency.name}</h3>
          </div>

          {/* Contato */}
          <div className="p-6 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-3">Informações de Contato</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-700">
                <Mail className="w-4 h-4 text-gray-400" />
                <span>{agency.email}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <Phone className="w-4 h-4 text-gray-400" />
                <span>{agency.phone_primary}</span>
              </div>
              {agency.phone_secondary && (
                <div className="flex items-center gap-2 text-gray-700">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span>{agency.phone_secondary}</span>
                </div>
              )}
            </div>
          </div>

          {/* Endereço */}
          <div className="p-6 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-3">Endereço</h3>
            <div className="flex items-start gap-2 text-gray-700">
              <MapPin className="w-4 h-4 text-gray-400 mt-1" />
              <div>
                <p>{agency.address_street}, {agency.address_number}</p>
                <p>{agency.address_district}</p>
                {agency.address_complement && <p>{agency.address_complement}</p>}
              </div>
            </div>
          </div>

          {/* Documentos */}
          <div className="p-6 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-3">Documentos</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-700">
                <CreditCard className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">{agency.type === 'AGENCY' ? 'CNPJ' : 'CPF'}:</span>
                <span>{agency.cnpj_cpf}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <Award className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">Credencial:</span>
                <span>{agency.credential}</span>
              </div>
            </div>
          </div>

          {/* Redes Sociais */}
          {(agency.website || agency.instagram || agency.facebook) && (
            <div className="p-6 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-3">Presença Online</h3>
              <div className="space-y-2">
                {agency.website && (
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-gray-400" />
                    <a
                      href={agency.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {agency.website}
                    </a>
                  </div>
                )}
                {agency.instagram && (
                  <div className="flex items-center gap-2">
                    <Instagram className="w-4 h-4 text-gray-400" />
                    <a
                      href={`https://instagram.com/${agency.instagram.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {agency.instagram}
                    </a>
                  </div>
                )}
                {agency.facebook && (
                  <div className="flex items-center gap-2">
                    <Facebook className="w-4 h-4 text-gray-400" />
                    <a
                      href={agency.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {agency.facebook}
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tags */}
          {agency.tags.length > 0 && (
            <div className="p-6 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-3">Especialidades</h3>
              <div className="flex flex-wrap gap-2">
                {agency.tags.map(({ tag }) => (
                  <span
                    key={tag.id}
                    className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Descrição */}
          {agency.details && (
            <div className="p-6">
              <h3 className="font-semibold text-gray-900 mb-3">
                Sobre {agency.type === 'AGENCY' ? 'a Agência' : 'o Guia'}
              </h3>
              <div
                className="prose prose-sm max-w-none text-gray-700 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:ml-0"
                dangerouslySetInnerHTML={{ __html: agency.details }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
