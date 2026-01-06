'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import FilterBar from '@/components/FilterBar'
import ListingGrid from '@/components/ListingGrid'
import Pagination from '@/components/Pagination'
import DetailBanner from '../../../components/DetailBanner'
import { SectionSkeleton } from '@/components/SectionSkeleton'

interface Beach {
  id: string
  name: string
  district: string
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

interface BeachPageData {
  page: string
  title: string
  images: string[]
  details?: string
}

export default function TodasPraiasPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedBairros, setSelectedBairros] = useState<string[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [showBairroDropdown, setShowBairroDropdown] = useState(false)
  const [showTagsDropdown, setShowTagsDropdown] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  // React Query para todos os dados
  const { data: beachPageData, isLoading: loadingPage } = useQuery({
    queryKey: ['beach-page'],
    queryFn: async () => {
      const res = await fetch('/api/public/common-pages?page=BEACH')
      if (!res.ok) throw new Error('Erro ao buscar dados da página de praias')
      return res.json()
    },
    staleTime: 1000 * 60 * 10,

    refetchOnWindowFocus: false,
  })

  const { data: beaches, isLoading: loadingBeaches } = useQuery({
    queryKey: ['beaches'],
    queryFn: async () => {
      const res = await fetch('/api/beaches')
      if (!res.ok) throw new Error('Erro ao buscar praias')
      return res.json()
    },
    staleTime: 1000 * 60 * 10,

    refetchOnWindowFocus: false,
  })

  const { data: districts, isLoading: loadingDistricts } = useQuery({
    queryKey: ['districts'],
    queryFn: async () => {
      const res = await fetch('/api/districts')
      if (!res.ok) throw new Error('Erro ao buscar distritos')
      return (await res.json()).filter((d: any) => d.active)
    },
    staleTime: 1000 * 60 * 10,

    refetchOnWindowFocus: false,
  })

  const { data: tags, isLoading: loadingTags } = useQuery({
    queryKey: ['beach-tags'],
    queryFn: async () => {
      const res = await fetch('/api/tags?category=BEACH')
      if (!res.ok) throw new Error('Erro ao buscar tags')
      return (await res.json()).filter((t: any) => t.active)
    },
    staleTime: 1000 * 60 * 10,

    refetchOnWindowFocus: false,
  })
  const [sortOption, setSortOption] = useState('relevance')
  const itemsPerPage = 12




  // Filtrar praias
  let filteredBeaches = Array.isArray(beaches)
    ? beaches.filter(beach => {
      const matchesSearch = beach.name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesBairro = selectedBairros.length === 0 || selectedBairros.includes(beach.district)
      const matchesTags: boolean =
        selectedTags.length === 0 ||
        (beach.tags &&
          beach.tags.some((tag: Tag) => selectedTags.includes(tag.name)))
      return matchesSearch && matchesBairro && matchesTags
    })
    : []

  // Ordenar praias
  if (sortOption === 'name-asc') {
    filteredBeaches = [...filteredBeaches].sort((a, b) => a.name.localeCompare(b.name))
  } else if (sortOption === 'name-desc') {
    filteredBeaches = [...filteredBeaches].sort((a, b) => b.name.localeCompare(a.name))
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
  const totalPages = Math.ceil(filteredBeaches.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentBeaches = filteredBeaches.slice(startIndex, endIndex)


  const goToPage = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (loadingPage || loadingBeaches || loadingDistricts || loadingTags) {
    return (
      <div className="min-h-screen bg-white">
        <SectionSkeleton height={350} />
        <SectionSkeleton height={80} />
        <SectionSkeleton height={400} />
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
      {beachPageData && (
        <DetailBanner title={beachPageData.title} images={beachPageData.images} details={beachPageData.details} />
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
              Mostrando <span className="font-semibold text-gray-900">{currentBeaches.length}</span> de{' '}
              <span className="font-semibold text-gray-900">{filteredBeaches.length}</span> praias
            </p>
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              value={sortOption}
              onChange={e => setSortOption(e.target.value)}
            >
              <option value="name-asc">Nome A-Z</option>
              <option value="name-desc">Nome Z-A</option>
            </select>
          </div>

          <ListingGrid
            items={currentBeaches}
            filteredCount={filteredBeaches.length}
            onClearFilters={handleClearFilters}
            emptyLabel="Nenhuma praia encontrada com os filtros selecionados."
            hrefBase="/praias"
          />

          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={goToPage} />
        </div>
      </section>
    </div>
  )
}
