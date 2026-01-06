'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import {
  Building2,
  MapPin,
  Phone,
  Globe,
  Instagram,
  Facebook,
  FileText,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Clock,
  User,
  Mail,
  Calendar,
  Tag as TagIcon,
  Edit,
  ImageIcon,
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Autoplay } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import ConfirmModal from '@/components/ConfirmModal'
import RejectModal from '@/components/RejectModal'
import DetailSection from '@/components/DetailSection'
import DetailField from '@/components/DetailField'

interface BusinessDetailProps {
  params: {
    id: string
  }
}

export default function BusinessDetailPage({ params }: BusinessDetailProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [business, setBusiness] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [showApproveModal, setShowApproveModal] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)

  useEffect(() => {
    fetchBusiness()
  }, [params.id])

  const fetchBusiness = async () => {
    try {
      const res = await fetch(`/api/business/${params.id}`)
      if (res.ok) {
        const data = await res.json()
        setBusiness(data.business)
      } else {
        toast.error('Erro ao carregar empresa')
      }
    } catch (error) {
      toast.error('Erro ao carregar empresa')
    } finally {
      setIsLoading(false)
    }
  }

  const handleApprove = async () => {
    setActionLoading(true)
    try {
      const res = await fetch(`/api/business/${params.id}/approve`, {
        method: 'POST',
      })

      if (res.ok) {
        toast.success('Cadastro aprovado e publicado no site!')
        setShowApproveModal(false)
        fetchBusiness()
      } else {
        toast.error('Erro ao aprovar cadastro')
      }
    } catch (error) {
      toast.error('Erro ao aprovar cadastro')
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = async (reason: string) => {
    setActionLoading(true)
    try {
      const res = await fetch(`/api/business/${params.id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      })

      if (res.ok) {
        toast.success('Cadastro rejeitado')
        setShowRejectModal(false)
        fetchBusiness()
      } else {
        toast.error('Erro ao rejeitar cadastro')
      }
    } catch (error) {
      toast.error('Erro ao rejeitar cadastro')
    } finally {
      setActionLoading(false)
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

  if (!business) {
    return (
      <div>
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-red-600">Empresa não encontrada</p>
        </div>
      </div>
    )
  }

  const statusConfig = {
    PENDING: { label: 'Pendente', color: 'orange', bgColor: 'bg-orange-50', textColor: 'text-orange-700' },
    APPROVED: { label: 'Aprovado e Publicado', color: 'green', bgColor: 'bg-green-50', textColor: 'text-green-700' },
    REJECTED: { label: 'Rejeitado', color: 'red', bgColor: 'bg-red-50', textColor: 'text-red-700' },
  }

  const config = statusConfig[business.status as keyof typeof statusConfig]

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/dash/businesses"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{business.name}</h1>
          </div>
          <span className={`px-4 py-2 rounded-full text-sm font-medium ${config.bgColor} ${config.textColor}`}>
            {config.label}
          </span>
        </div>
      </div>

      <div className="space-y-6">

        {/* Informações do Responsável */}
        <DetailSection icon={User} title="Responsável pelo Cadastro">
          <DetailField icon={User} label="Nome" value={business.user.name} />
          <DetailField icon={Mail} label="Email" value={business.user.email} />
          <DetailField
            icon={Calendar}
            label="Cadastrado em"
            value={new Date(business.created_at).toLocaleDateString('pt-BR')}
          />
          <DetailField
            icon={Clock}
            label="Atualizado em"
            value={new Date(business.updated_at).toLocaleDateString('pt-BR')}
          />
        </DetailSection>

        {/* Informações Básicas */}
        <DetailSection icon={Building2} title="Informações Básicas">
          <DetailField
            icon={Building2}
            label="Categoria"
            value={business.category === 'FOOD' ? 'Alimentação' : 'Acomodação'}
          />
          <DetailField icon={FileText} label="CPF/CNPJ" value={business.cnpj_cpf} />
          <DetailField icon={FileText} label="Cadastur" value={business.cadastur} />
          <DetailField icon={Phone} label="Telefone Principal" value={business.phone_primary} />
          {business.phone_secondary && (
            <DetailField icon={Phone} label="Telefone Secundário" value={business.phone_secondary} />
          )}
        </DetailSection>

        {/* Endereço */}
        <DetailSection icon={MapPin} title="Endereço">
          <DetailField
            icon={MapPin}
            label="Endereço completo"
            value={`${business.address_street}, ${business.address_number}${business.address_complement ? ` - ${business.address_complement}` : ''}, ${business.address_district}`}
          />
        </DetailSection>

        {/* Online */}
        {(business.website || business.instagram || business.facebook || business.link_menu) && (
          <DetailSection icon={Globe} title="Presença Online">
            {business.website && (
              <div className="flex items-start gap-3">
                <Globe className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <span className="text-sm font-medium text-gray-700">Website:</span>{' '}
                  <a href={business.website} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                    {business.website}
                  </a>
                </div>
              </div>
            )}
            {business.instagram && <DetailField icon={Instagram} label="Instagram" value={business.instagram} />}
            {business.facebook && <DetailField icon={Facebook} label="Facebook" value={business.facebook} />}
            {business.link_menu && (
              <div className="flex items-start gap-3">
                <FileText className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <span className="text-sm font-medium text-gray-700">Cardápio/Informações:</span>{' '}
                  <a href={business.link_menu} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                    {business.link_menu}
                  </a>
                </div>
              </div>
            )}
          </DetailSection>
        )}

        {/* Tags */}
        {business.tags && business.tags.length > 0 && (
          <DetailSection icon={TagIcon} title="Tags">
            <div className="flex flex-wrap gap-2">
              {business.tags.map((bt: any) => (
                <span
                  key={bt.tag_id}
                  className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium"
                >
                  {bt.tag.name}
                </span>
              ))}
            </div>
          </DetailSection>
        )}

        {/* Imagens */}
        {business.images && business.images.length > 0 && (
          <DetailSection icon={ImageIcon} title="Imagens">
            <Swiper
              modules={[Navigation, Pagination, Autoplay]}
              navigation
              pagination={{ clickable: true }}
              autoplay={{ delay: 3000, disableOnInteraction: false }}
              loop={business.images.length > 1}
              className="rounded-lg"
            >
              {business.images.map((imageUrl: string, idx: number) => (
                <SwiperSlide key={idx}>
                  <div className="relative w-full h-[400px]">
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
          </DetailSection>
        )}

        {/* Descrição */}
        {business.details && (
          <DetailSection icon={FileText} title="Descrição da Empresa">
            <div
              className="prose prose-sm max-w-none [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:ml-0"
              dangerouslySetInnerHTML={{ __html: business.details }}
            />
          </DetailSection>
        )}

        {/* Cupom */}
        {business.coupon && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg shadow p-6">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-5 h-5 text-blue-700" />
              <h2 className="text-lg font-semibold text-blue-900">Cupom de Desconto</h2>
            </div>
            <p className="text-2xl font-bold text-blue-700">{business.coupon}</p>
          </div>
        )}

        {/* Status Details (se rejeitado) */}
        {business.status === 'REJECTED' && business.status_details && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
            <h2 className="text-lg font-bold text-red-900 mb-2">Motivo da Rejeição</h2>
            <p className="text-red-800">{business.status_details}</p>
          </div>
        )}

        {/* Ações */}
        <DetailSection icon={Building2} title="Ações">
          <div className="flex flex-wrap gap-3">
            {/* Botão Editar - sempre disponível para admin */}
            <Link
              href={`/dash/businesses/${business.id}/edit`}
              className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <Edit className="w-4 h-4" />
              Editar
            </Link>

            {business.status === 'PENDING' && (
              <>
                <button
                  onClick={() => setShowApproveModal(true)}
                  disabled={actionLoading}
                  className="inline-flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                >
                  <CheckCircle className="w-4 h-4" />
                  Aprovar e Publicar no Site
                </button>
                <button
                  onClick={() => setShowRejectModal(true)}
                  disabled={actionLoading}
                  className="inline-flex items-center gap-2 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                >
                  <XCircle className="w-4 h-4" />
                  Rejeitar
                </button>
              </>
            )}

            {business.status === 'APPROVED' && (
              <button
                onClick={() => setShowRejectModal(true)}
                disabled={actionLoading}
                className="inline-flex items-center gap-2 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
              >
                <XCircle className="w-4 h-4" />
                Despublicar e Rejeitar
              </button>
            )}

            {business.status === 'REJECTED' && (
              <button
                onClick={() => setShowApproveModal(true)}
                disabled={actionLoading}
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
        isLoading={actionLoading}
      />

      {/* Modal de Rejeição */}
      <RejectModal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        onConfirm={handleReject}
        isLoading={actionLoading}
      />
    </div>
  )
}
