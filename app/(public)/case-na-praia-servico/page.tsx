'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import DetailBanner from '@/components/DetailBanner'
import FilterBar from '@/components/FilterBar'
import ListingGrid from '@/components/ListingGrid'
import Pagination from '@/components/Pagination'
import { SectionSkeleton } from '@/components/SectionSkeleton'

interface BusinessServicesPageData {
  title: string
  images: string[]
  details?: string
}

export default function CaseNaPraiaServicoPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedBairros, setSelectedBairros] = useState<string[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [showBairroDropdown, setShowBairroDropdown] = useState(false)
  const [showTagsDropdown, setShowTagsDropdown] = useState(false)
  const itemsPerPage = 12

  const {
    data: pageData,
    isLoading: isLoadingPage,
    isError: isErrorPage,
  } = useQuery<BusinessServicesPageData>({
    queryKey: ['business-services-page-data'],
    queryFn: async () => {
      const res = await fetch('/api/public/common-pages?page=BUSINESS_SERVICES')
      if (!res.ok) throw new Error('Erro ao buscar dados da página')
      return res.json()
    },
    staleTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
  })

  const {
    data: businesses = [],
    isLoading: isLoadingBusinesses,
    isError: isErrorBusinesses,
  } = useQuery({
    queryKey: ['case-na-praia-servico-businesses'],
    queryFn: async () => {
      const res = await fetch('/api/public/case-na-praia')
      if (!res.ok) throw new Error('Erro ao buscar serviços do case-na-praia')
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
    queryKey: ['case-na-praia-servico-districts'],
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
    queryKey: ['case-na-praia-servico-tags'],
    queryFn: async () => {
      const res = await fetch('/api/tags?category=SERVICES')
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

  if (isLoadingPage || isLoadingBusinesses || isLoadingDistricts || isLoadingTags) {
    return <SectionSkeleton />
  }

  if (isErrorPage || isErrorBusinesses || isErrorDistricts || isErrorTags) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="mt-4 text-red-600">Erro ao carregar dados. Tente novamente mais tarde.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DetailBanner
        title={pageData?.title || 'Serviços case-se na praia'}
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
              <span className="font-semibold text-gray-900">{filteredBusinesses.length}</span> serviços
            </p>
          </div>

          <ListingGrid
            items={currentBusinesses}
            filteredCount={filteredBusinesses.length}
            onClearFilters={handleClearFilters}
            emptyLabel="Nenhum serviço encontrado com os filtros selecionados."
            hrefBase="/case-na-praia-servico"
          />

          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={goToPage} />
        </div>
      </section>
    </div>
  )
}
