'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { toast } from 'sonner'
import { ArrowLeft, Save, FileText, Upload, Trash2 } from 'lucide-react'
import Link from 'next/link'
import ConfirmModal from '@/components/ConfirmModal'
import LoadingSpinner from '@/components/LoadingSpinner'

type DownloadCategory = 'DOWNLOAD' | 'OBSERVATORY'

export default function DownloadFormPage() {
  const router = useRouter()
  const params = useParams()
  const isEdit = params?.id !== 'new'

  const [name, setName] = useState('')
  const [category, setCategory] = useState<DownloadCategory>('DOWNLOAD')
  const [link, setLink] = useState('')
  const [active, setActive] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(isEdit)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [pdfFileName, setPdfFileName] = useState<string>('')

  useEffect(() => {
    if (isEdit) {
      fetchDownload()
    }
  }, [params?.id])

  async function fetchDownload() {
    try {
      const response = await fetch(`/api/downloads/${params?.id}`)
      if (!response.ok) throw new Error('Erro ao buscar download')
      const data = await response.json()

      setName(data.name)
      setCategory(data.category)
      setLink(data.link)
      setActive(data.active)

      // Extrai nome do arquivo da URL
      const urlParts = data.link.split('/')
      setPdfFileName(urlParts[urlParts.length - 1])
    } catch (error) {
      console.error(error)
      toast.error('Erro ao carregar download')
    } finally {
      setLoading(false)
    }
  }

  async function handlePdfUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.type !== 'application/pdf') {
      toast.error('Apenas arquivos PDF são permitidos')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Arquivo muito grande (máx 10MB)')
      return
    }

    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload-pdf', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) throw new Error('Erro no upload')

      const data = await response.json()

      setLink(data.url)
      setPdfFileName(file.name)
      toast.success('PDF enviado com sucesso!')
    } catch (error) {
      console.error(error)
      toast.error('Erro ao fazer upload do PDF')
    } finally {
      setUploading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (isEdit) {
      // No modo edição, apenas nome é obrigatório
      if (!name) {
        toast.error('Nome é obrigatório')
        return
      }
    } else {
      // No modo criação, todos são obrigatórios
      if (!name || !category || !link) {
        toast.error('Nome, categoria e arquivo são obrigatórios')
        return
      }
    }

    setSaving(true)

    try {
      const url = isEdit ? `/api/downloads/${params?.id}` : '/api/downloads'
      const method = isEdit ? 'PUT' : 'POST'

      // No modo edição, envia apenas name e active
      // No modo criação, envia todos os campos
      const bodyData = isEdit
        ? { name, active }
        : { name, category, link, active }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(bodyData),
      })

      if (!response.ok) throw new Error('Erro ao salvar')

      toast.success(isEdit ? 'Download atualizado!' : 'Download criado!')
      router.push('/dash/downloads')
    } catch (error) {
      console.error(error)
      toast.error('Erro ao salvar download')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    try {
      const response = await fetch(`/api/downloads/${params?.id}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (!response.ok) throw new Error('Erro ao deletar')

      toast.success('Download deletado com sucesso!')
      router.push('/dash/downloads')
    } catch (error) {
      console.error(error)
      toast.error('Erro ao deletar download')
    }
  }

  if (loading) {
    return <LoadingSpinner message="Carregando download..." />
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Botão Voltar */}
      <Link
        href="/dash/downloads"
        className="inline-flex items-center gap-2 text-gray-700 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar
      </Link>

      {/* Título */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {isEdit ? 'Editar Download' : 'Novo Download'}
        </h1>
        <p className="text-sm text-gray-600">* Campos obrigatórios</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          {/* Nome */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Nome do Download *
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ex: Relatório de Turismo 2024"
              required
            />
          </div>

          {/* Categoria */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
              Categoria *
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value as DownloadCategory)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              required
              disabled={isEdit}
            >
              <option value="DOWNLOAD">Download</option>
              <option value="OBSERVATORY">Observatório</option>
            </select>
            {isEdit && (
              <p className="text-xs text-gray-500 mt-1">Categoria não pode ser alterada após criação</p>
            )}
          </div>

          {/* Ver no Site (Checkbox) */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="active"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="active" className="text-sm font-medium text-gray-700 cursor-pointer">
              Ver no site
            </label>
          </div>

          {/* Upload de PDF */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Arquivo PDF *
            </label>

            {link ? (
              <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="w-8 h-8 text-red-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{pdfFileName}</p>
                      <p className="text-xs text-gray-500">PDF enviado</p>
                    </div>
                  </div>
                  <a
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                  >
                    Visualizar
                  </a>
                </div>
                {isEdit && (
                  <p className="text-xs text-gray-500 mt-2">Para alterar o arquivo, delete o registro e crie um novo</p>
                )}
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-sm text-gray-600 mb-2">
                  Arraste um arquivo PDF ou clique para selecionar
                </p>
                <p className="text-xs text-gray-500 mb-4">Máximo 10MB</p>
                <label className="inline-block">
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={handlePdfUpload}
                    className="hidden"
                    disabled={uploading || isEdit}
                  />
                  <span className={`px-4 py-2 rounded-lg inline-block ${uploading || isEdit
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
                    } text-white`}>
                    {uploading ? 'Enviando...' : 'Selecionar PDF'}
                  </span>
                </label>
              </div>
            )}
          </div>

        </div>
      </form>

      {/* Botões de ação */}
      <div className="bg-white rounded-lg shadow p-6 mt-6">
        <div className="flex items-center justify-between">
          {isEdit && (
            <button
              type="button"
              onClick={() => setDeleteModalOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-3 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 font-medium"
            >
              <Trash2 className="h-4 w-4" />
              Excluir
            </button>
          )}

          <div className={`flex items-center gap-3 ${!isEdit ? 'ml-auto' : ''}`}>
            <button
              type="button"
              onClick={() => router.push('/dash/downloads')}
              className="px-6 py-3 border border-gray-900 text-gray-900 rounded-lg hover:bg-gray-50 font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving || uploading}
              onClick={handleSubmit}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
            >
              {saving ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Salvar
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Deletar Download"
        message="Tem certeza que deseja deletar este download? Esta ação não pode ser desfeita."
      />
    </div>
  )
}
