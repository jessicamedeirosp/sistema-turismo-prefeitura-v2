"use client"

import { useEffect, useState } from "react"
import DetailBanner from '@/components/DetailBanner'

interface ComturPageData {
  title: string
  images: string[]
  details: string // HTML
}

export default function ComturPage() {
  const [pageData, setPageData] = useState<ComturPageData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const res = await fetch('/api/public/common-pages?page=COMTUR')
      if (res.ok) {
        const data = await res.json()
        setPageData({
          title: data.title,
          images: data.images || [],
          details: data.details || '',
        })
      }
    } catch (error) {
      console.error('❌ Error fetching COMTUR page:', error)
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

  return (
    <div className="min-h-screen bg-gray-50">
      {pageData && (
        <DetailBanner title={pageData.title} images={pageData.images} details={pageData.details} />
      )}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-lg shadow-md p-6">
            {/* Renderizar detalhes como HTML seguro */}
            <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: pageData?.details || '' }} />
          </div>
        </div>
      </section>
    </div>
  )
}
