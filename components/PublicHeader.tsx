'use client'

import { useEffect, useState } from 'react'
import TopBar from './TopBar'
import MainHeader from './MainHeader'

interface SocialMedia {
  id: string
  name: string
  url: string
  icon: string
}

interface MenuItem {
  page: string
  title: string
}

interface PublicHeaderProps {
  showBackButton?: boolean
}

export default function PublicHeader({ showBackButton = false }: PublicHeaderProps) {
  const [socialMedia, setSocialMedia] = useState<SocialMedia[]>([])
  const [menuPages, setMenuPages] = useState<MenuItem[]>([])

  useEffect(() => {
    fetchHeaderData()
  }, [])

  const fetchHeaderData = async () => {
    try {
      // Buscar redes sociais
      const socialRes = await fetch('/api/public/social-media')
      if (socialRes.ok) {
        const socialData = await socialRes.json()
        setSocialMedia(socialData)
      }

      // Buscar páginas do menu (apenas as visíveis no header)
      const pagesRes = await fetch('/api/public/common-pages?visible_header=true')
      if (pagesRes.ok) {
        let pagesData = await pagesRes.json()
        // HOME sempre primeiro, o resto em ordem alfabética
        pagesData = pagesData.sort((a: MenuItem, b: MenuItem) => {
          if (a.page === 'HOME') return -1
          if (b.page === 'HOME') return 1
          return a.title.localeCompare(b.title, 'pt-BR')
        })
        setMenuPages(pagesData)
      }
    } catch (error) {
      console.error('Error fetching header data:', error)
    }
  }

  if (showBackButton) {
    return (
      <>
        <TopBar socialMedia={socialMedia} />
        <header className="bg-white shadow-sm sticky top-0 z-50">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between py-3">
              <a href="/" className="flex items-center">
                <img
                  src="/logo-menu.png"
                  alt="São Sebastião Turismo"
                  className="h-16 w-auto"
                />
              </a>
              <a
                href="/"
                className="text-gray-600 hover:text-blue-600 transition text-sm font-medium"
              >
                ← Voltar ao Início
              </a>
            </div>
          </div>
        </header>
      </>
    )
  }

  return (
    <>
      <TopBar socialMedia={socialMedia} />
      <MainHeader menuPages={menuPages} />
    </>
  )
}
