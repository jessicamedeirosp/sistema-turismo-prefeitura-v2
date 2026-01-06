'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Clock, CheckCircle, XCircle, Building2, User, Edit, Search, Eye } from 'lucide-react'
import TablePagination from '@/components/TablePagination'

export default function AgenciesPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [agencies, setAgencies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [typeFilter, setTypeFilter] = useState<string>('ALL')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    if (session) {
      fetchAgencies()
    }
  }, [session])

  const fetchAgencies = async () => {
    try {
      const res = await fetch('/api/agency')
      if (res.ok) {
        const data = await res.json()
        // A API retorna { agencies: [...] } ao invés do array direto
        const agenciesData = data.agencies || data
        setAgencies(Array.isArray(agenciesData) ? agenciesData : [])
      } else {
        setAgencies([])
      }
    } catch (error) {
      console.error('Erro ao carregar agências:', error)
      setAgencies([])
    } finally {
      setLoading(false)
    }
  }

  const filteredAgencies = Array.isArray(agencies) ? agencies.filter((agency) => {
    const matchesSearch = agency.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agency.credential.includes(searchTerm) ||
      agency.user?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'ALL' || agency.status === statusFilter
    const matchesType = typeFilter === 'ALL' || agency.type === typeFilter
    return matchesSearch && matchesStatus && matchesType
  }) : []

  // Paginação
  const totalItems = filteredAgencies.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedAgencies = filteredAgencies.slice(startIndex, endIndex)

  const statusConfig = {
    PENDING: {
      label: 'Pendente',
      icon: Clock,
      color: 'orange',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-700',
      iconColor: 'text-orange-600',
      count: agencies.filter((a) => a.status === 'PENDING').length,
    },
    APPROVED: {
      label: 'Aprovado',
      icon: CheckCircle,
      color: 'green',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700',
      iconColor: 'text-green-600',
      count: agencies.filter((a) => a.status === 'APPROVED').length,
    },
    REJECTED: {
      label: 'Rejeitado',
      icon: XCircle,
      color: 'red',
      bgColor: 'bg-red-50',
      textColor: 'text-red-700',
      iconColor: 'text-red-600',
      count: agencies.filter((a) => a.status === 'REJECTED').length,
    },
  }

  if (loading) {
    return <div className="text-center py-12">Carregando...</div>
  }

  return (
    <div>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Agências e Guias</h1>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {Object.entries(statusConfig).map(([key, config]) => {
            const Icon = config.icon
            return (
              <div
                key={key}
                className={`${config.bgColor} rounded-lg p-4 border-2 border-${config.color}-200`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{config.label}</p>
                    <p className={`text-2xl font-bold ${config.textColor}`}>
                      {config.count}
                    </p>
                  </div>
                  <Icon className={`w-8 h-8 ${config.iconColor}`} />
                </div>
              </div>
            )
          })}
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Filtro por Nome/Credencial/Responsável */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Nome, Credencial ou Responsável..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Filtro por Tipo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo
              </label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="ALL">Todos</option>
                <option value="AGENCY">Agência</option>
                <option value="GUIDE">Guia</option>
              </select>
            </div>

            {/* Filtro por Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="ALL">Todos</option>
                <option value="PENDING">Pendente</option>
                <option value="APPROVED">Aprovado</option>
                <option value="REJECTED">Rejeitado</option>
              </select>
            </div>
          </div>
        </div>

        {/* Lista de Agências */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <TablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nome
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Responsável
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedAgencies.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      {agencies.length === 0 ? 'Nenhuma agência ou guia cadastrado' : 'Nenhuma agência encontrada com os filtros aplicados'}
                    </td>
                  </tr>
                ) : (
                  paginatedAgencies.map((agency) => {
                    const config = statusConfig[agency.status as keyof typeof statusConfig]
                    const Icon = config.icon
                    const TypeIcon = agency.type === 'AGENCY' ? Building2 : User
                    return (
                      <tr key={agency.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">
                            {agency.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {agency.credential}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 text-sm text-gray-900">
                            <TypeIcon className="w-4 h-4" />
                            {agency.type === 'AGENCY' ? 'Agência' : 'Guia'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {agency.user.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {agency.user.email}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${config.bgColor} ${config.textColor}`}
                          >
                            <Icon className="w-3 h-3" />
                            {config.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(agency.created_at).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/dash/agencies/${agency.id}`}
                              className="text-gray-600 hover:text-gray-900 p-2 hover:bg-gray-50 rounded transition"
                              title="Visualizar"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>
                            <Link
                              href={`/dash/agency/${agency.id}`}
                              className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded transition"
                              title="Editar"
                            >
                              <Edit className="w-4 h-4" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
