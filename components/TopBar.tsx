import * as LucideIcons from 'lucide-react'
import Image from 'next/image'
import { Lang } from './Lang'

interface SocialMedia {
  id: string
  name: string
  url: string
  icon: string
}

interface TopBarProps {
  socialMedia: SocialMedia[]
}

export default function TopBar({ socialMedia }: TopBarProps) {
  // Usa o nome do ícone salvo no banco, exatamente como na lib lucide-react
  // Função para retornar o ícone correto baseado no campo 'icon'
  // Usa o nome do ícone salvo no banco, exatamente como na lib lucide-react
  const getSocialIcon = (icon: string) => {
    if (icon in LucideIcons) {
      return LucideIcons[icon as keyof typeof LucideIcons] as React.ElementType
    }
    return LucideIcons['Globe'] as React.ElementType
  }

  return (
    <div className="bg-blue-900 text-white py-2">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between text-sm">
          {/* Redes Sociais - Esquerda */}
          <div className="flex items-center gap-3">
            {socialMedia.map((social) => {
              const Icon = getSocialIcon(social.icon)
              return (
                <a
                  key={social.id}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blue-300 transition"
                  title={social.name}
                >
                  <Icon className="w-4 h-4" />
                </a>
              )
            })}
          </div>

          {/* Seletor de Idiomas - Direita */}
          <Lang lang={typeof window !== 'undefined' ? (window?.location?.pathname?.split('/')[1] || 'pt') : 'pt'} />
        </div>
      </div>
    </div>
  )
}
