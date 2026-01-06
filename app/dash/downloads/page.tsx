'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Plus, FileText, Download as DownloadIcon, Trash2, Edit, CheckCircle, XCircle, Search } from 'lucide-react'
import { toast } from 'sonner'
import ConfirmModal from '@/components/ConfirmModal'
import TablePagination from '@/components/TablePagination'
import LoadingSpinner from '@/components/LoadingSpinner'

type DownloadCategory = 'DOWNLOAD' | 'OBSERVATORY'

type Download = {
  id: string
  name: string
  category: DownloadCategory
  link: string
  active: boolean
  created_at: string
}

export default function DownloadsPage() {
  const router = useRouter()
  const [downloads, setDownloads] = useState<Download[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [categoryFilter, setCategoryFilter] = useState('ALL')
  const [currentPage, setCurrentPage] = useState(1)

  const itemsPerPage = 10

  useEffect(() => {
    fetchDownloads()
  }, [])

  async function fetchDownloads() {
    try {
      const response = await fetch('/api/downloads')
      if (!response.ok) throw new Error('Erro ao buscar downloads')
      const data = await response.json()
      setDownloads(data)
    } catch (error) {
      console.error(error)
      toast.error('Erro ao carregar downloads')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    try {
      const response = await fetch(`/api/downloads/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (!response.ok) throw new Error('Erro ao deletar')

      toast.success('Download deletado com sucesso!')
      fetchDownloads()
    } catch (error) {
      console.error(error)
      toast.error('Erro ao deletar download')
    }
  }

  function getCategoryLabel(category: DownloadCategory) {
    switch (category) {
      case 'DOWNLOAD':
        return 'Download'
      case 'OBSERVATORY':
        return 'Observatório'
      default:
        return category
    }
  }

  function getCategoryColor(category: DownloadCategory) {
    switch (category) {
      case 'DOWNLOAD':
        return 'bg-blue-100 text-blue-800'
      case 'OBSERVATORY':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const totalDownloads = downloads.length
  const activeDownloads = downloads.filter((d) => d.active).length
  const inactiveDownloads = downloads.filter((d) => !d.active).length

  // Filtrar downloads
  const filteredDownloads = downloads.filter(download => {
    const matchesSearch = download.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'ALL' ||
      (statusFilter === 'ACTIVE' && download.active) ||
      (statusFilter === 'INACTIVE' && !download.active)
    const matchesCategory = categoryFilter === 'ALL' || download.category === categoryFilter
    return matchesSearch && matchesStatus && matchesCategory
  })

  const totalItems = filteredDownloads.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const paginatedDownloads = filteredDownloads.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  if (loading) {
    return <LoadingSpinner message="Carregando downloads..." />
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 md:mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Downloads</h1>
        </div>
        <Link
          href="/dash/downloads/new"
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <Plus className="w-5 h-5" />
          Novo Download
        </Link>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 md:mb-8">
        <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold text-blue-700">{totalDownloads}</p>
            </div>
            <FileText className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-4 border-2 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Ativos</p>
              <p className="text-2xl font-bold text-green-700">{activeDownloads}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-red-50 rounded-lg p-4 border-2 border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Inativos</p>
              <p className="text-2xl font-bold text-red-700">{inactiveDownloads}</p>
            </div>
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow mb-6 p-4 md:p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nome..."
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
            <option value="DOWNLOAD">Download</option>
            <option value="OBSERVATORY">Observatório</option>
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
            <option value="ACTIVE">Ativos</option>
            <option value="INACTIVE">Inativos</option>
          </select>
        </div>
      </div>

      {/* Lista de Downloads */}
      {filteredDownloads.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <FileText className="w-16 h-16 text-gray-400 mb-4" />
          <p className="text-gray-600 text-lg font-medium">Nenhum download encontrado</p>
          <p className="text-gray-500 text-sm mt-1">
            {searchTerm || statusFilter !== 'ALL' || categoryFilter !== 'ALL' ? 'Tente ajustar os filtros' : 'Clique em "Novo Download" para adicionar'}
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
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedDownloads.map((download) => (
                  <tr key={download.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <DownloadIcon className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {download.name}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(
                          download.category
                        )}`}
                      >
                        {getCategoryLabel(download.category)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${download.active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                          }`}
                      >
                        {download.active ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={download.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded transition inline-flex items-center justify-center"
                          title="Baixar PDF"
                        >
                          <DownloadIcon className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => router.push(`/dash/downloads/${download.id}`)}
                          className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded transition"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedId(download.id)
                            setDeleteModalOpen(true)
                          }}
                          className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded transition"
                          title="Deletar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={() => {
          if (selectedId) {
            handleDelete(selectedId)
            setDeleteModalOpen(false)
            setSelectedId(null)
          }
        }}
        title="Deletar Download"
        message="Tem certeza que deseja deletar este download? Esta ação não pode ser desfeita."
      />
    </div>
  )
}
