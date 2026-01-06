'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, XCircle, Clock, Calendar, Users, MapPin, Edit, Search } from 'lucide-react'
import TablePagination from '@/components/TablePagination'

export default function ToursPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [tours, setTours] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    if (session) {
      fetchTours()
    }
  }, [session])

  const fetchTours = async () => {
    try {
      const res = await fetch('/api/tours')
      if (res.ok) {
        const data = await res.json()
        setTours(Array.isArray(data) ? data : [])
      } else {
        setTours([])
      }
    } catch (error) {
      console.error('Erro ao carregar passeios:', error)
      setTours([])
    } finally {
      setLoading(false)
    }
  }

  const filteredTours = Array.isArray(tours) ? tours.filter((tour) => {
    const matchesSearch = tour.guide?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tour.address.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'ALL' || tour.status === statusFilter
    return matchesSearch && matchesStatus
  }) : []

  // Paginação
  const totalItems = filteredTours.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedTours = filteredTours.slice(startIndex, endIndex)

  const pendingCount = tours.filter((t) => t.status === 'PENDING').length
  const approvedCount = tours.filter((t) => t.status === 'APPROVED').length
  const rejectedCount = tours.filter((t) => t.status === 'REJECTED').length

  const visitorProfileLabels: Record<string, string> = {
    FAMILY_OR_FRIENDS: 'Família ou amigos',
    SCHOOL: 'Escola',
    TOUR_GROUP: 'Grupo de turismo',
    TECHNICAL_VISIT: 'Visita técnica',
    SOCIAL_PROJECT: 'Projeto social',
    OTHER: 'Outro',
  }

  const ageRangeLabels: Record<string, string> = {
    ZERO_TO_NINE: '0-9 anos',
    TEN_TO_EIGHTEEN: '10-18 anos',
    NINETEEN_TO_TWENTY_NINE: '19-29 anos',
    THIRTY_TO_FORTY_FIVE: '30-45 anos',
    FORTY_SIX_TO_SIXTY_FIVE: '46-65 anos',
    OVER_SIXTY_FIVE: '65+ anos',
  }

  if (loading) {
    return <div className="text-center py-12">Carregando...</div>
  }

  const userRole = session?.user?.role

  const statusConfig = {
    PENDING: {
      label: 'Pendente',
      icon: Clock,
      color: 'orange',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-700',
      iconColor: 'text-orange-600',
      count: pendingCount,
    },
    APPROVED: {
      label: 'Aprovado',
      icon: CheckCircle,
      color: 'green',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700',
      iconColor: 'text-green-600',
      count: approvedCount,
    },
    REJECTED: {
      label: 'Rejeitado',
      icon: XCircle,
      color: 'red',
      bgColor: 'bg-red-50',
      textColor: 'text-red-700',
      iconColor: 'text-red-600',
      count: rejectedCount,
    },
    TOTAL: {
      label: 'Total',
      icon: Calendar,
      color: 'blue',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
      iconColor: 'text-blue-600',
      count: tours.length,
    },
  }

  return (
    <div>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Passeios</h1>
          {userRole === 'GUIDE' && (
            <Link
              href="/dash/tours/new"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Novo Passeio
            </Link>
          )}
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Filtro por Busca */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Guia ou Local..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
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

        {/* Lista de Passeios */}
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
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data/Hora
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Guia
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Local
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Perfil
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Faixa Etária
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedTours.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                      {tours.length === 0 ? 'Nenhum passeio cadastrado' : 'Nenhum passeio encontrado com os filtros aplicados'}
                    </td>
                  </tr>
                ) : (
                  paginatedTours.map((tour) => (
                    <tr key={tour.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {new Date(tour.date_time).toLocaleString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div>
                          <p className="font-medium">{tour.guide.name}</p>
                          {tour.auxiliary_guide && (
                            <p className="text-xs text-gray-500">
                              Aux: {tour.auxiliary_guide.name}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span className="line-clamp-2">{tour.address}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {visitorProfileLabels[tour.visitor_profile]}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {ageRangeLabels[tour.age_range]}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {(() => {
                          const config = statusConfig[tour.status as keyof typeof statusConfig]
                          if (!config) return null
                          const Icon = config.icon
                          return (
                            <span
                              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${config.bgColor} ${config.textColor}`}
                            >
                              <Icon className="w-3 h-3" />
                              {config.label}
                            </span>
                          )
                        })()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/dash/tours/${tour.id}`}
                            className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded transition"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )

}
