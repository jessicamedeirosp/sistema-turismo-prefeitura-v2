'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import {
  Building2,
  User,
  Mail,
  Phone,
  MapPin,
  Globe,
  Instagram,
  Facebook,
  CreditCard,
  Award,
  Clock,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Calendar,
  Tag as TagIcon,
  ImageIcon,
  Edit,
} from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import Image from 'next/image'

// Import Swiper
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Autoplay } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

import ConfirmModal from '@/components/ConfirmModal'
import RejectModal from '@/components/RejectModal'
import DetailSection from '@/components/DetailSection'
import DetailField from '@/components/DetailField'

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
  created_at: string
  updated_at: string
  user: {
    id: string
    name: string
    email: string
  }
  tags: Array<{ tag: { id: string; name: string } }>
}

const statusConfig = {
  PENDING: {
    label: 'Pendente',
    icon: Clock,
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-700',
  },
  APPROVED: {
    label: 'Aprovado e Publicado',
    icon: CheckCircle,
    bgColor: 'bg-green-50',
    textColor: 'text-green-700',
  },
  REJECTED: {
    label: 'Rejeitado',
    icon: XCircle,
    bgColor: 'bg-red-50',
    textColor: 'text-red-700',
  },
}

export default function AgencyDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { data: session } = useSession()
  const [agency, setAgency] = useState<Agency | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isApproving, setIsApproving] = useState(false)
  const [isRejecting, setIsRejecting] = useState(false)
  const [showApproveModal, setShowApproveModal] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)

  useEffect(() => {
    if (session?.user?.role && !['ADMIN', 'MODERATOR'].includes(session.user.role)) {
      router.push('/dash')
      return
    }
    fetchAgency()
  }, [session, params.id])

  const fetchAgency = async () => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/agency/${params.id}`)
      if (res.ok) {
        const data = await res.json()
        setAgency(data.agency)
      } else {
        toast.error('Agência não encontrada')
        router.push('/dash/agencies')
      }
    } catch (error) {
      console.error('Error fetching agency:', error)
      toast.error('Erro ao carregar agência')
    } finally {
      setIsLoading(false)
    }
  }

  const handleApprove = async () => {
    if (!agency) return

    setIsApproving(true)
    try {
      const res = await fetch(`/api/agency/${agency.id}/approve`, {
        method: 'POST',
      })

      if (res.ok) {
        toast.success('Cadastro aprovado e publicado!')
        setShowApproveModal(false)
        fetchAgency()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Erro ao aprovar cadastro')
      }
    } catch (error) {
      toast.error('Erro ao aprovar cadastro')
    } finally {
      setIsApproving(false)
    }
  }

  const handleReject = async (reason: string) => {
    if (!agency) return

    setIsRejecting(true)
    try {
      const res = await fetch(`/api/agency/${agency.id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      })

      if (res.ok) {
        toast.success('Cadastro recusado')
        setShowRejectModal(false)
        fetchAgency()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Erro ao recusar cadastro')
      }
    } catch (error) {
      toast.error('Erro ao recusar cadastro')
    } finally {
      setIsRejecting(false)
    }
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

  if (!agency) {
    return (
      <div>
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-red-600">Agência não encontrada</p>
        </div>
      </div>
    )
  }

  const config = statusConfig[agency.status]

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/dash/agencies"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{agency.name}</h1>
          </div>
          <span className={`px-4 py-2 rounded-full text-sm font-medium ${config.bgColor} ${config.textColor}`}>
            {config.label}
          </span>
        </div>
      </div>

      {/* Status Details (se rejeitado) */}
      {agency.status === 'REJECTED' && agency.status_details && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-bold text-red-900 mb-2">Motivo da Rejeição</h2>
          <p className="text-red-800">{agency.status_details}</p>
        </div>
      )}

      <div className="space-y-6">
        {/* Informações do Responsável */}
        <DetailSection icon={User} title="Responsável pelo Cadastro">
          <DetailField icon={User} label="Nome" value={agency.user.name} />
          <DetailField icon={Mail} label="Email" value={agency.user.email} />
          <DetailField
            icon={Calendar}
            label="Cadastrado em"
            value={new Date(agency.created_at).toLocaleDateString('pt-BR')}
          />
          <DetailField
            icon={Clock}
            label="Atualizado em"
            value={new Date(agency.updated_at).toLocaleDateString('pt-BR')}
          />
        </DetailSection>

        {/* Informações Básicas */}
        <DetailSection
          icon={agency.type === 'AGENCY' ? Building2 : User}
          title="Informações Básicas"
        >
          <DetailField
            icon={Building2}
            label="Tipo"
            value={agency.type === 'AGENCY' ? 'Agência de Turismo' : 'Guia Autônomo'}
          />
          <DetailField
            icon={CreditCard}
            label={agency.type === 'AGENCY' ? 'CNPJ' : 'CPF'}
            value={agency.cnpj_cpf}
          />
          <DetailField
            icon={Award}
            label="Credencial/Cadastur"
            value={agency.credential}
          />
          <DetailField icon={Mail} label="Email" value={agency.email} />
          <DetailField icon={Phone} label="Telefone Principal" value={agency.phone_primary} />
          {agency.phone_secondary && (
            <DetailField icon={Phone} label="Telefone Secundário" value={agency.phone_secondary} />
          )}
        </DetailSection>

        {/* Endereço */}
        <DetailSection icon={MapPin} title="Endereço">
          <DetailField
            icon={MapPin}
            label="Endereço completo"
            value={`${agency.address_street}, ${agency.address_number}${agency.address_complement ? ` - ${agency.address_complement}` : ''}, ${agency.address_district}`}
          />
        </DetailSection>

        {/* Online */}
        {(agency.website || agency.instagram || agency.facebook) && (
          <DetailSection icon={Globe} title="Presença Online">
            {agency.website && (
              <div className="flex items-start gap-3">
                <Globe className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <span className="text-sm font-medium text-gray-700">Website:</span>{' '}
                  <a href={agency.website} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                    {agency.website}
                  </a>
                </div>
              </div>
            )}
            {agency.instagram && <DetailField icon={Instagram} label="Instagram" value={agency.instagram} />}
            {agency.facebook && <DetailField icon={Facebook} label="Facebook" value={agency.facebook} />}
          </DetailSection>
        )}

        {/* Tags */}
        {agency.tags && agency.tags.length > 0 && (
          <DetailSection icon={TagIcon} title="Especialidades">
            <div className="flex flex-wrap gap-2">
              {agency.tags.map(({ tag }) => (
                <span
                  key={tag.id}
                  className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium"
                >
                  {tag.name}
                </span>
              ))}
            </div>
          </DetailSection>
        )}

        {/* Imagens */}
        {(agency.image || agency.images.length > 0) && (
          <DetailSection icon={ImageIcon} title="Imagens">
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
                  <div className="relative w-full h-[400px]">
                    <Image
                      src={agency.image}
                      alt={`${agency.name} - Imagem principal`}
                      fill
                      className="object-cover rounded-lg"
                    />
                  </div>
                </SwiperSlide>
              )}
              {agency.images.map((url, idx) => (
                <SwiperSlide key={idx}>
                  <div className="relative w-full h-[400px]">
                    <Image
                      src={url}
                      alt={`${agency.name} - Foto ${idx + 1}`}
                      fill
                      className="object-cover rounded-lg"
                    />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </DetailSection>
        )}

        {/* Descrição */}
        {agency.details && (
          <DetailSection icon={Building2} title={`Sobre ${agency.type === 'AGENCY' ? 'a Agência' : 'o Guia'}`}>
            <div
              className="prose prose-sm max-w-none [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:ml-0"
              dangerouslySetInnerHTML={{ __html: agency.details }}
            />
          </DetailSection>
        )}

        {/* Ações */}
        <DetailSection icon={Building2} title="Ações">
          <div className="flex flex-wrap gap-3">
            <Link
              href={`/dash/agency/${agency.id}`}
              className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <Edit className="w-4 h-4" />
              Editar
            </Link>

            {agency.status === 'PENDING' && (
              <>
                <button
                  onClick={() => setShowApproveModal(true)}
                  disabled={isApproving}
                  className="inline-flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                >
                  <CheckCircle className="w-4 h-4" />
                  Aprovar e Publicar no Site
                </button>
                <button
                  onClick={() => setShowRejectModal(true)}
                  disabled={isRejecting}
                  className="inline-flex items-center gap-2 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                >
                  <XCircle className="w-4 h-4" />
                  Rejeitar
                </button>
              </>
            )}

            {agency.status === 'APPROVED' && (
              <button
                onClick={() => setShowRejectModal(true)}
                disabled={isRejecting}
                className="inline-flex items-center gap-2 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
              >
                <XCircle className="w-4 h-4" />
                Despublicar e Rejeitar
              </button>
            )}

            {agency.status === 'REJECTED' && (
              <button
                onClick={() => setShowApproveModal(true)}
                disabled={isApproving}
                className="inline-flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
              >
                <CheckCircle className="w-4 h-4" />
                Aprovar e Publicar no Site
              </button>
            )}
          </div>
        </DetailSection>
      </div>

      {/* Modal de Aprovação */}
      <ConfirmModal
        isOpen={showApproveModal}
        onClose={() => setShowApproveModal(false)}
        onConfirm={handleApprove}
        title="Aprovar Cadastro"
        message="Deseja aprovar este cadastro? Ele será publicado no site e ficará visível para todos os visitantes."
        confirmText="Aprovar e Publicar"
        confirmButtonClass="bg-green-600 hover:bg-green-700"
        isLoading={isApproving}
      />

      {/* Modal de Rejeição */}
      <RejectModal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        onConfirm={handleReject}
        isLoading={isRejecting}
      />
    </div>
  )
}
