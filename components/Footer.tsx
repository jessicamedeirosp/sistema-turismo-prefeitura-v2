'use client'

import { useEffect, useState } from 'react'
import LGPDCookiePopup from './LGPDCookiePopup'
import * as LucideIcons from 'lucide-react'
import { CommonPageName } from '@prisma/client'
import { getIcon } from '../app/utils/getIcon'

interface SocialMedia {
  id: string
  name: string
  url: string
  icon: string
}


interface CityDepartment {
  id: string
  department: string
  phone: string
  address: string
  website?: string
  email?: string
  hours?: string
  details?: string
}

interface FooterPage {
  id: string
  title: string
  link_externo?: string | null
  page: CommonPageName
}

export default function Footer() {
  // Mapeamento de rotas customizadas para páginas do footer
  const pageSlugMap: Record<string, string> = {
    MARRIAGE: 'case-na-praia',
    PRIVACIDADE: 'politica-privacidade',
    VEHICLE: 'entrada-veiculos',
    USEFULLINFO: 'informacoes-uteis',
    OBSERVATORY: 'observatorio',
    DOWNLOAD: 'download',
    COMTUR: 'comtur',
    CAD_ESTAB: 'auth',
    CAD_GUIA: 'auth',
    GUIDE: 'guias',
    AGENCIES: 'agencias',
    // Adicione outros mapeamentos conforme necessário
  }
  const [socialMedia, setSocialMedia] = useState<SocialMedia[]>([])
  const [departments, setDepartments] = useState<CityDepartment[]>([])
  const [footerPages, setFooterPages] = useState<FooterPage[]>([])

  useEffect(() => {
    fetchFooterData()
    fetchFooterPages()
  }, [])

  const fetchFooterData = async () => {
    try {
      // Buscar redes sociais
      const socialRes = await fetch('/api/public/social-media')
      if (socialRes.ok) {
        const socialData = await socialRes.json()
        setSocialMedia(socialData)
      }

      // Buscar departamentos públicos
      const deptRes = await fetch('/api/public/city-departments')
      if (deptRes.ok) {
        const deptData = await deptRes.json()
        setDepartments(Array.isArray(deptData) ? deptData.slice(0, 3) : [])
      }
    } catch (error) {
      console.error('Error fetching footer data:', error)
    }
  }

  const fetchFooterPages = async () => {
    try {
      const res = await fetch('/api/public/common-pages?only_footer=true')
      if (res.ok) {
        const data = await res.json()
        setFooterPages(data)
      }
    } catch (error) {
      console.error('Error fetching footer pages:', error)
    }
  }

  // Função para retornar o ícone correto baseado no campo 'icon'
  // Usa o nome do ícone salvo no banco, exatamente como na lib lucide-react


  return (
    <>
      <footer className="bg-gray-900 text-white py-12 mt-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">

            <div>
              <h3 className="text-xl font-bold mb-4">Contato</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                {departments.length === 0 && <li>Nenhum contato disponível.</li>}
                {departments.map((dept) => (
                  <li key={dept.id} className="mb-2">
                    <span className="font-semibold text-white">{dept.department}</span><br />
                    {dept.phone && <span className="flex items-center gap-1"><LucideIcons.Phone className="inline w-4 h-4" /> {dept.phone}<br /></span>}
                    {dept.email && <span className="flex items-center gap-1"><LucideIcons.Mail className="inline w-4 h-4" /> {dept.email}<br /></span>}
                    {dept.address && <span className="flex items-center gap-1"><LucideIcons.MapPin className="inline w-4 h-4" /> {dept.address}<br /></span>}
                    {dept.website && (
                      <a href={dept.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1"><LucideIcons.Globe className="inline w-4 h-4" />  Site</a>
                    )}
                    {dept.hours && <span className="flex items-center gap-1"><LucideIcons.Clock className="inline w-4 h-4" />{dept.hours}<br /></span>}
                  </li>
                ))}
              </ul>
              <div className="mt-4">
                <h3 className="text-xl font-bold mb-4">Siga-nos</h3>
                <div className="flex gap-4">
                  {socialMedia.map((social) => {
                    const Icon = getIcon(social.icon)
                    return (
                      <a
                        key={social.id}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-white transition"
                        title={social.name}
                      >
                        <Icon className="w-6 h-6" />
                      </a>
                    )
                  })}
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-4">Páginas</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                {footerPages.length === 0 && <li>Nenhuma página disponível.</li>}
                {footerPages.map(page => (
                  <li key={page.id}>
                    {page.link_externo ? (
                      <a
                        href={page.link_externo}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 transition-colors duration-200 hover:text-blue-200 visited:text-gray-400"
                      >
                        {page.title}
                      </a>
                    ) : (
                      <a
                        href={`/${pageSlugMap[page.page] || page.title.toLowerCase().replace(/ /g, '-')}`}
                        className="flex items-center gap-1 transition-colors duration-200 hover:text-blue-200 visited:text-gray-400"
                      >
                        {page.title}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          {/* Imagens institucionais */}
          <div className="flex justify-center items-center gap-4 my-8">
            <img src="/observatorio-turismo.png" alt="Observatório de Turismo" style={{ height: 80, width: 'auto', maxWidth: '100%' }} />
            <img src="/setur-prefeitura.png" alt="SETUR Prefeitura São Sebastião" style={{ height: 80, width: 'auto', maxWidth: '100%' }} />
          </div>
        </div>
        <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
          © 2025 Portal de Turismo. Todos os direitos reservados. Desenvolvido por <a href="https://www.linkedin.com/in/jessicapoçarli" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Jéssica Medeiros Poçarli</a>
        </div>

      </footer>
      <LGPDCookiePopup />
    </>
  )
}
