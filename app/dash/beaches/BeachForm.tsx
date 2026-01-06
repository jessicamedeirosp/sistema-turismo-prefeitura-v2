'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import SimpleRichEditor from '@/components/SimpleRichEditor'
import ImageUpload from '@/components/ImageUpload'

interface Tag {
  id: string
  name: string
}

interface BeachFormProps {
  beach?: {
    id: string
    name: string
    addressDistrict: string
    details: string | null
    images: string[]
    status: 'ACTIVE' | 'INACTIVE'
    tags: { tagId: string }[]
  }
}

export default function BeachForm({ beach }: BeachFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [tags, setTags] = useState<Tag[]>([])

  const [formData, setFormData] = useState({
    name: beach?.name || '',
    addressDistrict: beach?.addressDistrict || '',
    details: beach?.details || '',
    images: beach?.images || [],
    status: beach?.status || 'ACTIVE',
    tagIds: beach?.tags.map(t => t.tagId) || []
  })

  useEffect(() => {
    fetchTags()
  }, [])

  const fetchTags = async () => {
    try {
      const res = await fetch('/api/beaches/tags')
      if (res.ok) {
        const data = await res.json()
        setTags(data)
      }
    } catch (error) {
      console.error('Erro ao buscar tags:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      toast.error('Nome é obrigatório')
      return
    }

    if (!formData.addressDistrict.trim()) {
      toast.error('Bairro é obrigatório')
      return
    }

    setLoading(true)

    try {
      const url = beach
        ? `/api/beaches/admin/${beach.id}`
        : '/api/beaches/admin'

      const method = beach ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Erro ao salvar')
      }

      toast.success(beach ? 'Praia atualizada!' : 'Praia criada!')
      router.push('/dash/beaches')
      router.refresh()
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleTagToggle = (tagId: string) => {
    setFormData(prev => ({
      ...prev,
      tagIds: prev.tagIds.includes(tagId)
        ? prev.tagIds.filter(id => id !== tagId)
        : [...prev.tagIds, tagId]
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
        {/* Nome */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nome da Praia *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ex: Praia de Maresias"
            required
          />
        </div>

        {/* Bairro */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bairro *
          </label>
          <input
            type="text"
            value={formData.addressDistrict}
            onChange={(e) => setFormData({ ...formData, addressDistrict: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ex: Maresias"
            required
          />
        </div>

        {/* Detalhes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Detalhes
          </label>
          <SimpleRichEditor
            value={formData.details}
            onChange={(value) => setFormData({ ...formData, details: value })}
            placeholder="Descreva a praia, suas características, o que fazer, etc..."
          />
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Tags
          </label>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <button
                key={tag.id}
                type="button"
                onClick={() => handleTagToggle(tag.id)}
                className={`px-4 py-2 rounded-lg font-medium transition ${formData.tagIds.includes(tag.id)
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                {tag.name}
              </button>
            ))}
          </div>
          {tags.length === 0 && (
            <p className="text-sm text-gray-500 italic">
              Nenhuma tag disponível. Crie tags em Tags → Praias
            </p>
          )}
        </div>

        {/* Imagens */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Imagens
          </label>
          <ImageUpload
            images={formData.images}
            onImagesChange={(images) => setFormData({ ...formData, images })}
            maxImages={10}
          />
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Status
          </label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="status"
                value="ACTIVE"
                checked={formData.status === 'ACTIVE'}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'ACTIVE' | 'INACTIVE' })}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-sm font-medium text-gray-700">Ativa</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="status"
                value="INACTIVE"
                checked={formData.status === 'INACTIVE'}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'ACTIVE' | 'INACTIVE' })}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-sm font-medium text-gray-700">Inativa</span>
            </label>
          </div>
        </div>

        {/* Ações */}
        <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
          >
            {loading ? 'Salvando...' : (beach ? 'Atualizar' : 'Criar')}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-semibold"
          >
            Cancelar
          </button>
        </div>
      </div>
    </form>
  )
}
