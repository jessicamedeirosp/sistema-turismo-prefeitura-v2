'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/css'
import DetailBanner from '../../../../components/DetailBanner'

interface TourTemplate {
  id: string
  name: string
  description?: string
  images: string[]
  requires_guide?: boolean
}

export default function OQueFazerDetalhePage() {
  const params = useParams();
  const id = typeof window !== 'undefined' ? (params?.id as string) : undefined;
  const [tour, setTour] = useState<TourTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && id) {
      fetchTour();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, id]);

  const fetchTour = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/public/tour-templates/${id}`);
      if (res.ok) {
        const data = await res.json();
        setTour(data);
      }
    } catch (error) {
      setTour(null);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted || !id) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Carregando passeio...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Carregando passeio...</p>
        </div>
      </div>
    );
  }

  if (!tour) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-gray-600">Passeio não encontrado.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {tour && (
        <DetailBanner title={tour.name} images={tour.images} details={tour.description} />
      )}

      <section className="container mx-auto px-4 py-10 max-w-3xl">
        <div className="mb-6">
          <h1 className="text-4xl md:text-5xl font-bold mb-2 text-gray-900">{tour.name}</h1>
          {tour.description && (
            <p className="text-lg text-gray-700">{tour.description}</p>
          )}
        </div>
        {tour.requires_guide && (
          <div className="mt-10 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-4 rounded mb-4 flex flex-col md:items-center md:justify-between">
            <div>
              <p className="font-semibold mb-2">Este passeio requer acompanhamento de guia credenciado.</p>
            </div>
            <div className='flex items-center gap-2'>

              <a href="/guias" className="mt-2 md:mt-0 px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition font-bold">
                Ver Guias Credenciados
              </a>
              <a href="/agencias" className="mt-2 md:mt-0 px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition font-bold">
                Ver Agências Credenciadas
              </a>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
