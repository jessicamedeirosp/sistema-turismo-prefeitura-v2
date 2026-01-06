import ListingCard from './ListingCard'

interface Listing {
  id: string
  name: string
  district: string
  images: string[]
  details?: string
  tags?: Array<{ id: string; name: string; icon?: string }>
}

interface ListingGridProps {
  items: Listing[]
  filteredCount: number
  onClearFilters: () => void
  emptyLabel?: string
  hrefBase?: string
}

export default function ListingGrid({ items, filteredCount, onClearFilters, emptyLabel, hrefBase }: ListingGridProps) {
  if (items.length === 0 && filteredCount === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">{emptyLabel || 'Nenhum item encontrado com os filtros selecionados.'}</p>
        <button
          onClick={onClearFilters}
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Limpar Filtros
        </button>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {items.map((item) => (
        <ListingCard
          key={item.id}
          id={item.id}
          name={item.name}
          district={item.district}
          images={item.images}
          tags={item.tags}
          hrefBase={hrefBase}
        />
      ))}
    </div>
  )
}