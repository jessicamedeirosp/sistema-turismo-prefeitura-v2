"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import PublicHeader from '@/components/PublicHeader';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination as SwiperPagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import DetailBanner from '../../../../components/DetailBanner';

interface Event {
  id: string;
  name: string;
  date: string;
  location: string;
  details?: string;
  images: string[];
}

export default function EventoDetalhePage() {
  const params = useParams();
  const id = typeof window !== 'undefined' ? (params?.id as string) : undefined;
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchEvent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchEvent = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/public/events/${id}`);
      if (res.ok) {
        const data = await res.json();
        setEvent(data);
      }
    } catch (error) {
      setEvent(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !id) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Carregando evento...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-gray-600">Evento não encontrado.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="container mx-auto px-4 py-10 max-w-3xl">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">{event.name}</h1>
        <div className="text-xs text-gray-500 mb-6">{new Date(event.date).toLocaleDateString()} - {event.location}</div>
        {event && (
          <DetailBanner title={event.name} images={event.images} details={event.details} />
        )}

        {event.details && (
          <div className="prose max-w-none text-gray-800" dangerouslySetInnerHTML={{ __html: event.details }} />
        )}
      </section>
    </div>
  );
}
