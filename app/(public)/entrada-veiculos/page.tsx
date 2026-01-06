"use client"

import { useEffect, useState } from "react"
import PublicHeader from "@/components/PublicHeader"
import Footer from "../../../components/Footer"
import Image from "next/image"
import DetailBanner from "../../../components/DetailBanner"

interface Parking {
  id: string
  company: string
  address: string
  address_district: string
  van: boolean
  micro: boolean
  onibus: boolean
  phone: string
  email: string
  route_link: string
}

interface VehiclePageData {
  title: string
  images: string[]
  details: string // HTML
}

export default function EntradaVeiculosPage() {
  const [pageData, setPageData] = useState<VehiclePageData | null>(null)
  const [parkings, setParkings] = useState<Parking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // Dados da página VEHICLE
      const res = await fetch("/api/public/common-pages?page=VEHICLE")
      if (res.ok) {
        const data = await res.json()
        setPageData({
          title: data.title,
          images: data.images || [],
          details: data.details || "",
        })
      }
      // Estacionamentos
      const parkingRes = await fetch("/api/parkings")
      if (parkingRes.ok) {
        const parkingData = await parkingRes.json()
        setParkings(parkingData)
      }
    } catch (error) {
      console.error("❌ Error fetching vehicle/parking data:", error)
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
      {/* Detalhes */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: pageData?.details || '' }} />
          </div>
          {/* Cards de estacionamentos */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {parkings.length === 0 && (
              <div className="col-span-full text-center py-8 text-gray-500 bg-white rounded-lg shadow">Nenhum estacionamento credenciado encontrado.</div>
            )}
            {parkings.map((parking) => (
              <div key={parking.id} className="bg-white rounded-lg shadow-md p-6 flex flex-col gap-2 border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold text-gray-900">{parking.company}</h3>
                  <div className="flex gap-1">
                    {parking.van && <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded-full">Van</span>}
                    {parking.micro && <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded-full">Micro</span>}
                    {parking.onibus && <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-2 py-1 rounded-full">Ônibus</span>}
                  </div>
                </div>
                <div className="text-sm text-gray-700 mb-1"><strong>Endereço:</strong> {parking.address}</div>
                <div className="text-sm text-gray-700 mb-1"><strong>Distrito:</strong> {parking.address_district}</div>
                <div className="text-sm text-gray-700 mb-1"><strong>Telefone:</strong> {parking.phone}</div>
                <div className="text-sm text-gray-700 mb-1"><strong>E-mail:</strong> {parking.email}</div>
                <div className="mt-2">
                  {parking.route_link ? (
                    <a href={parking.route_link} target="_blank" rel="noopener noreferrer" className="inline-block text-blue-600 underline hover:text-blue-800 font-medium">Ver rota</a>
                  ) : (
                    <span className="text-gray-400">Ver rota</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
