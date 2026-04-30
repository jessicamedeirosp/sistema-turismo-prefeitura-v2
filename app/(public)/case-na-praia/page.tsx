'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { ArrowRight } from 'lucide-react'
import DetailBanner from '@/components/DetailBanner'
import { SectionSkeleton } from '@/components/SectionSkeleton'

type MarriagePageData = {
  title: string
  images: string[]
  details: string
}

export default function CaseNaPraiaPage() {
  const { data, isLoading, isError } = useQuery<MarriagePageData>({
    queryKey: ['common-page-marriage'],
    queryFn: async () => {
      const res = await fetch('/api/public/common-pages?page=MARRIAGE')
      if (!res.ok) throw new Error('Erro ao buscar página Case-se na praia')
      return res.json()
    },
    staleTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
  })

  if (isLoading) {
    return <SectionSkeleton />
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-red-600">Erro ao carregar dados. Tente novamente mais tarde.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DetailBanner
        title={data?.title || 'Case-se na praia'}
        images={data?.images || []}
        gradientClass="bg-gradient-to-r from-cyan-600 to-sky-500"
      />

      <section className="container mx-auto px-4 py-10">
        <div className="mx-auto max-w-4xl bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-8">
          <div
            className="prose prose-lg max-w-none text-gray-700"
            dangerouslySetInnerHTML={{ __html: data?.details || '' }}
          />

          <div className="mt-8 flex justify-center">
            <Link
              href="/case-na-praia-servico"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-teal-600 text-white font-semibold hover:bg-teal-700 transition"
            >
              Conheça os serviços case-se na praia
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
