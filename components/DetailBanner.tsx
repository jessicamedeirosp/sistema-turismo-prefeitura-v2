import Image from 'next/image'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination as SwiperPagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import React from 'react'

interface DetailBannerProps {
  title: string
  images?: string[]
  children?: React.ReactNode // For description/details
  gradientClass?: string // Optional: override default gradient
  details?: string
}

const DetailBanner: React.FC<DetailBannerProps> = ({ title, details, images, children, gradientClass }) => {
  return (
    <section className="relative h-72 md:h-96 w-full flex items-center justify-center">
      {images && images.length > 0 ? (
        <Swiper
          className="h-full w-full"
          slidesPerView={1}
          spaceBetween={16}
          pagination={{ clickable: true }}
          navigation
          modules={[Navigation, SwiperPagination]}
        >
          {images.map((img, idx) => (
            <SwiperSlide key={idx}>
              <div className="relative h-72 md:h-96 w-full z-0">
                <Image src={img} alt={title} fill className="object-cover" />
                <div className="absolute inset-0 bg-black/50" />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      ) : (
        <div className={`absolute inset-0 ${gradientClass || 'bg-gradient-to-r from-blue-600 to-cyan-500'}`} />
      )}
      {(title || details) && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
          <div className="p-6 rounded-lg text-white text-center max-w-2xl mx-auto">
            {title && <h1 className="text-4xl md:text-5xl font-bold mb-2">{title}</h1>}
            {details && <p className="text-base md:text-lg" dangerouslySetInnerHTML={{ __html: details }} />}
          </div>
        </div>
      )}

      {children && (
        <div className="absolute bottom-0 left-0 w-full z-20">
          {children}
        </div>
      )}
    </section>
  )
}

export default DetailBanner
