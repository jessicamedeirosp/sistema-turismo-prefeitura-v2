interface VideoHeroProps {
  videoUrl?: string
}

export default function VideoHero({ videoUrl }: VideoHeroProps) {
  const getYouTubeEmbedUrl = (url: string) => {
    if (!url) return ''
    // Se já é uma URL embed, retorna como está
    if (url.includes('/embed/')) return url
    // Converte URL padrão do YouTube para embed
    const videoIdMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/)
    if (videoIdMatch && videoIdMatch[1]) {
      return `https://www.youtube.com/embed/${videoIdMatch[1]}`
    }
    return url
  }

  return (
    <section className="relative h-[85vh] overflow-hidden">
      {/* Vídeo de fundo */}
      <div className="absolute inset-0">
        {videoUrl && (
          <iframe
            src={`${getYouTubeEmbedUrl(videoUrl)}?autoplay=1&mute=1&controls=0&showinfo=0&loop=1&modestbranding=1&rel=0&fs=0&disablekb=1`}
            className="w-full h-full object-cover pointer-events-none"
            style={{
              width: '100vw',
              height: '100vh',
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%) scale(1.5)',
              border: 'none',
            }}
            allow="autoplay; encrypted-media"
            title="Video Hero"
          />
        )}
        {/* Overlay sutil */}
        <div className="absolute inset-0 bg-black/20"></div>
      </div>
    </section>
  )
}
