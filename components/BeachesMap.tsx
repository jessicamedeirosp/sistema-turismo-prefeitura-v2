'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MapPin, X, Navigation, Route } from 'lucide-react'
import { toast } from 'sonner'

interface Beach {
  id: number
  name: string
  lat: number
  lng: number
  description: string
}

interface UserLocation {
  lat: number
  lng: number
}

// Praias de São Sebastião com coordenadas aproximadas
const BEACHES: Beach[] = [
  { id: 1, name: 'Praia de Maresias', lat: -23.7989, lng: -45.5644, description: 'Famosa pelo surf e vida noturna' },
  { id: 2, name: 'Praia de Camburi', lat: -23.7456, lng: -45.5222, description: 'Extensa e tranquila, ideal para famílias' },
  { id: 3, name: 'Praia de Cambury', lat: -23.8667, lng: -45.6167, description: 'Natureza preservada e surf' },
  { id: 4, name: 'Praia de Boiçucanga', lat: -23.7678, lng: -45.5456, description: 'Boa infraestrutura e águas calmas' },
  { id: 5, name: 'Praia Brava', lat: -23.7856, lng: -45.5600, description: 'Ondas fortes para surfistas experientes' },
  { id: 6, name: 'Praia de Juquehy', lat: -23.7756, lng: -45.5533, description: 'Popular com boa estrutura de comércio' },
  { id: 7, name: 'Praia da Baleia', lat: -23.7544, lng: -45.5311, description: 'Pequena e aconchegante' },
  { id: 8, name: 'Praia de Barequeçaba', lat: -23.7000, lng: -45.4833, description: 'Tranquila e com acesso de barco' },
  { id: 9, name: 'Praia de Toque-Toque Grande', lat: -23.7822, lng: -45.5578, description: 'Ambiente familiar e relaxante' },
  { id: 10, name: 'Praia de Toque-Toque Pequeno', lat: -23.7900, lng: -45.5622, description: 'Charmosa com restaurantes' },
  { id: 11, name: 'Praia de Paúba', lat: -23.7789, lng: -45.5522, description: 'Natureza preservada' },
  { id: 12, name: 'Praia do Centro', lat: -23.6956, lng: -45.4789, description: 'Próxima ao centro da cidade' },
]

