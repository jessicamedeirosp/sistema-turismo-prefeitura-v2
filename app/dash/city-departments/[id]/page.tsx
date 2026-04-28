'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import Link from 'next/link'
import { ArrowLeft, Save, Trash2 } from 'lucide-react'
import ConfirmModal from '@/components/ConfirmModal'

const departmentSchema = z.object({
  department: z.string().min(3, 'Nome do departamento deve ter no mínimo 3 caracteres'),
  phone: z.string().min(10, 'Telefone inválido'),
  address: z.string().min(5, 'Endereço deve ter no mínimo 5 caracteres'),
  website: z.string().url('URL inválida').optional().or(z.literal('')),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  hours: z.string().optional().or(z.literal('')),
  details: z.string().optional().or(z.literal('')),
  active: z.boolean().default(true)
})

type DepartmentFormData = z.infer<typeof departmentSchema>

export default function DepartmentFormPage() {
  const router = useRouter()
  const params = useParams()
  const deptId = params.id as string
  const isEdit = deptId && deptId !== 'new'

  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<DepartmentFormData>({
    resolver: zodResolver(departmentSchema),
    defaultValues: {
      active: true
    }
  })

  useEffect(() => {
    if (isEdit) {
      setLoadingData(true)
      fetch(`/api/city-departments/${deptId}`, {
        credentials: 'include',
      })
        .then(async (res) => {
          if (!res.ok) {
            const errorData = await res.json()
            toast.error(errorData.error || 'Erro ao carregar dados')
            throw new Error(errorData.error)
          }
          const data = await res.json()
          Object.keys(data).forEach((key) => setValue(key as any, data[key]))
        })
        .catch((err) => {
          console.error('Erro ao buscar departamento:', err)
        })
        .finally(() => setLoadingData(false))
    }
  }, [isEdit, deptId, setValue])

  const onSubmit = async (formData: DepartmentFormData) => {
    setLoading(true)
    try {
      const url = isEdit ? `/api/city-departments/${deptId}` : '/api/city-departments'
      const method = isEdit ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        credentials: 'include',
      })
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Erro ao salvar departamento')
      }
      toast.success(isEdit ? 'Departamento atualizado com sucesso!' : 'Departamento cadastrado com sucesso!')
      router.push('/dash/city-departments')
      router.refresh()
    } catch (error) {
      toast.error((error as any)?.message || 'Erro ao salvar departamento')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!isEdit) return

    try {
      const res = await fetch(`/api/city-departments/${deptId}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Erro ao excluir departamento')
      }
      toast.success('Departamento excluído com sucesso!')
      router.push('/dash/city-departments')
    } catch (error) {
      toast.error((error as any)?.message || 'Erro ao excluir departamento')
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
        href="/dash/city-departments"
        className="inline-flex items-center gap-2 text-gray-700 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar
      </Link>

      {/* Título e informação de campos obrigatórios */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {isEdit ? 'Editar Departamento' : 'Cadastrar Departamento'}
        </h1>
        <p className="text-sm text-gray-600">* Campos obrigatórios</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          <div className="p-3 bg-blue-50 border border-blue-200 rounded text-blue-900 text-sm">
            Os departamentos cadastrados aqui aparecerão no rodapé do site.
          </div>

          {/* Departamento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome do Departamento *
            </label>
            <input
              type="text"
              {...register('department')}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.department ? 'border-red-500' : 'border-gray-300'
                }`}
            />
            {errors.department && (
              <p className="text-red-600 text-sm mt-1">{errors.department.message}</p>
            )}
          </div>

          {/* Telefone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Telefone *
            </label>
            <input
              type="text"
              {...register('phone')}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.phone ? 'border-red-500' : 'border-gray-300'
                }`}
            />
            {errors.phone && (
              <p className="text-red-600 text-sm mt-1">{errors.phone.message}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">E-mail</label>
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

          {/* Endereço */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Endereço *
            </label>
            <input
              type="text"
              {...register('address')}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.address ? 'border-red-500' : 'border-gray-300'
                }`}
            />
            {errors.address && (
              <p className="text-red-600 text-sm mt-1">{errors.address.message}</p>
            )}
          </div>

          {/* Website */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
            <input
              type="text"
              {...register('website')}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.website ? 'border-red-500' : 'border-gray-300'
                }`}
            />
            {errors.website && (
              <p className="text-red-600 text-sm mt-1">{errors.website.message}</p>
            )}
          </div>

          {/* Horário */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Horário de Atendimento
            </label>
            <input
              type="text"
              {...register('hours')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Detalhes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Detalhes</label>
            <textarea
              rows={3}
              {...register('details')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
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
              Exibir no rodapé do site
            </label>
          </div>
        </div>

        {/* Botões */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
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

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => router.push('/dash/city-departments')}
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
        title="Excluir Departamento"
        message="Tem certeza que deseja excluir este departamento? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        confirmButtonClass="bg-red-600 hover:bg-red-700"
      />
    </div>
  )
}
