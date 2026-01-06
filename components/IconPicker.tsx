'use client'

import { useState } from 'react'
import * as Icons from 'lucide-react'
import { Search, X } from 'lucide-react'

interface IconPickerProps {
  value?: string
  onChange: (iconName: string) => void
  onClear: () => void
}

// Ícones organizados por categoria prioritária
const ICON_CATEGORIES = {
  'Redes Sociais': [
    'Facebook', 'Instagram', 'Twitter', 'Youtube', 'Linkedin', 'Github',
    'MessageCircle', 'Mail', 'Phone', 'Share2', 'Globe', 'Link'
  ],
  'Natureza & Turismo': [
    'Palmtree', 'TreePine', 'Trees', 'Flower2', 'Leaf', 'Mountain', 'MountainSnow',
    'Waves', 'Sun', 'Sunset', 'Sunrise', 'CloudSun', 'CloudRain'
  ],
  'Clima': [
    'Cloud', 'CloudDrizzle', 'CloudFog', 'CloudLightning', 'CloudSnow',
    'Snowflake', 'Wind', 'Rainbow', 'Moon', 'Star', 'Sparkles'
  ],
  'Atividades': [
    'Bike', 'Plane', 'Camera', 'Map', 'MapPin', 'Compass', 'Tent',
    'Backpack', 'Footprints', 'Binoculars', 'Anchor', 'Ship', 'Sailboat'
  ],
  'Alimentação': [
    'Utensils', 'UtensilsCrossed', 'Coffee', 'Wine', 'Beer', 'Pizza',
    'Cake', 'IceCream', 'Soup', 'Egg', 'CookingPot', 'ChefHat'
  ],
  'Acomodação': [
    'Hotel', 'Home', 'Building', 'Building2', 'Warehouse', 'Castle',
    'Church', 'Store', 'Bed', 'BedDouble', 'BedSingle', 'Door'
  ],
  'Outros': [
    'Heart', 'Star', 'Award', 'Gift', 'Trophy', 'Crown', 'Gem',
    'Shield', 'ShieldCheck', 'BadgeCheck', 'Verified', 'Sparkle'
  ],
}

export default function IconPicker({ value, onChange, onClear }: IconPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('Redes Sociais')

  // Filtrar ícones pela busca ou categoria
  const getFilteredIcons = () => {
    if (search) {
      // Buscar em todas as categorias
      const allIcons = Object.values(ICON_CATEGORIES).flat()
      return allIcons.filter(icon =>
        icon.toLowerCase().includes(search.toLowerCase())
      )
    }
    return ICON_CATEGORIES[selectedCategory as keyof typeof ICON_CATEGORIES] || []
  }

  const filteredIcons = getFilteredIcons()

  const handleSelectIcon = (iconName: string) => {
    onChange(iconName)
    setIsOpen(false)
    setSearch('')
  }

  const handleClearIcon = () => {
    onClear()
    setIsOpen(false)
  }

  const SelectedIcon = value && (Icons as any)[value]

  return (
    <div className="relative">
      {/* Campo de seleção */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex-1 flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:border-blue-500 transition"
        >
          {SelectedIcon ? (
            <>
              <SelectedIcon className="w-5 h-5 text-gray-700" />
              <span className="text-gray-900">{value}</span>
            </>
          ) : (
            <span className="text-gray-500">Selecionar ícone (opcional)</span>
          )}
        </button>
        {value && (
          <button
            type="button"
            onClick={handleClearIcon}
            className="px-3 py-2 border border-gray-300 rounded-lg hover:border-red-500 hover:text-red-600 transition"
            title="Limpar ícone"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Modal de seleção */}
      {isOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center"
            onClick={() => setIsOpen(false)}
          >
            {/* Painel centralizado */}
            <div
              className="bg-white rounded-lg shadow-xl border border-gray-200 w-full max-w-3xl max-h-[80vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header com busca */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Selecionar Ícone</h3>
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="text-gray-400 hover:text-gray-600 transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar ícone..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                  />
                </div>
              </div>

              {/* Categorias */}
              {!search && (
                <div className="flex gap-2 p-4 border-b border-gray-200 overflow-x-auto">
                  {Object.keys(ICON_CATEGORIES).map((category) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => setSelectedCategory(category)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition ${selectedCategory === category
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              )}

              {/* Grid de ícones com scroll */}
              <div className="p-6 overflow-y-auto flex-1">
                {filteredIcons.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Search className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                    <p>Nenhum ícone encontrado</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-6 gap-3">
                    {filteredIcons.map((iconName) => {
                      const IconComponent = (Icons as any)[iconName]
                      if (!IconComponent) return null

                      return (
                        <button
                          key={iconName}
                          type="button"
                          onClick={() => handleSelectIcon(iconName)}
                          className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition ${value === iconName
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-200 hover:border-blue-400 hover:bg-blue-50'
                            }`}
                          title={iconName}
                        >
                          <IconComponent className="w-6 h-6 text-gray-700" />
                          <span className="text-xs text-gray-600 text-center break-all line-clamp-1">
                            {iconName}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}