export default function BeachesMap() {
  const router = useRouter()
  const [selectedBeach, setSelectedBeach] = useState<Beach | null>(null)
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null)
  const [locationError, setLocationError] = useState<string | null>(null)

  // Obter localização do usuário
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
          setLocationError(null)
        },
        (error) => {
          console.error('Erro ao obter localização:', error)
          setLocationError('Não foi possível obter sua localização')
        }
      )
    } else {
      setLocationError('Geolocalização não suportada')
    }
  }, [])

  // Calcular limites do mapa baseado nas coordenadas das praias
  const minLat = Math.min(...BEACHES.map(b => b.lat))
  const maxLat = Math.max(...BEACHES.map(b => b.lat))
  const minLng = Math.min(...BEACHES.map(b => b.lng))
  const maxLng = Math.max(...BEACHES.map(b => b.lng))

  // Função para converter lat/lng para posição no SVG (pixels)
  const getPosition = (lat: number, lng: number) => {
    const x = ((lng - minLng) / (maxLng - minLng)) * 90 + 5 // 5-95% da largura
    const y = ((lat - minLat) / (maxLat - minLat)) * 90 + 5 // 5-95% da altura
    return { x, y: 100 - y } // Inverter Y pois coordenadas crescem para cima
  }

  // Calcular distância entre dois pontos (fórmula de Haversine simplificada)
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371 // Raio da Terra em km
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLng = (lng2 - lng1) * Math.PI / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  // Abrir Google Maps com rotas
  const openDirections = (beach: Beach) => {
    if (userLocation) {
      const url = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${beach.lat},${beach.lng}&travelmode=driving`
      window.open(url, '_blank')
    } else {
      const url = `https://www.google.com/maps/search/?api=1&query=${beach.lat},${beach.lng}`
      window.open(url, '_blank')
    }
  }

  // Buscar praia na base de dados pelo nome e redirecionar para a página de detalhe (API otimizada)
  const goToBeachDetail = async (beachName: string) => {
    try {
      const res = await fetch(`/api/public/beaches/by-name?name=${encodeURIComponent(beachName)}`)
      if (!res.ok) {
        toast.error('Praia não encontrada na base de dados pública.')
        return
      }
      const beach = await res.json()
      if (beach && beach.id) {
        router.push(`/praias/${beach.id}`)
      } else {
        toast.error('Praia não encontrada na base de dados pública.')
      }
    } catch (e) {
      toast.error('Erro ao buscar praia na base de dados.')
    }
  }

  return (
    <div className="relative bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl overflow-hidden shadow-xl border border-blue-100">
      {/* Mapa */}
      <div className="relative h-[600px] p-8">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
          {/* Fundo do mar */}
          <defs>
            <linearGradient id="seaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#3b82f6', stopOpacity: 0.2 }} />
              <stop offset="100%" style={{ stopColor: '#06b6d4', stopOpacity: 0.3 }} />
            </linearGradient>
          </defs>
          <rect width="100" height="100" fill="url(#seaGradient)" />

          {/* Linhas conectando praias */}
          <g opacity="0.1">
            {BEACHES.map((beach, i) => {
              if (i === BEACHES.length - 1) return null
              const pos1 = getPosition(beach.lat, beach.lng)
              const pos2 = getPosition(BEACHES[i + 1].lat, BEACHES[i + 1].lng)
              return (
                <line
                  key={`line-${beach.id}`}
                  x1={pos1.x}
                  y1={pos1.y}
                  x2={pos2.x}
                  y2={pos2.y}
                  stroke="#3b82f6"
                  strokeWidth="0.3"
                />
              )
            })}
          </g>

          {/* Marcadores das praias */}
          {BEACHES.map((beach) => {
            const pos = getPosition(beach.lat, beach.lng)
            const isSelected = selectedBeach?.id === beach.id

            return (
              <g
                key={beach.id}
                onClick={() => setSelectedBeach(beach)}
                className="cursor-pointer transition-all"
                style={{ transformOrigin: `${pos.x}% ${pos.y}%` }}
              >
                {/* Círculo de destaque ao selecionar */}
                {isSelected && (
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r="3"
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="0.3"
                    opacity="0.5"
                  >
                    <animate
                      attributeName="r"
                      from="3"
                      to="5"
                      dur="1s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="opacity"
                      from="0.5"
                      to="0"
                      dur="1s"
                      repeatCount="indefinite"
                    />
                  </circle>
                )}

                {/* Pin da praia */}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={isSelected ? '1.8' : '1.2'}
                  fill={isSelected ? '#3b82f6' : '#ef4444'}
                  stroke="white"
                  strokeWidth="0.3"
                  className="transition-all hover:r-[1.8]"
                />

                {/* Label da praia */}
                <text
                  x={pos.x}
                  y={pos.y - 2}
                  fontSize="2.5"
                  fontWeight="600"
                  fill="#1f2937"
                  textAnchor="middle"
                  className="pointer-events-none select-none"
                  style={{ textShadow: '0 0 2px white, 0 0 2px white, 0 0 2px white' }}
                >
                  {beach.name.split(' ').pop()}
                </text>
              </g>
            )
          })}

          {/* Marcador da localização do usuário */}
          {userLocation && (
            <g>
              {(() => {
                const userPos = getPosition(userLocation.lat, userLocation.lng)
                return (
                  <>
                    {/* Pulso de localização */}
                    <circle
                      cx={userPos.x}
                      cy={userPos.y}
                      r="2"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="0.4"
                      opacity="0.6"
                    >
                      <animate
                        attributeName="r"
                        from="2"
                        to="4"
                        dur="2s"
                        repeatCount="indefinite"
                      />
                      <animate
                        attributeName="opacity"
                        from="0.6"
                        to="0"
                        dur="2s"
                        repeatCount="indefinite"
                      />
                    </circle>
                    {/* Ícone de localização do usuário */}
                    <circle
                      cx={userPos.x}
                      cy={userPos.y}
                      r="1.5"
                      fill="#10b981"
                      stroke="white"
                      strokeWidth="0.4"
                    />
                    <circle
                      cx={userPos.x}
                      cy={userPos.y}
                      r="0.6"
                      fill="white"
                    />
                    <text
                      x={userPos.x}
                      y={userPos.y - 2.5}
                      fontSize="2"
                      fontWeight="700"
                      fill="#10b981"
                      textAnchor="middle"
                      className="pointer-events-none select-none"
                      style={{ textShadow: '0 0 2px white, 0 0 2px white, 0 0 2px white' }}
                    >
                      Você está aqui
                    </text>
                  </>
                )
              })()}
            </g>
          )}
        </svg>

        {/* Info card da praia selecionada */}
        {selectedBeach && (
          <div className="absolute bottom-8 left-8 right-8 bg-white rounded-xl shadow-2xl p-6 border border-blue-100 animate-in slide-in-from-bottom duration-300">
            <button
              onClick={() => setSelectedBeach(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-start gap-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <MapPin className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {selectedBeach.name}
                </h3>
                <p className="text-gray-600 mb-3">
                  {selectedBeach.description}
                </p>
                {userLocation && (
                  <p className="text-sm text-gray-500 mb-4 flex items-center gap-1">
                    <Navigation className="w-4 h-4" />
                    Distância: {calculateDistance(
                      userLocation.lat,
                      userLocation.lng,
                      selectedBeach.lat,
                      selectedBeach.lng
                    ).toFixed(1)} km
                  </p>
                )}
                <div className="flex gap-3">
                  <button
                    onClick={() => openDirections(selectedBeach)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-semibold flex items-center gap-2"
                  >
                    <Route className="w-4 h-4" />
                    Como Chegar
                  </button>
                  <button
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm font-semibold"
                    onClick={() => goToBeachDetail(selectedBeach.name)}
                  >
                    Ver Detalhes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Legenda */}
      <div className="bg-white/80 backdrop-blur-sm px-8 py-4 border-t border-blue-100">
        <div className="flex items-center justify-center gap-8 text-sm flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500 border-2 border-white"></div>
            <span className="text-gray-600">Praias de São Sebastião</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-600 border-2 border-white"></div>
            <span className="text-gray-600">Praia Selecionada</span>
          </div>
          {userLocation && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500 border-2 border-white"></div>
              <span className="text-gray-600">Sua Localização</span>
            </div>
          )}
          <div className="text-gray-500">
            <MapPin className="w-4 h-4 inline mr-1" />
            Clique nas praias para ver rotas
          </div>
        </div>
        {locationError && (
          <div className="text-center mt-2 text-xs text-amber-600">
            {locationError} - Permita o acesso à localização para ver sua posição no mapa
          </div>
        )}
      </div>
    </div>
  )
}
