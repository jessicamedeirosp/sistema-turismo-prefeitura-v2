import { Search, MapPin, ChevronDown } from 'lucide-react'
import { getIcon } from '../app/utils/getIcon'

interface District {
  id: string
  name: string
}

interface Tag {
  id: string
  name: string
  icon: string | null
}

interface Category {
  id: string
  name: string
}

interface FilterBarProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  districts: District[]
  tags: Tag[]
  categories?: Category[]
  selectedDistricts: string[]
  selectedTags: string[]
  selectedCategories?: string[]
  onToggleDistrict: (district: string) => void
  onToggleTag: (tag: string) => void
  onToggleCategory?: (category: string) => void
  onClearFilters: () => void
  showDistrictDropdown: boolean
  showTagsDropdown: boolean
  showCategoryDropdown?: boolean
  onToggleDistrictDropdown: () => void
  onToggleTagsDropdown: () => void
  onToggleCategoryDropdown?: () => void
}

export default function FilterBar({
  searchTerm,
  onSearchChange,
  districts,
  tags,
  categories = [],
  selectedDistricts,
  selectedTags,
  selectedCategories = [],
  onToggleDistrict,
  onToggleTag,
  onToggleCategory = () => { },
  onClearFilters,
  showDistrictDropdown,
  showTagsDropdown,
  showCategoryDropdown = false,
  onToggleDistrictDropdown,
  onToggleTagsDropdown,
  onToggleCategoryDropdown = () => { },
}: FilterBarProps) {
  const hasActiveFilters = selectedDistricts.length > 0 || selectedTags.length > 0 || searchTerm

  // De/para para nomes amigáveis das categorias
  const categoryLabels: Record<string, string> = {
    EMERGENCY: 'Emergência',
    USEFUL: 'Informações',
    SERVICES: 'Serviços',
  }

  return (
    <section className="bg-white border-b border-gray-200 sticky top-[72px] z-40 shadow-sm">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          {/* Busca */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          {/* Filtro por Categoria */}
          {categories.length > 0 && (
            <div className="relative w-full md:w-64">
              <button
                onClick={onToggleCategoryDropdown}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition flex items-center justify-between"
              >
                <span className="flex items-center gap-2 text-gray-700">
                  {selectedCategories.length === 0
                    ? 'Todas as Categorias'
                    : `${selectedCategories.length} selecionada(s)`}
                </span>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </button>
              {showCategoryDropdown && (
                <div className="absolute top-full mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
                  {categories.map((category) => (
                    <label
                      key={category.id}
                      className="flex items-center px-4 py-3 hover:bg-blue-50 transition cursor-pointer border-b border-gray-100 last:border-b-0"
                    >
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category.name)}
                        onChange={() => onToggleCategory(category.name)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-3"
                      />
                      <span className="text-gray-700">{categoryLabels[category.name] || category.name}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Filtro por Bairro */}
          {districts.length > 0 && (
            <div className="relative w-full md:w-64">
              <button
                onClick={onToggleDistrictDropdown}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition flex items-center justify-between"
              >
                <span className="flex items-center gap-2 text-gray-700">
                  <MapPin className="w-4 h-4" />
                  {selectedDistricts.length === 0
                    ? 'Todos os Bairros'
                    : `${selectedDistricts.length} selecionado(s)`}
                </span>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </button>
              {showDistrictDropdown && (
                <div className="absolute top-full mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
                  {districts.map((district) => (
                    <label
                      key={district.id}
                      className="flex items-center px-4 py-3 hover:bg-blue-50 transition cursor-pointer border-b border-gray-100 last:border-b-0"
                    >
                      <input
                        type="checkbox"
                        checked={selectedDistricts.includes(district.name)}
                        onChange={() => onToggleDistrict(district.name)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-3"
                      />
                      <span className="text-gray-700">{district.name}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Filtro por Tags */}
          {tags.length > 0 && (
            <div className="relative w-full md:w-64">
              <button
                onClick={onToggleTagsDropdown}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition flex items-center justify-between"
              >
                <span className="text-gray-700">
                  {selectedTags.length === 0 ? 'Todas as Tags' : `${selectedTags.length} selecionada(s)`}
                </span>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </button>
              {showTagsDropdown && (
                <div className="absolute top-full mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
                  {/* Cabeçalho da lista de tags */}
                  <div className="flex px-4 py-2 text-xs text-gray-500 font-semibold border-b border-gray-100">
                    <span>Tags</span>
                  </div>
                  {tags.map((tag) => {
                    const Icon = getIcon(tag.icon || '')
                    return (
                      <label
                        key={tag.id}
                        className="flex items-center px-4 py-3 hover:bg-blue-50 transition cursor-pointer border-b border-gray-100 last:border-b-0"
                      >
                        <input
                          type="checkbox"
                          checked={selectedTags.includes(tag.name)}
                          onChange={() => onToggleTag(tag.name)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-3"
                        />
                        <span className="w-6 mr-2 flex items-center justify-center">
                          {Icon ? <Icon className="w-4 h-4 text-gray-500" /> : null}
                        </span>
                        <span className="text-gray-700">{tag.name}</span>
                      </label>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Limpar Filtros */}
          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="px-6 py-3 text-blue-600 hover:text-blue-700 font-medium whitespace-nowrap"
            >
              Limpar Filtros
            </button>
          )}
        </div>

        {/* Bairros Selecionados */}
        {districts.length > 0 && selectedDistricts.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            <span className="text-sm text-gray-600 font-medium mr-2">Bairros:</span>
            {selectedDistricts.map((district) => (
              <span
                key={district}
                className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium"
              >
                {district}
                <button onClick={() => onToggleDistrict(district)} className="hover:text-green-900">
                  ×
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Tags Selecionadas */}
        {tags.length > 0 && selectedTags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            <span className="text-sm text-gray-600 font-medium mr-2">Tags:</span>
            {selectedTags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
              >
                {tag}
                <button onClick={() => onToggleTag(tag)} className="hover:text-blue-900">
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
