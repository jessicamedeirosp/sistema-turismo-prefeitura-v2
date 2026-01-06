"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import PublicHeader from '@/components/PublicHeader';
import Image from 'next/image';

interface News {
  id: string;
  title: string;
  content: string;
  image: string;
  author?: string;
  created_at: string;
}

export default function NoticiaDetalhePage() {
  const params = useParams();
  const id = typeof window !== 'undefined' ? (params?.id as string) : undefined;
  const [news, setNews] = useState<News | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchNews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchNews = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/public/news/${id}`);
      if (res.ok) {
        const data = await res.json();
        setNews(data);
      }
    } catch (error) {
      setNews(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !id) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Carregando notícia...</p>
        </div>
      </div>
    );
  }

  if (!news) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-gray-600">Notícia não encontrada.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="container mx-auto px-4 py-10 max-w-3xl">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">{news.title}</h1>
        <div className="text-xs text-gray-500 mb-6">{news.author ? `Por ${news.author}` : ''} {new Date(news.created_at).toLocaleDateString()}</div>
        {news.image && (
          <div className="relative w-full h-64 mb-8">
            <Image src={news.image} alt={news.title} fill className="object-cover rounded-lg" />
          </div>
        )}
        <div className="prose max-w-none text-gray-800" dangerouslySetInnerHTML={{ __html: news.content }} />
      </section>
    </div>
  );
}
