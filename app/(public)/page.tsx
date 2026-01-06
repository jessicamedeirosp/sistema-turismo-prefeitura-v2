'use client'

import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import Image from 'next/image'
import Link from 'next/link'
import BeachesMap from '@/components/BeachesMap'
import VideoHero from '@/components/VideoHero'
import WeatherSection from '@/components/WeatherSection'
import { SectionSkeleton } from '@/components/SectionSkeleton'

export default function PublicHomePage() {
  // Usa React Query para buscar dados da home
  // ATENÇÃO: Envolva seu app com QueryClientProvider no layout.tsx ou _app.tsx
  // Fetch each section independently
  const {
    data: homeData,
    isLoading: loadingHome
  } = useQuery({
    queryKey: ['public-home'],
    queryFn: async () => {
      const res = await fetch('/api/public/common-pages?page=HOME')
      if (!res.ok) throw new Error('Erro ao buscar dados da home')
      return res.json()
    },
    staleTime: 1000 * 60 * 5, // 5 min
    refetchOnWindowFocus: false,
  })

  const { data: beaches, isLoading: loadingBeaches } = useQuery({
    queryKey: ['public-beaches'],
    queryFn: async () => {
      const res = await fetch('/api/public/beaches')
      if (!res.ok) throw new Error('Erro ao buscar praias')
      return res.json()
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  })

  const { data: restaurants, isLoading: loadingRestaurants } = useQuery({
    queryKey: ['public-restaurants'],
    queryFn: async () => {
      const res = await fetch('/api/public/businesses?category=FOOD')
      if (!res.ok) throw new Error('Erro ao buscar restaurantes')
      return res.json()
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  })

  const { data: accommodations, isLoading: loadingAccommodations } = useQuery({
    queryKey: ['public-accommodations'],
    queryFn: async () => {
      const res = await fetch('/api/public/businesses?category=ACCOMMODATION')
      if (!res.ok) throw new Error('Erro ao buscar acomodações')
      return res.json()
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  })

  const { data: events, isLoading: loadingEvents } = useQuery({
    queryKey: ['public-events'],
    queryFn: async () => {
      const res = await fetch('/api/public/events')
      if (!res.ok) throw new Error('Erro ao buscar eventos')
      return res.json()
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  })

  const { data: news, isLoading: loadingNews } = useQuery({
    queryKey: ['public-news'],
    queryFn: async () => {
      const res = await fetch('/api/public/news')
      if (!res.ok) throw new Error('Erro ao buscar notícias')
      return res.json()
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  })

  const { data: tours, isLoading: loadingTours } = useQuery({
    queryKey: ['public-tours'],
    queryFn: async () => {
      const res = await fetch('/api/public/tours')
      if (!res.ok) throw new Error('Erro ao buscar passeios')
      return res.json()
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  })
  // Weather segue separado pois é externo
  const [weather, setWeather] = useState<any>(null)

  useEffect(() => {
    fetchWeather()
  }, [])



  const fetchWeather = async () => {
    try {
      // São Sebastião coordinates: -23.8103, -45.4019
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=-23.8103&longitude=-45.4019&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=America/Sao_Paulo`
      )
      if (response.ok) {
        const data = await response.json()
        setWeather(data.current)
      }
    } catch (error) {
      console.error('Error fetching weather:', error)
    }
  }



  // Carregamento progressivo por seção
  // ...existing code...

  return (
    <div className="min-h-screen bg-white">
      {/* Banner principal */}
      {loadingHome ? (
        <SectionSkeleton height={350} />
      ) : (
        <VideoHero videoUrl={homeData?.video || ''} />
      )}

      <WeatherSection weather={weather} />

      {/* Seção: Praias */}
      <section id="praias" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Link href="/praias" className="inline-block group">
              <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 group-hover:text-blue-600 transition">
                Nossas Praias
              </h2>
            </Link>
            <div className="w-20 h-1 bg-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Descubra as mais belas praias com águas cristalinas e areias douradas
            </p>
          </div>
          {loadingBeaches ? (
            <SectionSkeleton height={300} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {(Array.isArray(beaches) ? beaches : []).slice(0, 6).map((beach: any) => (
                <Link
                  key={beach.id}
                  href={`/praias/${beach.id}`}
                  className="group cursor-pointer"
                >
                  <div className="relative h-72 bg-gradient-to-br from-cyan-400 to-blue-500 overflow-hidden rounded-xl shadow-lg">
                    {beach.images && beach.images.length > 0 ? (
                      <Image
                        src={beach.images[0]}
                        alt={beach.name}
                        fill
                        className="object-cover"
                        loading="lazy"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-blue-500" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6 group-hover:from-black/70 transition-all">
                      <div className="text-white">
                        <h3 className="text-2xl font-bold mb-2 transform group-hover:translate-y-[-4px] transition-transform">
                          {beach.name}
                        </h3>
                        {beach.address_district && (
                          <p className="text-sm text-white/90 opacity-0 group-hover:opacity-100 transition-opacity">
                            {beach.address_district}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Seção: Mapa das Praias */}
      <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Mapa das Praias
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Explore todas as praias de São Sebastião. Clique em cada marcador para mais informações.
            </p>
          </div>
          <BeachesMap />
        </div>
      </section>

      {/* Seção: Onde Comer */}
      <section id="o-que-comer" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <Link href="/o-que-comer" className="inline-block group w-full">
            <h2 className="text-4xl font-bold text-center mb-4 text-gray-900 group-hover:text-orange-600 transition">
              Onde Comer?
            </h2>
          </Link>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Saboreie a culinária local nos melhores restaurantes da região
          </p>
          {loadingRestaurants ? (
            <SectionSkeleton height={250} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {(Array.isArray(restaurants) ? restaurants : []).slice(0, 4).map((restaurant: any) => (
                <Link
                  key={restaurant.id}
                  href={`/o-que-comer/${restaurant.id}`}
                  className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition group cursor-pointer border border-gray-100"
                >
                  <div className="relative h-48 bg-gradient-to-br from-orange-400 to-red-500 overflow-hidden">
                    {restaurant.images && restaurant.images.length > 0 ? (
                      <Image
                        src={restaurant.images[0]}
                        alt={restaurant.name}
                        fill
                        className="object-cover group-hover:scale-110 transition duration-300"
                        loading="lazy"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-white text-5xl group-hover:scale-110 transition duration-300">
                        🍽️
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-bold mb-1 text-gray-900">
                      {restaurant.name}
                    </h3>
                    {restaurant.address_district && (
                      <p className="text-sm text-gray-600">
                        {restaurant.address_district}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Seção: Onde Ficar */}
      <section id="onde-ficar" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <Link href="/onde-ficar" className="inline-block group w-full">
            <h2 className="text-4xl font-bold text-center mb-4 text-gray-900 group-hover:text-purple-600 transition">
              Onde Ficar?
            </h2>
          </Link>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Acomodações confortáveis para todos os gostos e bolsos
          </p>
          {loadingAccommodations ? (
            <SectionSkeleton height={250} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {(Array.isArray(accommodations) ? accommodations : []).slice(0, 6).map((accommodation: any) => (
                <Link
                  key={accommodation.id}
                  href={`/onde-ficar/${accommodation.id}`}
                  className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition group cursor-pointer"
                >
                  <div className="relative h-56 bg-gradient-to-br from-purple-400 to-pink-500 overflow-hidden">
                    {accommodation.images && accommodation.images.length > 0 ? (
                      <Image
                        src={accommodation.images[0]}
                        alt={accommodation.name}
                        fill
                        className="object-cover group-hover:scale-110 transition duration-300"
                        loading="lazy"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-white text-6xl group-hover:scale-110 transition duration-300">
                        🏨
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2 text-gray-900">
                      {accommodation.name}
                    </h3>
                    {accommodation.address_district && (
                      <p className="text-gray-600">
                        {accommodation.address_district}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Seção: Calendário de Eventos */}
      <section id="calendario" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <Link href="/eventos" className="inline-block group w-full">
            <h2 className="text-4xl font-bold text-center mb-4 text-gray-900 group-hover:text-blue-600 transition">
              Calendário de Eventos
            </h2>
          </Link>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Não perca os principais eventos e festivais da região
          </p>
          {loadingEvents ? (
            <SectionSkeleton height={250} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {(Array.isArray(events) ? events : []).slice(0, 4).map((event: any) => {
                const eventDate = new Date(event.date)
                const day = eventDate.getDate()
                const month = eventDate.toLocaleString('pt-BR', { month: 'short' }).toUpperCase()
                return (
                  <Link
                    key={event.id}
                    href={`/eventos/${event.id}`}
                    className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-6 shadow-lg hover:shadow-xl transition cursor-pointer border border-blue-100"
                  >
                    <div className="flex items-start gap-4">
                      <div className="bg-blue-600 text-white rounded-lg p-3 text-center min-w-[70px]">
                        <div className="text-2xl font-bold">{day}</div>
                        <div className="text-xs">{month}</div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold mb-1 text-gray-900">
                          {event.name}
                        </h3>
                        {event.location && (
                          <p className="text-sm text-gray-600 mb-2">
                            {event.location}
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* Seção: O Que Fazer */}
      <section id="o-que-fazer" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <Link href="/o-que-fazer" className="inline-block group w-full">
            <h2 className="text-4xl font-bold text-center mb-4 text-gray-900 group-hover:text-green-600 transition">
              O Que Fazer?
            </h2>
          </Link>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Atividades e experiências para todos os perfis de viajantes
          </p>
          {loadingTours ? (
            <SectionSkeleton height={250} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {(Array.isArray(tours) ? tours : []).slice(0, 4).map((tour: any) => (
                <Link
                  key={tour.id}
                  href={`/o-que-fazer/${tour.id}`}
                  className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition group cursor-pointer"
                >
                  <div className="relative h-48 bg-gradient-to-br from-green-400 to-teal-500 overflow-hidden">
                    {tour.images && tour.images.length > 0 ? (
                      <Image
                        src={tour.images[0]}
                        alt={tour.name}
                        fill
                        className="object-cover group-hover:scale-110 transition duration-300"
                        loading="lazy"
                        sizes="(max-width: 768px) 100vw, 25vw"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-teal-500" />
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-bold mb-2 text-gray-900">
                      {tour.name}
                    </h3>
                    {tour.description && (
                      <p className="text-sm text-gray-600">{tour.description}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Seção: Notícias e Informações */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <Link href="/noticias" className="inline-block group w-full">
            <h2 className="text-4xl font-bold text-center mb-4 text-gray-900 group-hover:text-gray-700 transition">
              Notícias e Informações
            </h2>
          </Link>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Fique por dentro das novidades e dicas para sua viagem
          </p>
          {loadingNews ? (
            <SectionSkeleton height={250} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {(Array.isArray(news) ? news : []).slice(0, 6).map((article: any) => {
                const articleDate = new Date(article.created_at)
                const formattedDate = articleDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()
                // Remover tags HTML do conteúdo
                const plainText = article.content ? article.content.replace(/<[^>]*>/g, '') : ''
                return (
                  <Link
                    key={article.id}
                    href={`/noticias/${article.id}`}
                    className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition cursor-pointer border border-gray-100"
                  >
                    <div className="relative h-48 bg-gradient-to-br from-green-400 to-blue-500 overflow-hidden">
                      {article.image ? (
                        <Image
                          src={article.image}
                          alt={article.title}
                          fill
                          className="object-cover"
                          loading="lazy"
                          sizes="(max-width: 768px) 100vw, 33vw"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-white text-5xl">
                          📰
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      <span className="text-xs text-blue-600 font-semibold">
                        {formattedDate}
                      </span>
                      <h3 className="text-lg font-bold mb-2 mt-1 text-gray-900">
                        {article.title}
                      </h3>
                      {plainText && (
                        <p className="text-sm text-gray-600">
                          {plainText.substring(0, 100)}...
                        </p>
                      )}
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </section>

    </div>
  )
}
