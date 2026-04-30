'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import FilterBar from '@/components/FilterBar'
import ListingGrid from '@/components/ListingGrid'
import Pagination from '@/components/Pagination'
import DetailBanner from '@/components/DetailBanner'
import { SectionSkeleton } from '@/components/SectionSkeleton'

export default function ArtesanatoPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedBairros, setSelectedBairros] = useState<string[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [showBairroDropdown, setShowBairroDropdown] = useState(false)
  const [showTagsDropdown, setShowTagsDropdown] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [sortOption, setSortOption] = useState('relevance')
  const itemsPerPage = 12

  const {
    data: businesses = [],
    isLoading: isLoadingBusinesses,
    isError: isErrorBusinesses,
  } = useQuery({
    queryKey: ['artesanato-businesses'],
    queryFn: async () => {
      const res = await fetch('/api/public/artesanato')
      if (!res.ok) throw new Error('Erro ao buscar artesanato')
      return res.json()
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  })

  const {
    data: districts = [],
    isLoading: isLoadingDistricts,
    isError: isErrorDistricts,
  } = useQuery({
    queryKey: ['artesanato-districts'],
    queryFn: async () => {
      const res = await fetch('/api/districts')
      if (!res.ok) throw new Error('Erro ao buscar distritos')
      const data = await res.json()
      return data.filter((d: any) => d.active)
    },
    staleTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
  })

  const {
    data: tags = [],
    isLoading: isLoadingTags,
    isError: isErrorTags,
  } = useQuery({
    queryKey: ['artesanato-tags'],
    queryFn: async () => {
      const res = await fetch('/api/tags?category=ARTISAN')
      if (!res.ok) throw new Error('Erro ao buscar tags')
      return res.json()
    },
    staleTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
  })

  const filteredBusinesses = (Array.isArray(businesses) ? businesses : []).filter((business: any) => {
    const matchesSearch = business.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesBairro = selectedBairros.length === 0 || selectedBairros.includes(business.address_district)
    const matchesTags =
      selectedTags.length === 0 ||
      (Array.isArray(business.tags) ? business.tags.some((tag: any) => selectedTags.includes(tag.name)) : false)
    return matchesSearch && matchesBairro && matchesTags
  })

  if (sortOption === 'name-asc') {
    filteredBusinesses.sort((a: any, b: any) => a.name.localeCompare(b.name))
  } else if (sortOption === 'name-desc') {
    filteredBusinesses.sort((a: any, b: any) => b.name.localeCompare(a.name))
  }

  const totalPages = Math.ceil(filteredBusinesses.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentBusinesses = filteredBusinesses.slice(startIndex, endIndex)

  const goToPage = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
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
  const {
    data: pageData,
    isLoading: isLoadingPage,
    isError: isErrorPage,
  } = useQuery<BusinessServicesPageData>({
    queryKey: ['business-services-page-data'],
    queryFn: async () => {
      const res = await fetch('/api/public/common-pages?page=BUSINESS_ARTISAN')
      if (!res.ok) throw new Error('Erro ao buscar dados da página')
      return res.json()
    },
    staleTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
  })

  if (isLoadingBusinesses || isLoadingDistricts || isLoadingBusinesses || isLoadingTags) {
    return <SectionSkeleton />
  }

  if (isErrorBusinesses || isErrorPage || isErrorDistricts || isErrorTags) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="mt-4 text-red-600">Erro ao carregar dados. Tente novamente mais tarde.</p>
        </div>
      </div>
    )
  }
  interface BusinessServicesPageData {
    title: string
    images: string[]
    details?: string
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DetailBanner
        title={pageData?.title || 'Artesanato'}
        images={pageData?.images || []}
        details={pageData?.details}
        gradientClass="bg-gradient-to-r from-cyan-600 to-sky-500"
      />

      <FilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        districts={districts}
        tags={tags}
        selectedDistricts={selectedBairros}
        selectedTags={selectedTags}
        onToggleDistrict={(district: string) => {
          setSelectedBairros(prev => prev.includes(district) ? prev.filter((value) => value !== district) : [...prev, district])
        }}
        onToggleTag={(tag: string) => {
          setSelectedTags(prev => prev.includes(tag) ? prev.filter((value) => value !== tag) : [...prev, tag])
        }}
        onClearFilters={handleClearFilters}
        showDistrictDropdown={showBairroDropdown}
        showTagsDropdown={showTagsDropdown}
        onToggleDistrictDropdown={handleToggleDistrictDropdown}
        onToggleTagsDropdown={handleToggleTagsDropdown}
      />

      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <p className="text-gray-600">
              Mostrando <span className="font-semibold text-gray-900">{currentBusinesses.length}</span> de{' '}
              <span className="font-semibold text-gray-900">{filteredBusinesses.length}</span> estabelecimentos
            </p>
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
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
            emptyLabel="Nenhum artesão encontrado com os filtros selecionados."
            hrefBase="/artesanato"
          />

          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={goToPage} />
        </div>
      </section>
    </div>
  )
}
