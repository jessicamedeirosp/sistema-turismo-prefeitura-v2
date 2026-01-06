'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import Link from 'next/link'
import { ArrowLeft, Save, Trash2 } from 'lucide-react'
import DistrictSelect from '@/components/DistrictSelect'
import ConfirmModal from '@/components/ConfirmModal'

const parkingSchema = z.object({
  company: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  address: z.string().min(5, 'Endereço deve ter no mínimo 5 caracteres'),
  address_district: z.string().min(2, 'Bairro obrigatório'),
  van: z.boolean().default(false),
  micro: z.boolean().default(false),
  onibus: z.boolean().default(false),
  phone: z.string().min(10, 'Telefone inválido'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  route_link: z.string().url('URL inválida').optional().or(z.literal('')),
  active: z.boolean().default(true)
})

type ParkingFormData = z.infer<typeof parkingSchema>

export default function ParkingFormPage() {
  const router = useRouter()
  const params = useParams()
  const parkingId = params.id as string
  const isEdit = parkingId && parkingId !== 'new'

  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<ParkingFormData>({
    resolver: zodResolver(parkingSchema),
    defaultValues: {
      active: true,
      van: false,
      micro: false,
      onibus: false
    }
  })

  useEffect(() => {
    if (isEdit) {
      setLoadingData(true)
      fetch(`/api/parkings/${parkingId}`, {
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
        .then((parking) => {
          setValue('company', parking.company)
          setValue('address', parking.address)
          setValue('address_district', parking.address_district)
          setValue('van', parking.van)
          setValue('micro', parking.micro)
          setValue('onibus', parking.onibus)
          setValue('phone', parking.phone)
          setValue('email', parking.email)
          setValue('route_link', parking.route_link)
          setValue('active', parking.active)
        })
        .catch((err) => {
          console.error('Erro ao buscar estacionamento:', err)
        })
        .finally(() => setLoadingData(false))
    }
  }, [isEdit, parkingId, setValue])

  const onSubmit = async (data: ParkingFormData) => {
    setLoading(true)

    try {
      const url = isEdit ? `/api/parkings/${parkingId}` : '/api/parkings'
      const method = isEdit ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error)
      }

      toast.success(isEdit ? 'Estacionamento atualizado com sucesso!' : 'Estacionamento cadastrado com sucesso!')
      router.push('/dash/parkings')
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || 'Erro ao salvar estacionamento')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!isEdit) return

    try {
      const response = await fetch(`/api/parkings/${parkingId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error)
      }

      toast.success('Estacionamento excluído com sucesso!')
      router.push('/dash/parkings')
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || 'Erro ao excluir estacionamento')
    } finally {
      setShowDeleteModal(false)
    }
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
        href="/dash/parkings"
        className="inline-flex items-center gap-2 text-gray-700 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar
      </Link>

      {/* Título e informação de campos obrigatórios */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {isEdit ? 'Editar Estacionamento' : 'Cadastrar Estacionamento'}
        </h1>
        <p className="text-sm text-gray-600">* Campos obrigatórios</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          {/* Empresa */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome da Empresa *
            </label>
            <input
              type="text"
              {...register('company')}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.company ? 'border-red-500' : 'border-gray-300'
                }`}
            />
            {errors.company && (
              <p className="text-red-600 text-sm mt-1">{errors.company.message}</p>
            )}
          </div>

          {/* Endereço */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Endereço *
            </label>
            <input
              type="text"
              {...register('address')}
              placeholder="Rua, número"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.address ? 'border-red-500' : 'border-gray-300'
                }`}
            />
            {errors.address && (
              <p className="text-red-600 text-sm mt-1">{errors.address.message}</p>
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

          {/* Tipos de Veículos */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Tipos de Veículos Aceitos
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  {...register('van')}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Van</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  {...register('micro')}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Micro-ônibus</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  {...register('onibus')}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Ônibus</span>
              </label>
            </div>
          </div>

          {/* Telefone e Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Telefone *
              </label>
              <input
                type="tel"
                {...register('phone')}
                placeholder="(12) 99999-9999"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.phone ? 'border-red-500' : 'border-gray-300'
                  }`}
              />
              {errors.phone && (
                <p className="text-red-600 text-sm mt-1">{errors.phone.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                {...register('email')}
                placeholder="contato@exemplo.com"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
              />
              {errors.email && (
                <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>
          </div>

          {/* Link da Rota */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Link da Rota (Google Maps)
            </label>
            <input
              type="url"
              {...register('route_link')}
              placeholder="https://maps.google.com/..."
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.route_link ? 'border-red-500' : 'border-gray-300'
                }`}
            />
            {errors.route_link && (
              <p className="text-red-600 text-sm mt-1">{errors.route_link.message}</p>
            )}
          </div>

          {/* Checkbox Exibir no site */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="active"
              {...register('active')}
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
                onClick={() => router.push('/dash/parkings')}
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
        title="Deletar Estacionamento"
        message="Tem certeza que deseja deletar este estacionamento? Esta ação não pode ser desfeita."
        confirmText="Deletar"
      />
    </div>
  )
}
