"use client";

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import Pagination from '@/components/Pagination';

import FilterBar from '../../../components/FilterBar';
import DetailBanner from '../../../components/DetailBanner';
import { SectionSkeleton } from '../../../components/SectionSkeleton';

interface Event {
  id: string;
  name: string;
  date: string;
  location: string;
  images: string[];
}

export default function CalendarioPage() {
  // Funções para FilterBar
  const handleClearFilters = () => {
    setSearchTerm('');
    setCurrentPage(1);
  };
  // Não há bairros/tags em eventos, então as funções abaixo são dummies
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
  const [sortOption, setSortOption] = useState('name-asc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [searchTerm, setSearchTerm] = useState('');

  // React Query hooks
  const {
    data: banner,
    isLoading: isLoadingBanner,
    isError: isErrorBanner
  } = useQuery({
    queryKey: ['events-banner'],
    queryFn: async () => {
      const res = await fetch('/api/public/common-pages?page=EVENTS');
      if (!res.ok) throw new Error('Erro ao buscar banner');
      const bannerData = await res.json();
      return { title: bannerData.title, details: bannerData.details, images: bannerData.images };
    }
  });

  const {
    data: events = [],
    isLoading: isLoadingEvents,
    isError: isErrorEvents
  } = useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const res = await fetch('/api/public/events');
      if (!res.ok) throw new Error('Erro ao buscar eventos');
      return res.json();
    }
  });

  // Filtro
  interface FilteredEvent {
    id: string;
    name: string;
    date: string;
    location: string;
    images: string[];
  }

  const filteredEvents: FilteredEvent[] = events.filter((event: Event) => {
    const term: string = searchTerm.toLowerCase();
    return (
      event.name.toLowerCase().includes(term) ||
      event.location.toLowerCase().includes(term)
    );
  });

  // Paginação
  const totalPages = Math.max(1, Math.ceil(filteredEvents.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  let sortedEvents = [...filteredEvents];
  if (sortOption === 'name-asc') {
    sortedEvents.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortOption === 'name-desc') {
    sortedEvents.sort((a, b) => b.name.localeCompare(a.name));
  }
  const currentEvents = sortedEvents.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Skeleton loading for progressive UX
  if (isLoadingBanner || isLoadingEvents) {
    return <SectionSkeleton />;
  }

  // Error states
  if (isErrorBanner || isErrorEvents) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="mt-4 text-red-600">Erro ao carregar dados. Tente novamente mais tarde.</p>
        </div>
      </div>
    );
  }

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
              Mostrando <span className="font-semibold text-gray-900">{currentEvents.length}</span> de{' '}
              <span className="font-semibold text-gray-900">{filteredEvents.length}</span> eventos
            </p>
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none md:w-56"
              value={sortOption}
              onChange={e => setSortOption(e.target.value)}
            >
              <option value="name-asc">Nome A-Z</option>
              <option value="name-desc">Nome Z-A</option>
            </select>
          </div>
          {currentEvents.length === 0 ? (
            <div className="text-center text-gray-500 py-12">Nenhum evento encontrado.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {currentEvents.map(event => (
                <a
                  key={event.id}
                  href={`/eventos/${event.id}`}
                  className="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden flex flex-col group focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <div className="relative h-48 w-full">
                    {event.images && event.images.length > 0 ? (
                      <Image src={event.images[0]} alt={event.name} fill className="object-cover group-hover:scale-105 transition-transform duration-200" />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-500 flex items-center justify-center text-white font-bold text-lg">
                        Sem imagem
                      </div>
                    )}
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <h2 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-700 transition">{event.name}</h2>
                    <div className="text-xs text-gray-500 mb-2">{new Date(event.date).toLocaleDateString()} - {event.location}</div>
                  </div>
                </a>
              ))}
            </div>
          )}
          {filteredEvents.length > 0 && (
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={goToPage} />
          )}
        </div>
      </section>
    </div>
  );
}
