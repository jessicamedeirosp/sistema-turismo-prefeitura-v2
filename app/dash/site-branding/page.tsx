'use client'

import { useEffect, useRef, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Image as ImageIcon, Save } from 'lucide-react'
import { toast } from 'sonner'
import ImageUpload from '@/components/ImageUpload'

type SiteBranding = {
  id: string
  header_logo: string
  header_logo_in_footer: boolean
  footer_images: string[]
}

const DEFAULTS = {
  header_logo: '/logo-menu.png',
  header_logo_in_footer: false,
  footer_images: ['/observatorio-turismo.png', '/setur-prefeitura.png'],
}

export default function SiteBrandingPage() {
  const { status } = useSession()
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingHeaderLogo, setUploadingHeaderLogo] = useState(false)
  const [uploadingFooterImages, setUploadingFooterImages] = useState(false)
  const [brandingId, setBrandingId] = useState<string | null>(null)
  // Logo opcional: quando vazio, o site usa /logo-menu.png
  const [headerLogo, setHeaderLogo] = useState<string>('')
  const [headerLogoInFooter, setHeaderLogoInFooter] = useState<boolean>(DEFAULTS.header_logo_in_footer)
  const [footerImages, setFooterImages] = useState<string[]>(DEFAULTS.footer_images)
  const lastSavedHeaderLogoRef = useRef<string | null>(null)
  const pendingAutoSaveRef = useRef(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth')
      return
    }
    if (status === 'authenticated') {
      fetchBranding()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status])

  const fetchBranding = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/site-branding', { credentials: 'include' })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.error || 'Erro ao carregar branding')
      }
      const data = (await res.json()) as SiteBranding
      setBrandingId(data.id)
      // Se vier igual ao default, tratamos como "sem logo personalizada"
      const incomingHeaderLogo = data.header_logo && data.header_logo !== DEFAULTS.header_logo ? data.header_logo : ''
      setHeaderLogo(incomingHeaderLogo)
      lastSavedHeaderLogoRef.current = incomingHeaderLogo
      setHeaderLogoInFooter(!!data.header_logo_in_footer)
      setFooterImages(Array.isArray(data.footer_images) ? data.footer_images : DEFAULTS.footer_images)
    } catch (err: any) {
      console.error(err)
      toast.error(err?.message || 'Erro ao carregar branding')
      setBrandingId(null)
      setHeaderLogo('')
      lastSavedHeaderLogoRef.current = ''
      setHeaderLogoInFooter(DEFAULTS.header_logo_in_footer)
      setFooterImages(DEFAULTS.footer_images)
    } finally {
      setLoading(false)
    }
  }

  const saveHeaderLogoNow = async (nextLogo: string) => {
    try {
      const res = await fetch('/api/site-branding', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ header_logo: nextLogo }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.error || 'Erro ao salvar logo do header')
      }

      const updated = (await res.json()) as SiteBranding
      // Se o backend retornou default, refletimos como "sem logo personalizada"
      const normalized = updated.header_logo && updated.header_logo !== DEFAULTS.header_logo ? updated.header_logo : ''
      setHeaderLogo(normalized)
      lastSavedHeaderLogoRef.current = normalized
      router.refresh()
      toast.success('Logo do header salva!')
    } catch (err: any) {
      toast.error(err?.message || 'Erro ao salvar logo do header')
    }
  }

  // Auto-save: terminou upload e a logo mudou → salva no banco
  useEffect(() => {
    if (loading) return
    if (uploadingHeaderLogo) return
    if (!pendingAutoSaveRef.current) return

    pendingAutoSaveRef.current = false

    const current = headerLogo || ''
    const lastSaved = lastSavedHeaderLogoRef.current ?? ''
    if (current === lastSaved) return

    saveHeaderLogoNow(current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uploadingHeaderLogo, headerLogo, loading])

  const handleSave = async () => {
    if (uploadingHeaderLogo || uploadingFooterImages) {
      toast.error('Aguarde o upload das imagens terminar para salvar.')
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/site-branding', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          header_logo: headerLogo,
          header_logo_in_footer: headerLogoInFooter,
          footer_images: footerImages,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.error || 'Erro ao salvar branding')
      }

      const updated = (await res.json()) as SiteBranding
      setBrandingId(updated.id || brandingId)
      toast.success('Branding atualizado com sucesso!')
      router.refresh()
    } catch (err: any) {
      toast.error(err?.message || 'Erro ao salvar branding')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-600">Carregando...</p>
          </div>
        </div>
      </div>
    )
  }

  const headerLogoArray = headerLogo ? [headerLogo] : []

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Branding do Site</h1>
        <p className="text-sm text-gray-600 mt-1">
          Configure a logo do header e as imagens exibidas no rodapé. **Altura ideal das imagens: 80px**.
        </p>
      </div>

      <div className="space-y-6">
        {/* Logo do Header */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-2 mb-4">
            <ImageIcon className="w-5 h-5" />
            <h2 className="text-lg font-bold text-gray-900">Logo do Header</h2>
          </div>

          <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded text-gray-700 text-sm">
            {headerLogo
              ? 'Logo personalizada definida.'
              : `Sem logo personalizada (o site usa ${DEFAULTS.header_logo}).`}
          </div>

          <ImageUpload
            images={headerLogoArray}
            onImagesChange={(imgs) => {
              const next = Array.isArray(imgs) && imgs.length > 0 ? imgs[imgs.length - 1] : ''
              setHeaderLogo(next)
              pendingAutoSaveRef.current = true
            }}
            maxImages={1}
            title="Logo"
            description="Recomendação: altura ideal 80px (o site ajusta automaticamente a largura)."
            onUploadingChange={setUploadingHeaderLogo}
          />

          {headerLogo && (
            <div className="mt-4">
              <button
                type="button"
                onClick={() => {
                  setHeaderLogo('')
                  pendingAutoSaveRef.current = true
                }}
                className="px-4 py-2 border border-gray-900 text-gray-900 rounded-lg hover:bg-gray-50 transition"
              >
                Remover logo personalizada (voltar ao padrão)
              </button>
            </div>
          )}

          <div className="mt-4 flex items-center gap-2">
            <input
              id="headerLogoInFooter"
              type="checkbox"
              checked={headerLogoInFooter}
              onChange={(e) => setHeaderLogoInFooter(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="headerLogoInFooter" className="text-sm font-medium text-gray-700">
              Exibir esta logo também no rodapé
            </label>
          </div>
        </div>

        {/* Imagens do Rodapé */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-2 mb-4">
            <ImageIcon className="w-5 h-5" />
            <h2 className="text-lg font-bold text-gray-900">Imagens do Rodapé</h2>
          </div>

          <ImageUpload
            images={footerImages}
            onImagesChange={setFooterImages}
            maxImages={10}
            title="Imagens institucionais"
            description="As imagens são exibidas no rodapé do site. Recomendação: altura ideal 80px."
            onUploadingChange={setUploadingFooterImages}
          />
        </div>

        {/* Ações */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || uploadingHeaderLogo || uploadingFooterImages}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              {uploadingHeaderLogo || uploadingFooterImages
                ? 'Aguardando upload...'
                : saving
                  ? 'Salvando...'
                  : 'Salvar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

