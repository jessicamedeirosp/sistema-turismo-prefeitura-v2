'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import * as Icons from 'lucide-react'
import { Tag as TagIcon, Plus, Utensils, Hotel, MapPin, Edit, Search } from 'lucide-react'
import TablePagination from '@/components/TablePagination'
import LoadingSpinner from '@/components/LoadingSpinner'

type Tag = {
  id: string
  name: string
  icon: string | null
  category: string
  _count: {
    businesses: number
  }
}

type BeachTag = {
  id: string
  name: string
  icon: string | null
  _count: {
    beaches: number
  }
}

export default function TagsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [tags, setTags] = useState<Tag[]>([])
  const [beachTags, setBeachTags] = useState<BeachTag[]>([])
  const [loading, setLoading] = useState(true)

  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('ALL')
  const [currentPage, setCurrentPage] = useState(1)

  const itemsPerPage = 10

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth')
    } else if (status === 'authenticated') {
      fetchTags()
    }
  }, [status])

  const fetchTags = async () => {
    try {
      const [tagsRes, beachTagsRes] = await Promise.all([
        fetch('/api/tags?dashboard=true'),
        fetch('/api/beaches/tags?dashboard=true')
      ])

      const tagsData = await tagsRes.json()
      const beachTagsData = await beachTagsRes.json()

      setTags(Array.isArray(tagsData) ? tagsData : [])
      setBeachTags(Array.isArray(beachTagsData) ? beachTagsData : [])
    } catch (error) {
      console.error('Erro ao buscar tags:', error)
      setTags([])
      setBeachTags([])
    } finally {
      setLoading(false)
    }
  }

  const foodTags = tags.filter((tag) => tag.category === 'FOOD')
  const accommodationTags = tags.filter((tag) => tag.category === 'ACCOMMODATION')

  // Combinar todas as tags em um único array com tipo unificado
  const allTags = [
    ...tags.map(tag => ({ ...tag, type: 'business' as const, usage: tag._count.businesses })),
    ...beachTags.map(tag => ({ ...tag, type: 'beach' as const, usage: tag._count.beaches, category: 'BEACH' }))
  ]

  // Filtrar por busca e categoria
  const filteredTags = allTags.filter(tag => {
    const matchesSearch = tag.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === 'ALL' || tag.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const totalItems = filteredTags.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const paginatedTags = filteredTags.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  if (loading) {
    return <LoadingSpinner message="Carregando tags..." />
  }

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Gerenciar Tags</h1>
          </div>
          <Link
            href="/dash/tags/new"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <Plus className="w-5 h-5" />
            Nova Tag
          </Link>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 md:mb-8">
        <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total de Tags</p>
              <p className="text-2xl font-bold text-blue-700">{tags.length + beachTags.length}</p>
            </div>
            <TagIcon className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-orange-50 rounded-lg p-4 border-2 border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Alimentação</p>
              <p className="text-2xl font-bold text-orange-700">{foodTags.length}</p>
            </div>
            <Utensils className="w-8 h-8 text-orange-600" />
          </div>
        </div>
        <div className="bg-purple-50 rounded-lg p-4 border-2 border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Acomodação</p>
              <p className="text-2xl font-bold text-purple-700">{accommodationTags.length}</p>
            </div>
            <Hotel className="w-8 h-8 text-purple-600" />
          </div>
        </div>
        <div className="bg-cyan-50 rounded-lg p-4 border-2 border-cyan-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Praias</p>
              <p className="text-2xl font-bold text-cyan-700">{beachTags.length}</p>
            </div>
            <MapPin className="w-8 h-8 text-cyan-600" />
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
            <option value="FOOD">Alimentação</option>
            <option value="ACCOMMODATION">Acomodação</option>
            <option value="BEACH">Praias</option>
          </select>
        </div>
      </div>

      {/* Tabela */}
      {filteredTags.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <TagIcon className="w-16 h-16 text-gray-400 mb-4" />
          <p className="text-gray-600 text-lg font-medium">Nenhuma tag encontrada</p>
          <p className="text-gray-500 text-sm mt-1">
            {searchTerm || categoryFilter !== 'ALL' ? 'Tente ajustar os filtros' : 'Clique em "Nova Tag" para adicionar'}
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
                    Ícone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Uso
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedTags.map((tag) => {
                  const IconComponent = tag.icon ? (Icons as any)[tag.icon] : null
                  const categoryLabel = tag.category === 'FOOD' ? 'Alimentação' :
                    tag.category === 'ACCOMMODATION' ? 'Acomodação' : 'Praias'
                  const categoryColor = tag.category === 'FOOD' ? 'bg-orange-100 text-orange-800' :
                    tag.category === 'ACCOMMODATION' ? 'bg-purple-100 text-purple-800' : 'bg-cyan-100 text-cyan-800'
                  return (
                    <tr key={tag.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{tag.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${categoryColor}`}>
                          {categoryLabel}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {IconComponent ? (
                          <IconComponent className="w-5 h-5 text-gray-700" />
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">
                          {tag.usage} {tag.type === 'beach' ? (tag.usage === 1 ? 'praia' : 'praias') : (tag.usage === 1 ? 'empresa' : 'empresas')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link
                          href={tag.type === 'beach' ? `/dash/tags/beach/${tag.id}` : `/dash/tags/${tag.id}`}
                          className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded transition inline-flex items-center justify-center"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
