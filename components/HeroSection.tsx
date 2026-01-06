import Image from 'next/image'

interface HeroSectionProps {
  title: string
  description?: string
  image?: string
  totalCount?: number
}

export default function HeroSection({ title, description, image, totalCount }: HeroSectionProps) {
  return (
    <section className="relative h-[40vh] overflow-hidden">
      <div className="absolute inset-0">
        {image ? (
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-500" />
        )}
        <div className="absolute inset-0 bg-black/40"></div>
      </div>
      <div className="relative container mx-auto px-4 h-full flex items-center justify-center">
        <div className="max-w-3xl mx-auto text-center text-white">
          <h1 className="text-5xl font-bold mb-4">{title}</h1>
          {description ? (
            <div
              className="text-xl text-white/90"
              dangerouslySetInnerHTML={{ __html: description }}
            />
          ) : totalCount !== undefined ? (
            <p className="text-xl text-white/90">
              Explore {totalCount > 0 ? `as ${totalCount}` : 'as'} praias paradíasíacas de São Sebastião
            </p>
          ) : null}
        </div>
      </div>
    </section>
  )
}
