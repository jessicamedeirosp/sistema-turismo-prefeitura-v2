"use client";

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import Pagination from '@/components/Pagination';

import FilterBar from '../../../components/FilterBar';
import DetailBanner from '../../../components/DetailBanner';
import { SectionSkeleton } from '../../../components/SectionSkeleton';

interface News {
  id: string;
  title: string;
  content: string;
  image: string;
  author?: string;
  created_at: string;
}

export default function NoticiasPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState('name-asc');

  // React Query hooks
  const {
    data: banner,
    isLoading: isLoadingBanner,
    isError: isErrorBanner
  } = useQuery({
    queryKey: ['news-banner'],
    queryFn: async () => {
      const res = await fetch('/api/public/common-pages?page=NEWS');
      if (!res.ok) throw new Error('Erro ao buscar banner');
      const bannerData = await res.json();
      return { title: bannerData.title, details: bannerData.details, images: bannerData.images };
    }
  });

  const {
    data: newsList = [],
    isLoading: isLoadingNews,
    isError: isErrorNews
  } = useQuery({
    queryKey: ['news'],
    queryFn: async () => {
      const res = await fetch('/api/public/news');
      if (!res.ok) throw new Error('Erro ao buscar notícias');
      return res.json();
    }
  });
  // FilterBar dummies
  const districts: any[] = [];
  const tags: any[] = [];
  const selectedDistricts: any[] = [];
  const selectedTags: any[] = [];
  const toggleBairro = () => { };
  const toggleTag = () => { };
  const showBairroDropdown = false;
  const showTagsDropdown = false;
  const handleToggleDistrictDropdown = () => { };
  const handleToggleTagsDropdown = () => { };
  const handleClearFilters = () => {
    setSearchTerm('');
    setCurrentPage(1);
  };

  // ...existing code...

  // Filtro
  interface FilteredNews {
    id: string;
    title: string;
    content: string;
    image: string;
    author?: string;
    created_at: string;
  }

  let filteredNews = newsList.filter((news: FilteredNews) => {
    const term = searchTerm.toLowerCase();
    return (
      news.title.toLowerCase().includes(term) ||
      news.content.toLowerCase().includes(term) ||
      (news.author && news.author.toLowerCase().includes(term))
    );
  });
  // Ordenação
  if (sortOption === 'name-asc') {
    filteredNews = [...filteredNews].sort((a, b) => a.title.localeCompare(b.title));
  } else if (sortOption === 'name-desc') {
    filteredNews = [...filteredNews].sort((a, b) => b.title.localeCompare(a.title));
  }
  // Paginação
  const totalPages = Math.max(1, Math.ceil(filteredNews.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentNews = filteredNews.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Skeleton loading for progressive UX
  if (isLoadingBanner || isLoadingNews) {
    return <SectionSkeleton />;
  }

  // Error states
  if (isErrorBanner || isErrorNews) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="mt-4 text-red-600">Erro ao carregar dados. Tente novamente mais tarde.</p>
        </div>
      </div>
    );
  }

  // Função para estimar tempo de leitura (média 200 palavras/min)
  const getReadingTime = (text: string) => {
    const words = text.trim().split(/\s+/).length;
    return Math.max(1, Math.round(words / 200));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {banner && (
        <DetailBanner title={banner.title} images={banner.images} details={banner.details} />
      )}

      <section>
        <div className="mx-auto">
          <div className="mb-8">
            <FilterBar
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              districts={districts}
              tags={tags}
              selectedDistricts={selectedDistricts}
              selectedTags={selectedTags}
              onToggleDistrict={toggleBairro}
              onToggleTag={toggleTag}
              onClearFilters={handleClearFilters}
              showDistrictDropdown={showBairroDropdown}
              showTagsDropdown={showTagsDropdown}
              onToggleDistrictDropdown={handleToggleDistrictDropdown}
              onToggleTagsDropdown={handleToggleTagsDropdown}
            />
          </div>
        </div>
        <div className="container mx-auto px-4">
          <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <p className="text-gray-600">
              Mostrando <span className="font-semibold text-gray-900">{currentNews.length}</span> de{' '}
              <span className="font-semibold text-gray-900">{filteredNews.length}</span> notícias
            </p>
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none md:w-56"
              value={sortOption}
              onChange={e => setSortOption(e.target.value)}
            >

              <option value="name-asc">Título A-Z</option>
              <option value="name-desc">Título Z-A</option>
            </select>
          </div>
          {currentNews.length === 0 ? (
            <div className="text-center text-gray-500 py-12">Nenhuma notícia encontrada.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {currentNews.map((news: any) => (
                <a
                  key={news.id}
                  href={`/noticias/${news.id}`}
                  className="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden flex flex-col group focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <div className="relative h-48 w-full">
                    {news.image ? (
                      <Image src={news.image} alt={news.title} fill className="object-cover group-hover:scale-105 transition-transform duration-200" />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-500 flex items-center justify-center text-white font-bold text-lg">
                        Sem imagem
                      </div>
                    )}
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <h2 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-700 transition">{news.title}</h2>
                    <div className="text-xs text-gray-500 mt-auto flex items-center gap-2">
                      {news.author ? `Por ${news.author}` : ''} {new Date(news.created_at).toLocaleDateString()}
                      <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 rounded-full">{getReadingTime(news.content)} min leitura</span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}
          {filteredNews.length > 0 && (
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={goToPage} />
          )}
        </div>
      </section>
    </div>
  );
}
