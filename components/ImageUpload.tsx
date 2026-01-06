'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Upload, X, Image as ImageIcon, Star } from 'lucide-react'
import { toast } from 'sonner'

interface ImageUploadProps {
  images: string[]
  onImagesChange: (images: string[]) => void
  maxImages?: number
  title?: string
  description?: string
}

export default function ImageUpload({
  images,
  onImagesChange,
  maxImages = 10,
  title = 'Imagens',
  description = 'Adicione fotos do estabelecimento. Primeira imagem será a capa.',
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (images.length >= maxImages) {
      toast.error(`Máximo de ${maxImages} imagens permitidas`)
      return
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Apenas imagens são permitidas')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Imagem deve ter no máximo 5MB')
      return
    }

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        console.error('Erro no upload:', data)
        toast.error(data.error || 'Erro ao enviar imagem')
        return
      }

      if (data.url) {
        onImagesChange([...images, data.url])
        toast.success('Imagem enviada com sucesso!')
      } else {
        console.error('URL não retornada:', data)
        toast.error('Erro: URL da imagem não retornada')
      }
    } catch (error) {
      console.error('Erro no upload:', error)
      toast.error('Erro ao enviar imagem')
    } finally {
      setIsUploading(false)
      // Reset input
      e.target.value = ''
    }
  }

  const handleRemove = async (url: string) => {
    try {
      const res = await fetch('/api/upload', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })

      if (res.ok) {
        onImagesChange(images.filter((img) => img !== url))
        toast.success('Imagem removida!')
      }
    } catch (error) {
      toast.error('Erro ao remover imagem')
    }
  }

  const handleSetAsCover = (url: string) => {
    const currentIndex = images.indexOf(url)
    if (currentIndex === 0) return // Já é a capa

    const newImages = [...images]
    newImages.splice(currentIndex, 1)
    newImages.unshift(url)
    onImagesChange(newImages)
    toast.success('Foto principal definida!')
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
        <p className="text-sm text-gray-600 mt-1">{description}</p>
      </div>

      {/* Grid de Imagens */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
          {images.map((url, idx) => (
            <div
              key={idx}
              className="relative aspect-video rounded-lg overflow-hidden bg-gray-100 group"
            >
              <Image
                src={url}
                alt={`Imagem ${idx + 1}`}
                fill
                className="object-cover"
              />
              {idx === 0 && (
                <div className="absolute top-2 left-2 px-2 py-1 bg-blue-600 text-white text-xs font-medium rounded flex items-center gap-1">
                  <Star className="w-3 h-3 fill-current" />
                  Capa
                </div>
              )}

              {/* Botão Remover - Canto Superior Direito */}
              <button
                type="button"
                onClick={() => handleRemove(url)}
                className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition hover:bg-red-700"
                title="Remover imagem"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition">
                {/* Botão Definir como Capa - Canto Inferior Esquerdo */}
                {idx !== 0 && (
                  <button
                    type="button"
                    onClick={() => handleSetAsCover(url)}
                    className="absolute bottom-2 left-2 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition hover:bg-blue-700"
                    title="Definir como capa"
                  >
                    <Star className="w-3.5 h-3.5" />
                    Definir como capa
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Botão de Upload */}
      {images.length < maxImages && (
        <label className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition">
          <input
            type="file"
            accept="image/*"
            onChange={handleUpload}
            className="hidden"
            disabled={isUploading}
          />
          {isUploading ? (
            <>
              <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-gray-700 font-medium">Enviando...</span>
            </>
          ) : (
            <>
              <Upload className="w-5 h-5 text-gray-600" />
              <span className="text-gray-700 font-medium">
                Adicionar Imagem ({images.length}/{maxImages})
              </span>
            </>
          )}
        </label>
      )}

      {images.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          <ImageIcon className="w-12 h-12 mx-auto mb-2" />
          <p className="text-sm">Nenhuma imagem adicionada ainda</p>
        </div>
      )}
    </div>
  )
}
