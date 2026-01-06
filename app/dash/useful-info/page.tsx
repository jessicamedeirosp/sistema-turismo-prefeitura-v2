'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Info, Plus, Edit, Search, CheckCircle, XCircle, AlertCircle, HelpCircle, Briefcase } from 'lucide-react'
import TablePagination from '@/components/TablePagination'

export default function UsefulInfoListPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [usefulInfo, setUsefulInfo] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    if (session) {
      fetchUsefulInfo()
    }
  }, [session])

  const fetchUsefulInfo = async () => {
    try {
      const res = await fetch('/api/useful-info?dashboard=true')
      if (res.ok) {
        const data = await res.json()
        setUsefulInfo(Array.isArray(data) ? data : [])
      } else {
        setUsefulInfo([])
      }
    } catch (error) {
      console.error('Erro ao carregar informações úteis:', error)
      setUsefulInfo([])
    } finally {
      setLoading(false)
    }
  }

  const filteredInfo = Array.isArray(usefulInfo) ? usefulInfo.filter((info) => {
    const matchesSearch = info.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      info.phone?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'ALL' ||
      (statusFilter === 'ACTIVE' && info.active) ||
      (statusFilter === 'INACTIVE' && !info.active)
    const matchesCategory = categoryFilter === 'ALL' || info.category === categoryFilter
    return matchesSearch && matchesStatus && matchesCategory
  }) : []

  // Paginação
  const totalItems = filteredInfo.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedInfo = filteredInfo.slice(startIndex, endIndex)

  const activeCount = usefulInfo.filter((i) => i.active).length
  const inactiveCount = usefulInfo.filter((i) => !i.active).length
  const emergencyCount = usefulInfo.filter((i) => i.category === 'EMERGENCY').length
  const usefulCount = usefulInfo.filter((i) => i.category === 'USEFUL').length
  const servicesCount = usefulInfo.filter((i) => i.category === 'SERVICES').length

  const getCategoryLabel = (category: string) => {
    const labels = {
      EMERGENCY: 'Emergências',
      USEFUL: 'Informações Úteis',
      SERVICES: 'Serviços Públicos',
    }
    return labels[category as keyof typeof labels] || category
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      EMERGENCY: 'bg-red-100 text-red-800',
      USEFUL: 'bg-blue-100 text-blue-800',
      SERVICES: 'bg-green-100 text-green-800',
    }
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Informações Úteis</h1>
        </div>

        <Link
          href="/dash/useful-info/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nova Informação
        </Link>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Total</p>
              <p className="text-2xl font-bold text-blue-700">{usefulInfo.length}</p>
            </div>
            <Info className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Ativas</p>
              <p className="text-2xl font-bold text-green-700">{activeCount}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Inativas</p>
              <p className="text-2xl font-bold text-gray-700">{inactiveCount}</p>
            </div>
            <XCircle className="w-8 h-8 text-gray-600" />
          </div>
        </div>

        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600 font-medium">Emergências</p>
              <p className="text-2xl font-bold text-red-700">{emergencyCount}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
        </div>

        <div className="bg-sky-50 p-4 rounded-lg border border-sky-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-sky-600 font-medium">Úteis</p>
              <p className="text-2xl font-bold text-sky-700">{usefulCount}</p>
            </div>
            <HelpCircle className="w-8 h-8 text-sky-600" />
          </div>
        </div>

        <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-emerald-600 font-medium">Serviços</p>
              <p className="text-2xl font-bold text-emerald-700">{servicesCount}</p>
            </div>
            <Briefcase className="w-8 h-8 text-emerald-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por nome ou telefone..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value)
              setCurrentPage(1)
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="ALL">Todas as categorias</option>
            <option value="EMERGENCY">Emergências</option>
            <option value="USEFUL">Informações Úteis</option>
            <option value="SERVICES">Serviços Públicos</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value)
              setCurrentPage(1)
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="ALL">Todos os status</option>
            <option value="ACTIVE">Ativas</option>
            <option value="INACTIVE">Inativas</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {filteredInfo.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <Info className="w-16 h-16 text-gray-400 mb-4" />
          <p className="text-gray-600 text-lg font-medium">Nenhuma informação encontrada</p>
          <p className="text-gray-500 text-sm mt-1">
            {searchTerm || statusFilter !== 'ALL' || categoryFilter !== 'ALL' ? 'Tente ajustar os filtros' : 'Clique em "Nova Informação" para adicionar'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <TablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nome
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoria
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Telefone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Endereço
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedInfo.map((info) => (
                  <tr key={info.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{info.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded ${getCategoryColor(
                          info.category
                        )}`}
                      >
                        {getCategoryLabel(info.category)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">{info.phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">{info.address}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${info.active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                          }`}
                      >
                        {info.active ? 'Ativa' : 'Inativa'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        href={`/dash/useful-info/${info.id}`}
                        className="inline-flex items-center justify-center p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}