'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { CheckCircle, Clock, XCircle, Eye, Edit, AlertCircle, ImageIcon } from 'lucide-react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Autoplay } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

export default function BusinessStatusPage() {
  const { data: session } = useSession()
  const [business, setBusiness] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchBusiness = async () => {
      try {
        const res = await fetch('/api/business/my-business')
        if (res.ok) {
          const data = await res.json()
          setBusiness(data.business)
        }
      } catch (error) {
        console.error('Error fetching business:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (session) {
      fetchBusiness()
    }
  }, [session])

  if (!session) {
    redirect('/auth')
  }

  if (isLoading) {
    return (
      <div>
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-gray-500">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!business) {
    return (
      <div>
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Nenhum cadastro encontrado
            </h2>
            <p className="text-gray-600 mb-6">
              Você ainda não criou seu cadastro de empresa
            </p>
            <Link
              href="/dash/business/form"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Criar Cadastro
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const statusConfig = {
    PENDING: {
      label: 'Pendente',
      icon: Clock,
      color: 'orange',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      textColor: 'text-orange-700',
      iconColor: 'text-orange-600',
      description: 'Seu cadastro está aguardando análise da Administrador',
    },
    APPROVED: {
      label: 'Aprovado e Publicado',
      icon: CheckCircle,
      color: 'green',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-700',
      iconColor: 'text-green-600',
      description: 'Seu cadastro foi aprovado e está visível no site público',
    },
    REJECTED: {
      label: 'Rejeitado',
      icon: XCircle,
      color: 'red',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-700',
      iconColor: 'text-red-600',
      description: 'Seu cadastro foi rejeitado. Veja os detalhes abaixo.',
    },
  }

  const config = statusConfig[business.status as keyof typeof statusConfig]
  const StatusIcon = config.icon

  return (
    <div>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Status do Cadastro</h1>
          <p className="text-gray-600 mt-1">Acompanhe o status da sua empresa</p>
        </div>

        {/* Card de Status */}
        <div className={`bg-white rounded-lg shadow-sm border-2 ${config.borderColor} p-6 mb-6`}>
          <div className="flex items-start gap-4">
            <div className={`${config.bgColor} p-3 rounded-lg`}>
              <StatusIcon className={`w-8 h-8 ${config.iconColor}`} />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-bold text-gray-900">{business.name}</h2>
                <span className={`px-4 py-2 ${config.bgColor} ${config.textColor} rounded-full text-sm font-medium`}>
                  {config.label}
                </span>
              </div>
              <p className={`${config.textColor} font-medium mb-3`}>
                {config.description}
              </p>

              {/* Detalhes de Rejeição */}
              {business.status === 'REJECTED' && business.status_details && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm font-semibold text-red-900 mb-1">
                    Motivo da rejeição:
                  </p>
                  <p className="text-sm text-red-800">{business.status_details}</p>
                </div>
              )}

              {/* Observações de Aprovação */}
              {business.status === 'APPROVED' && business.status_details && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm font-semibold text-green-900 mb-1">
                    Observações:
                  </p>
                  <p className="text-sm text-green-800">{business.status_details}</p>
                </div>
              )}

              <div className="flex gap-3 mt-4">
                <Link
                  href="/dash/business/form"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  <Edit className="w-4 h-4" />
                  Editar Cadastro
                </Link>

                {business.status === 'APPROVED' && (
                  <Link
                    href={`/business/${business.id}`}
                    target="_blank"
                    className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                  >
                    <Eye className="w-4 h-4" />
                    Ver no Site
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Informações do Cadastro */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Informações do Cadastro</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Categoria:</span>
              <span className="ml-2 font-semibold text-gray-900">
                {business.category === 'FOOD' ? '🍽️ Alimentação' : '🏨 Acomodação'}
              </span>
            </div>
            <div>
              <span className="text-gray-600">CPF/CNPJ:</span>
              <span className="ml-2 font-semibold text-gray-900">{business.cnpj_cpf}</span>
            </div>
            <div>
              <span className="text-gray-600">Telefone:</span>
              <span className="ml-2 font-semibold text-gray-900">{business.phone_primary}</span>
            </div>
            <div>
              <span className="text-gray-600">Cadastur:</span>
              <span className="ml-2 font-semibold text-gray-900">{business.cadastur}</span>
            </div>
            <div>
              <span className="text-gray-600">Criado em:</span>
              <span className="ml-2 font-semibold text-gray-900">
                {new Date(business.created_at).toLocaleDateString('pt-BR')}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Última atualização:</span>
              <span className="ml-2 font-semibold text-gray-900">
                {new Date(business.updated_at).toLocaleDateString('pt-BR')}
              </span>
            </div>
          </div>

          {business.tags.length > 0 && (
            <div className="mt-4">
              <span className="text-gray-600 text-sm">Tags:</span>
              <div className="flex flex-wrap gap-2 mt-2">
                {business.tags.map((bt: { tag_id: string, tag: { name: string } }) => (
                  <span
                    key={bt.tag_id}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                  >
                    {bt.tag.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {business.details && (
            <div className="mt-4">
              <span className="text-gray-600 text-sm block mb-2">Descrição:</span>
              <div
                className="mt-1 text-gray-900 prose prose-sm max-w-none [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:ml-0"
                dangerouslySetInnerHTML={{ __html: business.details }}
              />
            </div>
          )}

          {business.images && business.images.length > 0 && (
            <div className="mt-4">
              <span className="text-gray-600 text-sm block mb-2">Imagens:</span>
              <Swiper
                modules={[Navigation, Pagination, Autoplay]}
                navigation
                pagination={{ clickable: true }}
                autoplay={{ delay: 3000, disableOnInteraction: false }}
                loop={business.images.length > 1}
                className="rounded-lg mt-2"
              >
                {business.images.map((imageUrl: string, idx: number) => (
                  <SwiperSlide key={idx}>
                    <div className="relative w-full h-[300px]">
                      <Image
                        src={imageUrl}
                        alt={`${business.name} - Imagem ${idx + 1}`}
                        fill
                        className="object-cover rounded-lg"
                      />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          )}
        </div>

        {/* Timeline de Status */}
        <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Histórico</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="text-sm text-gray-600">
                Cadastro criado em {new Date(business.created_at).toLocaleDateString('pt-BR')}
              </span>
            </div>
            {business.status !== 'PENDING' && (
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${config.iconColor.replace('text-', 'bg-')}`} />
                <span className="text-sm text-gray-600">
                  Status atual: {config.label} - Atualizado em{' '}
                  {new Date(business.updated_at).toLocaleDateString('pt-BR')}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
