'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, X } from 'lucide-react'

interface DistrictSelectProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

interface District {
  id: string
  name: string
  active: boolean
}

export default function DistrictSelect({
  value,
  onChange,
  placeholder = 'Digite ou selecione um bairro',
  className = '',
}: DistrictSelectProps) {
  const [districts, setDistricts] = useState<District[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState(value || '')
  const [loading, setLoading] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  // Buscar bairros ativos da API
  useEffect(() => {
    fetchDistricts()
  }, [])

  // Atualizar search quando value mudar externamente
  useEffect(() => {
    setSearch(value || '')
  }, [value])

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const fetchDistricts = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/districts')
      if (response.ok) {
        const data = await response.json()
        setDistricts(data)
      }
    } catch (error) {
      console.error('Erro ao buscar bairros:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filtrar bairros baseado na busca
  const filteredDistricts = districts.filter((district) =>
    district.name.toLowerCase().includes(search.toLowerCase())
  )

  const handleSelect = (districtName: string) => {
    setSearch(districtName)
    onChange(districtName)
    setIsOpen(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setSearch(newValue)
    onChange(newValue)
    setIsOpen(true)
  }

  const handleClear = () => {
    setSearch('')
    onChange('')
    setIsOpen(false)
  }

  const handleFocus = () => {
    setIsOpen(true)
  }

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      {/* Campo de entrada */}
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        <input
          type="text"
          value={search}
          onChange={handleInputChange}
          onFocus={handleFocus}
          placeholder={placeholder}
          className="block w-full rounded-md border border-gray-300 py-2 pl-10 pr-10 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
        />
        {search && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute inset-y-0 right-0 flex items-center pr-3 hover:text-gray-600"
          >
            <X className="h-4 w-4 text-gray-400" />
          </button>
        )}
      </div>

      {/* Dropdown de sugestões */}
      {isOpen && (
        <div className="absolute z-10 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg">
          {loading ? (
            <div className="px-4 py-3 text-sm text-gray-500">
              Carregando bairros...
            </div>
          ) : filteredDistricts.length > 0 ? (
            <ul className="max-h-60 overflow-auto py-1">
              {filteredDistricts.map((district) => (
                <li key={district.id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(district.name)}
                    className="block w-full px-4 py-2 text-left text-sm hover:bg-blue-50 focus:bg-blue-50 focus:outline-none"
                  >
                    {district.name}
                  </button>
                </li>
              ))}
            </ul>
          ) : search.length > 0 ? (
            <div className="px-4 py-3 text-sm text-gray-500">
              <p className="font-medium">Nenhum bairro encontrado</p>
              <p className="mt-1 text-xs">
                Você pode continuar digitando e usar &quot;{search}&quot; como bairro
              </p>
            </div>
          ) : (
            <div className="px-4 py-3 text-sm text-gray-500">
              Digite para buscar ou adicionar um bairro
            </div>
          )}
        </div>
      )}

      {/* Indicador de texto customizado */}
      {search && !districts.some((d) => d.name === search) && (
        <p className="mt-1 text-xs text-gray-500">
          <span className="font-medium">&quot;{search}&quot;</span> será salvo como bairro customizado
        </p>
      )}
    </div>
  )
}
