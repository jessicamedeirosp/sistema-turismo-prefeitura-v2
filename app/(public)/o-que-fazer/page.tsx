'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'

import FilterBar from '@/components/FilterBar'
import Pagination from '@/components/Pagination'
import DetailBanner from '../../../components/DetailBanner'
import Image from 'next/image'
import { SectionSkeleton } from '../../../components/SectionSkeleton'

interface TourTemplate {
  id: string
  name: string
  description?: string
  images: string[]
  requires_guide?: boolean
}

interface District {
  id: string
  name: string
}

interface Tag {
  id: string
  name: string
}

interface TourPageData {
  page: string
  title: string
  images: string[]
  details?: string
}

export default function OQueFazerPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedBairros, setSelectedBairros] = useState<string[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [showBairroDropdown, setShowBairroDropdown] = useState(false)
  const [showTagsDropdown, setShowTagsDropdown] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [sortOption, setSortOption] = useState('relevance')
  const itemsPerPage = 12

  // React Query hooks
  const {
    data: tourPageData,
    isLoading: isLoadingPage,
    isError: isErrorPage
  } = useQuery({
    queryKey: ['tourPageData'],
    queryFn: async () => {
      const res = await fetch('/api/public/common-pages?page=TOUR')
      if (!res.ok) throw new Error('Erro ao buscar dados da página')
      return res.json()
    }
  })

  const {
    data: tours = [],
    isLoading: isLoadingTours,
    isError: isErrorTours
  } = useQuery({
    queryKey: ['tours'],
    queryFn: async () => {
      const res = await fetch('/api/public/tour-templates')
      if (!res.ok) throw new Error('Erro ao buscar passeios')
      return res.json()
    }
  })

  const {
    data: districts = [],
    isLoading: isLoadingDistricts,
    isError: isErrorDistricts
  } = useQuery({
    queryKey: ['districts'],
    queryFn: async () => {
      const res = await fetch('/api/districts')
      if (!res.ok) throw new Error('Erro ao buscar distritos')
      const data = await res.json()
      return data.filter((d: any) => d.active)
    }
  })




  // Filtrar passeios
  interface FilteredTour extends TourTemplate { }

  let filteredTours: FilteredTour[] = tours.filter((tour: TourTemplate) => {
    const matchesSearch: boolean = tour.name.toLowerCase().includes(searchTerm.toLowerCase())
    // TourTemplate não tem district/tags, então só filtra por nome
    return matchesSearch
  })

  // Ordenar passeios
  if (sortOption === 'name-asc') {
    filteredTours = [...filteredTours].sort((a, b) => a.name.localeCompare(b.name))
  } else if (sortOption === 'name-desc') {
    filteredTours = [...filteredTours].sort((a, b) => b.name.localeCompare(a.name))
  }

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  const toggleBairro = (bairro: string) => {
    setSelectedBairros(prev =>
      prev.includes(bairro)
        ? prev.filter(b => b !== bairro)
        : [...prev, bairro]
    )
  }

  // Calcular paginação
  const totalPages = Math.ceil(filteredTours.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentTours = filteredTours.slice(startIndex, endIndex)

  const goToPage = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Skeleton loading for progressive UX
  if (isLoadingPage || isLoadingTours || isLoadingDistricts) {
    return <SectionSkeleton />
  }

  // Error states
  if (isErrorPage || isErrorTours || isErrorDistricts) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="mt-4 text-red-600">Erro ao carregar dados. Tente novamente mais tarde.</p>
        </div>
      </div>
    )
  }

  const handleClearFilters = () => {
    setSelectedBairros([])
    setSelectedTags([])
    setSearchTerm('')
    setCurrentPage(1)
  }

  const handleToggleDistrictDropdown = () => {
    setShowBairroDropdown(!showBairroDropdown)
    setShowTagsDropdown(false)
  }

  const handleToggleTagsDropdown = () => {
    setShowTagsDropdown(!showTagsDropdown)
    setShowBairroDropdown(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {tourPageData && (
        <DetailBanner title={tourPageData.title} images={tourPageData.images} details={tourPageData.details} />
      )}

      <FilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        districts={districts}
        tags={[]}
        selectedDistricts={selectedBairros}
        selectedTags={selectedTags}
        onToggleDistrict={toggleBairro}
        onToggleTag={toggleTag}
        onClearFilters={handleClearFilters}
        showDistrictDropdown={showBairroDropdown}
        showTagsDropdown={showTagsDropdown}
        onToggleDistrictDropdown={handleToggleDistrictDropdown}
        onToggleTagsDropdown={handleToggleTagsDropdown}
      />

      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="mb-6 flex items-center justify-between">
            <p className="text-gray-600">
              Mostrando <span className="font-semibold text-gray-900">{currentTours.length}</span> de{' '}
              <span className="font-semibold text-gray-900">{filteredTours.length}</span> passeios
            </p>
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              value={sortOption}
              onChange={e => setSortOption(e.target.value)}
            >
              <option value="relevance">Mais Relevantes</option>
              <option value="name-asc">Nome A-Z</option>
              <option value="name-desc">Nome Z-A</option>
            </select>
          </div>


          {currentTours.length === 0 ? (
            <div className="text-center text-gray-500 py-12">
              Nenhum passeio encontrado com os filtros selecionados.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
              {currentTours.map(tour => (
                <a
                  key={tour.id}
                  href={`/o-que-fazer/${tour.id}`}
                  className="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden flex flex-col group focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <div className="relative h-48 w-full">
                    {tour.images && tour.images.length > 0 ? (
                      <Image src={tour.images[0]} alt={tour.name} fill className="object-cover group-hover:scale-105 transition-transform duration-200" />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-500 flex items-center justify-center text-white font-bold text-lg">
                        Sem imagem
                      </div>
                    )}
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <h2 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-700 transition">{tour.name}</h2>
                    {tour.description && (
                      <p className="text-gray-700 text-sm mb-3 line-clamp-3">{tour.description}</p>
                    )}
                    {tour.requires_guide && (
                      <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-2 rounded mb-2 text-xs">
                        Este passeio requer guia credenciado.
                      </div>
                    )}
                  </div>
                </a>
              ))}
            </div>
          )}

          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={goToPage} />
        </div>
      </section>
    </div>
  )
}
