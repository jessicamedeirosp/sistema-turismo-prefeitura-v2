import Link from 'next/link'
import Image from 'next/image'
import { MapPin } from 'lucide-react'
import * as LucideIcons from 'lucide-react'
import { getIcon } from '../app/utils/getIcon'

interface ListingCardProps {
  id: string
  name: string
  district: string
  images: string[]
  tags?: Array<{ id: string; name: string; icon?: string }>
  hrefBase?: string // permite customizar a rota base
}

export default function ListingCard({ id, name, district, images, tags, hrefBase = '/praias' }: ListingCardProps) {
  return (
    <Link
      href={`${hrefBase}/${id}`}
      className="group cursor-pointer bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all"
    >
      <div className="relative h-56 bg-gradient-to-br from-cyan-400 to-blue-500 overflow-hidden">
        {images && images.length > 0 ? (
          <Image
            src={images[0]}
            alt={name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-blue-500" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-5 group-hover:from-black/70 transition-all">
          <div className="text-white w-full">
            <h3 className="text-xl font-bold mb-1 transform group-hover:translate-y-[-4px] transition-transform">
              {name}
            </h3>
            {/* Tags em cima da imagem, abaixo do título */}
            {tags && tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {tags.map((tag) => {
                  const Icon = getIcon(tag.icon || '')
                  return (
                    <span
                      key={tag.id}
                      className="px-2 py-1 bg-blue-50/80 text-blue-700 rounded text-xs font-medium flex items-center gap-1"
                    >
                      {Icon ? <Icon className="w-4 h-4 mr-1" /> : null}
                      {tag.name}
                    </span>
                  );
                })}
              </div>
            )}
            {district && (
              <p className="text-sm text-white/90 flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {district}
              </p>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
