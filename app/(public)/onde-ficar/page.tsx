'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import FilterBar from '@/components/FilterBar'
import ListingGrid from '@/components/ListingGrid'
import Pagination from '@/components/Pagination'
import DetailBanner from '../../../components/DetailBanner'
import { SectionSkeleton } from '../../../components/SectionSkeleton'

interface Business {
  id: string
  name: string
  address_district: string
  images: string[]
  details?: string
  tags?: Array<{ id: string; name: string; icon?: string }>
}

interface District {
  id: string
  name: string
}

interface Tag {
  id: string
  name: string
}

interface BusinessPageData {
  page: string
  title: string
  images: string[]
  details?: string
}

export default function OndeFicarPage() {
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
    data: businessPageData,
    isLoading: isLoadingPage,
    isError: isErrorPage
  } = useQuery({
    queryKey: ['businessPageData-accommodation'],
    queryFn: async () => {
      const res = await fetch('/api/public/common-pages?page=BUSINESS_ACCOMMODATION')
      if (!res.ok) throw new Error('Erro ao buscar dados da página')
      return res.json()
    }
  })

  const {
    data: businesses = [],
    isLoading: isLoadingBusinesses,
    isError: isErrorBusinesses
  } = useQuery({
    queryKey: ['businesses-accommodation'],
    queryFn: async () => {
      const res = await fetch('/api/public/onde-ficar')
      if (!res.ok) throw new Error('Erro ao buscar estabelecimentos')
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

  const {
    data: tags = [],
    isLoading: isLoadingTags,
    isError: isErrorTags
  } = useQuery({
    queryKey: ['tags-accommodation'],
    queryFn: async () => {
      const res = await fetch('/api/tags?category=ACCOMMODATION')
      if (!res.ok) throw new Error('Erro ao buscar tags')
      const data = await res.json()
      return data.filter((t: any) => t.active)
    }
  })

  // ...existing code...

  // Filtrar estabelecimentos
  let filteredBusinesses = businesses.filter((business: Business) => {
    const matchesSearch: boolean = business.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesBairro: boolean = selectedBairros.length === 0 || selectedBairros.includes(business.address_district)
    const matchesTags: boolean =
      selectedTags.length === 0 ||
      (!!business.tags && business.tags.some((tag: Tag) => selectedTags.includes(tag.name)))
    return matchesSearch && matchesBairro && matchesTags
  })

  // Ordenar estabelecimentos
  if (sortOption === 'name-asc') {
    filteredBusinesses = [...filteredBusinesses].sort((a, b) => a.name.localeCompare(b.name))
  } else if (sortOption === 'name-desc') {
    filteredBusinesses = [...filteredBusinesses].sort((a, b) => b.name.localeCompare(a.name))
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
  const totalPages = Math.ceil(filteredBusinesses.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentBusinesses = filteredBusinesses.slice(startIndex, endIndex)

  const goToPage = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Skeleton loading for progressive UX
  if (isLoadingPage || isLoadingBusinesses || isLoadingDistricts || isLoadingTags) {
    return <SectionSkeleton />
  }

  // Error states
  if (isErrorPage || isErrorBusinesses || isErrorDistricts || isErrorTags) {
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
      {businessPageData && (<DetailBanner title={businessPageData.title} images={businessPageData.images} details={businessPageData.details} />
      )}


      <FilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        districts={districts}
        tags={tags}
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
              Mostrando <span className="font-semibold text-gray-900">{currentBusinesses.length}</span> de{' '}
              <span className="font-semibold text-gray-900">{filteredBusinesses.length}</span> estabelecimentos
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

          <ListingGrid
            items={currentBusinesses}
            filteredCount={filteredBusinesses.length}
            onClearFilters={handleClearFilters}
            emptyLabel="Nenhuma hospedagem encontrada com os filtros selecionados."
            hrefBase="/onde-ficar"
          />

          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={goToPage} />
        </div>
      </section>
    </div>
  )
}
