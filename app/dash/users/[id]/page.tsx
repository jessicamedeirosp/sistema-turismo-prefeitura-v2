'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { toast } from 'sonner'
import { ArrowLeft, Save, Trash2, Key, Info } from 'lucide-react'
import Link from 'next/link'
import ConfirmModal from '@/components/ConfirmModal'
import LoadingSpinner from '@/components/LoadingSpinner'

type UserRole = 'ADMIN' | 'MODERATOR' | 'BUSINESS_FOOD' | 'BUSINESS_ACCOMMODATION' | 'GUIDE'

export default function UserFormPage() {
  const router = useRouter()
  const params = useParams()
  const isEdit = params?.id !== 'new'

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<UserRole>('ADMIN')
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(isEdit)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)

  useEffect(() => {
    if (isEdit) {
      fetchUser()
    }
  }, [params?.id])

  async function fetchUser() {
    try {
      const response = await fetch(`/api/users/${params?.id}`)
      if (!response.ok) throw new Error('Erro ao buscar usuário')
      const data = await response.json()

      setName(data.name)
      setEmail(data.email)
      setRole(data.role)
    } catch (error) {
      console.error(error)
      toast.error('Erro ao carregar usuário')
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!name || !email) {
      toast.error('Nome e email são obrigatórios')
      return
    }

    // Validação básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      toast.error('Email inválido')
      return
    }

    setSaving(true)

    try {
      const url = isEdit ? `/api/users/${params?.id}` : '/api/users'
      const method = isEdit ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name, email, role }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao salvar')
      }

      if (isEdit) {
        toast.success('Usuário atualizado!')
      } else {
        toast.success('Usuário criado! Senha padrão: Admin@123')
      }

      router.push('/dash/users')
    } catch (error: any) {
      console.error(error)
      toast.error(error.message || 'Erro ao salvar usuário')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    try {
      const response = await fetch(`/api/users/${params?.id}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao deletar')
      }

      toast.success('Usuário deletado com sucesso!')
      router.push('/dash/users')
    } catch (error: any) {
      console.error(error)
      toast.error(error.message || 'Erro ao deletar usuário')
    }
  }

  if (loading) {
    return <LoadingSpinner message="Carregando usuário..." />
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Botão Voltar */}
      <Link
        href="/dash/users"
        className="inline-flex items-center gap-2 text-gray-700 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar
      </Link>

      {/* Título */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {isEdit ? 'Editar Usuário' : 'Novo Usuário'}
        </h1>
        <p className="text-sm text-gray-600">* Campos obrigatórios</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          {/* Nome */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Nome Completo *
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ex: João Silva"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email *
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ex: joao@email.com"
              required
            />
          </div>

          {/* Tipo de Usuário (Role) */}
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Usuário *
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              disabled={isEdit}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              required
            >
              <option value="ADMIN">Administrador</option>
              <option value="MODERATOR">Moderador</option>
              <option value="BUSINESS_FOOD">Estabelecimento - Alimentação</option>
              <option value="BUSINESS_ACCOMMODATION">Estabelecimento - Hospedagem</option>
              <option value="GUIDE">Agência/Guia</option>
            </select>

            {/* Descrições dos tipos de usuário */}
            <div className="mt-3 bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-start gap-2 mb-2">
                <Info className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs font-medium text-gray-700">Descrição dos tipos de usuário:</p>
              </div>
              <div className="space-y-2 ml-6">
                <div className="text-xs">
                  <span className="font-semibold text-purple-700">Administrador:</span>
                  <span className="text-gray-600"> Acesso total ao sistema, incluindo criação e gerenciamento de usuários.</span>
                </div>
                <div className="text-xs">
                  <span className="font-semibold text-blue-700">Moderador:</span>
                  <span className="text-gray-600"> Acesso completo para gerenciar conteúdos (praias, estabelecimentos, agências, tags, tours), mas sem permissão para criar ou gerenciar usuários.</span>
                </div>
                <div className="text-xs">
                  <span className="font-semibold text-orange-700">Estabelecimento - Alimentação:</span>
                  <span className="text-gray-600"> Pode cadastrar e gerenciar apenas o próprio estabelecimento de alimentação (restaurantes, bares, etc).</span>
                </div>
                <div className="text-xs">
                  <span className="font-semibold text-cyan-700">Estabelecimento - Hospedagem:</span>
                  <span className="text-gray-600"> Pode cadastrar e gerenciar apenas o próprio estabelecimento de hospedagem (hotéis, pousadas, etc).</span>
                </div>
                <div className="text-xs">
                  <span className="font-semibold text-green-700">Agência/Guia:</span>
                  <span className="text-gray-600"> Pode cadastrar e gerenciar a própria agência/guia e seus tours turísticos.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Info sobre senha padrão */}
          {!isEdit && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Key className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-900">Senha Padrão</p>
                  <p className="text-sm text-blue-700 mt-1">
                    O usuário será criado com a senha padrão <strong>Admin@123</strong>
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    No primeiro acesso, o usuário será solicitado a redefinir a senha.
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>
      </form>

      {/* Botões de ação */}
      <div className="bg-white rounded-lg shadow p-6 mt-6">
        <div className="flex items-center justify-between">
          {isEdit && (
            <button
              type="button"
              onClick={() => setDeleteModalOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-3 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 font-medium"
            >
              <Trash2 className="h-4 w-4" />
              Excluir
            </button>
          )}

          <div className={`flex items-center gap-3 ${!isEdit ? 'ml-auto' : ''}`}>
            <button
              type="button"
              onClick={() => router.push('/dash/users')}
              className="px-6 py-3 border border-gray-900 text-gray-900 rounded-lg hover:bg-gray-50 font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              onClick={handleSubmit}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
            >
              {saving ? (
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

      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Deletar Usuário"
        message="Tem certeza que deseja deletar este usuário? Esta ação não pode ser desfeita."
      />
    </div>
  )
}
