"use client"

import { useEffect, useState } from "react"
import { Download as DownloadIcon, FileText } from "lucide-react"
import DetailBanner from '@/components/DetailBanner'
import FilterBar from "@/components/FilterBar"

interface Download {
  id: string
  name: string
  category: "DOWNLOAD" | "OBSERVATORY"
  link: string
  active: boolean
  created_at: string
}
export default function ObservatorioPage() {
  const [banner, setBanner] = useState<{
    title: string
    details?: string
    images?: string[]
  } | null>(null)
  const [downloads, setDownloads] = useState<Download[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)
    try {
      // Banner da common_page OBSERVATORY
      const bannerRes = await fetch("/api/public/common-pages?page=OBSERVATORY")
      if (bannerRes.ok) {
        const bannerData = await bannerRes.json()
        setBanner({
          title: bannerData.title,
          details: bannerData.details,
          images: bannerData.images,
        })
      }
      // Downloads categoria OBSERVATORY
      const downloadsRes = await fetch("/api/downloads?category=OBSERVATORY")
      if (downloadsRes.ok) {
        const downloadsData = await downloadsRes.json()
        setDownloads(downloadsData.filter((d: Download) => d.active))
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Erro ao buscar dados do Observatório:", error)
    } finally {
      setLoading(false)
    }
  }

  // Apenas filtro de busca
  const filteredDownloads = downloads.filter((download) => {
    const matchesSearch =
      searchTerm.trim() === "" ||
      download.name.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Banner */}
      {banner && (
        <DetailBanner title={banner.title} images={banner.images} details={banner.details} />
      )}

      {/* Descrição igual às outras páginas */}
      {banner?.details && (
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: banner.details }} />
            </div>
          </div>
        </section>
      )}

      {/* Filtro */}
      <div className="bg-white border-b border-gray-200 sticky top-[72px] z-30 mb-8">
        <FilterBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          districts={[]}
          tags={[]}
          onClearFilters={() => setSearchTerm("")}
          showDistrictDropdown={false}
          showTagsDropdown={false}
          onToggleDistrictDropdown={() => { }}
          onToggleTagsDropdown={() => { }}
          selectedDistricts={[]}
          selectedTags={[]}
          onToggleDistrict={() => { }}
          onToggleTag={() => { }}
        />
      </div>

      {/* Downloads */}
      <section className="max-w-4xl mx-auto px-4 pb-16">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mb-4" />
            <p className="text-gray-600 text-lg font-medium">Carregando arquivos...</p>
          </div>
        ) : filteredDownloads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mb-4" />
            <p className="text-gray-600 text-lg font-medium">Nenhum arquivo disponível</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredDownloads.map((download) => (
              <a
                key={download.id}
                href={download.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 bg-white rounded-lg shadow p-6 hover:shadow-lg transition border border-purple-100 group"
              >
                <DownloadIcon className="w-10 h-10 text-purple-700 group-hover:text-purple-900" />
                <div>
                  <p className="font-semibold text-lg text-purple-900 group-hover:underline">
                    {download.name}
                  </p>
                  <span className="text-xs text-gray-500">Clique para baixar</span>
                </div>
              </a>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
