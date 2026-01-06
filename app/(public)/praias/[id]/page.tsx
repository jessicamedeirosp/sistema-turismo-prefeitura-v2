'use client'

import { useEffect, useState } from 'react'
import * as lucideIcons from 'lucide-react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/css'
import DetailBanner from '../../../../components/DetailBanner'

interface Beach {
  id: string
  name: string
  district: string
  images: string[]
  details?: string
  tags?: Array<{ id: string; name: string; icon?: string }>
  latitude?: number
  longitude?: number
}

export default function PraiaDetalhePage() {
  const params = useParams()
  const id = typeof window !== 'undefined' ? (params?.id as string) : undefined
  const [beach, setBeach] = useState<Beach | null>(null)
  const [loading, setLoading] = useState(true)
  const [distance, setDistance] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, []);

  useEffect(() => {
    if (mounted && id) fetchBeach()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, id])

  const fetchBeach = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/public/beaches/${id}`)
      if (res.ok) {
        const data = await res.json()
        setBeach(data)
        if (data.latitude && data.longitude) {
          getUserDistance(data.latitude, data.longitude)
        }
      }
    } catch (e) {
      setBeach(null)
    } finally {
      setLoading(false)
    }
  }

  const getUserDistance = (lat: number, lng: number) => {
    if (typeof window === 'undefined' || !('geolocation' in navigator)) return
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const userLat = pos.coords.latitude
        const userLng = pos.coords.longitude
        const d = calcDistance(userLat, userLng, lat, lng)
        setDistance(`${d.toFixed(2)} km`)
      },
      () => setDistance(null),
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  // Haversine formula
  function calcDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371 // km
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  if (!mounted || !id) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Carregando praia...</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Carregando praia...</p>
        </div>
      </div>
    )
  }

  if (!beach) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-gray-600">Praia não encontrada.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {beach && (<DetailBanner title={beach.name} images={beach.images} details={beach.details} />)}
      <section className="container mx-auto px-4 py-10 max-w-3xl">
        <div className="mb-6">
          <h1 className="text-4xl md:text-5xl font-bold mb-2 text-gray-900">{beach.name}</h1>
          <p className="text-lg text-gray-700">{beach.district}</p>
          {distance && <p className="text-sm mt-2 text-gray-600">Distância até você: <span className="font-semibold">{distance}</span></p>}
        </div>
        {beach.tags && beach.tags.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {beach.tags.map(tag => {
              const IconRaw = tag.icon && lucideIcons[tag.icon as keyof typeof lucideIcons];
              const Icon = typeof IconRaw === 'function' && 'displayName' in IconRaw ? IconRaw : null;
              return (
                <span key={tag.id} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium flex items-center gap-1">
                  {Icon ? <Icon className="w-4 h-4 mr-1" /> : null}
                  {tag.name}
                </span>
              )
            })}
          </div>
        )}
        {beach.details && (
          <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: beach.details }} />
        )}
      </section>
    </div>
  )
}
