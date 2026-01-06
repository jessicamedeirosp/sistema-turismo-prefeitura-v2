"use client"

import { useEffect, useState } from "react"
import DetailBanner from '@/components/DetailBanner'
import FilterBar from "@/components/FilterBar"

interface UsefulInfo {
  id: string
  name: string
  phone: string
  address?: string
  website?: string
  email?: string
  category: string
}

interface UsefulInfoPageData {
  title: string
  images: string[]
  details: string // HTML
}

export default function InformacoesUteisPage() {
  const [pageData, setPageData] = useState<UsefulInfoPageData | null>(null)
  const [infos, setInfos] = useState<UsefulInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // Dados da página USEFULLINFO
      const res = await fetch("/api/public/common-pages?page=USEFULLINFO")
      if (res.ok) {
        const data = await res.json()
        setPageData({
          title: data.title,
          images: data.images || [],
          details: data.details || "",
        })
      }
      // Informações úteis
      const infoRes = await fetch("/api/useful-info")
      if (infoRes.ok) {
        const infoData = await infoRes.json()
        setInfos(infoData)
      }
    } catch (error) {
      console.error("❌ Error fetching useful info:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  // Categorias únicas
  const categories = Array.from(new Set(infos.map((info) => info.category))).filter(Boolean).map((cat, idx) => ({ id: String(idx), name: cat }))

  // Filtragem
  const filteredInfos = infos.filter((info) => {
    const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(info.category)
    const matchesSearch =
      searchTerm.trim() === "" ||
      info.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (info.address && info.address.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (info.phone && info.phone.toLowerCase().includes(searchTerm.toLowerCase()))
    return matchesCategory && matchesSearch
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {pageData && (
        <DetailBanner title={pageData.title} images={pageData.images} details={pageData.details} />
      )}

      {/* Filtro */}
      <div className="bg-white border-b border-gray-200 sticky top-[72px] z-30">
        <FilterBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          districts={[]}
          tags={[]}
          categories={categories}
          selectedCategories={selectedCategories}
          onToggleCategory={(cat) => {
            setSelectedCategories((prev) =>
              prev.includes(cat)
                ? prev.filter((c) => c !== cat)
                : [...prev, cat]
            )
          }}
          showCategoryDropdown={showCategoryDropdown}
          onToggleCategoryDropdown={() => setShowCategoryDropdown((v) => !v)}
          selectedDistricts={[]}
          selectedTags={[]}
          onToggleDistrict={() => { }}
          onToggleTag={() => { }}
          onClearFilters={() => {
            setSearchTerm("")
            setSelectedCategories([])
          }}
          showDistrictDropdown={false}
          showTagsDropdown={false}
          onToggleDistrictDropdown={() => { }}
          onToggleTagsDropdown={() => { }}
        />
      </div>

      {/* Descrição */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: pageData?.details || '' }} />
          </div>
          {/* Cards de informações úteis */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredInfos.length === 0 && (
              <div className="col-span-full text-center py-8 text-gray-500 bg-white rounded-lg shadow">Nenhuma informação útil encontrada.</div>
            )}
            {filteredInfos.map((info) => (
              <div key={info.id} className="bg-white rounded-lg shadow-md p-6 flex flex-col gap-2 border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-1">{info.name}</h3>
                {info.phone && <div className="text-sm text-gray-700 mb-1"><strong>Telefone:</strong> {info.phone}</div>}
                {info.address && <div className="text-sm text-gray-700 mb-1"><strong>Endereço:</strong> {info.address}</div>}
                {info.email && <div className="text-sm text-gray-700 mb-1"><strong>E-mail:</strong> {info.email}</div>}
                {info.website && (
                  <div className="text-sm text-gray-700 mb-1"><strong>Site:</strong> <a href={info.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-800">{info.website}</a></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
