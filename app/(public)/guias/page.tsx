"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import FilterBar from "@/components/FilterBar";
// import ListingGrid from "@/components/ListingGrid";
import { Mail, Phone, MapPin, Globe, Instagram, Facebook } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import Pagination from "@/components/Pagination";
import { SectionSkeleton } from "@/components/SectionSkeleton";
import DetailBanner from "@/components/DetailBanner";

interface Guide {
  id: string;
  name: string;
  category: string;
  details?: string;
  images?: string[];
  tags?: Array<{ id: string; name: string; icon?: string }>;
}
interface GuidePageData {
  page: string;
  title: string;
  images: string[];
  details?: string;
}

export default function CredenciadosGuiasPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Busca dados da página common_page GUIDES
  const { data: guidesPage, isLoading: loadingPage } = useQuery({
    queryKey: ["guide-page"],
    queryFn: async () => {
      const res = await fetch("/api/public/common-pages?page=GUIDE");
      if (!res.ok) throw new Error("Erro ao buscar dados da página de guias");
      return res.json();
    },
    staleTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
  });

  // Busca guias (Agency do tipo GUIDE)
  const { data: guides, isLoading: loadingGuides } = useQuery({
    queryKey: ["guides"],
    queryFn: async () => {
      const res = await fetch("/api/public/guides");
      if (!res.ok) throw new Error("Erro ao buscar guias");
      return res.json();
    },
    staleTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
  });

  // Filtro
  let filteredGuides = Array.isArray(guides)
    ? guides.filter((guide) => {
      const matchesSearch = guide.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    })
    : [];

  const totalPages = Math.ceil(filteredGuides.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentGuides = filteredGuides.slice(startIndex, endIndex);

  if (loadingPage || loadingGuides) {
    return (
      <div className="min-h-screen bg-white">
        <SectionSkeleton height={350} />
        <SectionSkeleton height={80} />
        <SectionSkeleton height={400} />
      </div>
    );
  }

  const handleClearFilters = () => {
    setSearchTerm("");
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {guidesPage && (
        <DetailBanner title={guidesPage.title} images={guidesPage.images} details={guidesPage.details} />
      )}

      <FilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        categories={[]}
        selectedCategories={[]}
        districts={[]}
        tags={[]}
        selectedDistricts={[]}
        selectedTags={[]}
        onToggleDistrict={() => { }}
        onToggleTag={() => { }}
        onClearFilters={handleClearFilters}
        showDistrictDropdown={false}
        showTagsDropdown={false}
        onToggleDistrictDropdown={() => { }}
        onToggleTagsDropdown={() => { }}
      />

      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="mb-6 flex items-center justify-between">
            <p className="text-gray-600">
              Mostrando <span className="font-semibold text-gray-900">{currentGuides.length}</span> de{' '}
              <span className="font-semibold text-gray-900">{filteredGuides.length}</span> guias
            </p>
          </div>

          {currentGuides.length === 0 && (
            <div className="text-center text-gray-500 py-12">Nenhum guia encontrado com os filtros selecionados.</div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {currentGuides.map((guide) => (
              <div key={guide.id} className="rounded-xl bg-white shadow-lg p-6 flex flex-col gap-4">
                {guide.images && guide.images.length > 0 ? (
                  <img
                    src={guide.images[0]}
                    alt={guide.name}
                    className="w-full h-48 object-cover rounded-lg mb-2 border"
                  />
                ) : (
                  <div className="w-full h-48 flex items-center justify-center bg-gray-100 text-gray-400 rounded-lg mb-2 border">
                    <span>Sem imagem</span>
                  </div>
                )}
                <h2 className="text-xl font-bold text-gray-900 mb-2">{guide.name}</h2>
                <ul className="space-y-2 text-gray-700 text-base">
                  {guide.credential && (
                    <li className="flex items-center gap-2"><span className="font-semibold">Credencial:</span> {guide.credential}</li>
                  )}
                  {guide.cnpj_cpf && (
                    <li className="flex items-center gap-2"><span className="font-semibold">CNPJ/CPF:</span> {guide.cnpj_cpf}</li>
                  )}
                  {guide.email && (
                    <li className="flex items-center gap-2"><Mail className="w-4 h-4 text-blue-500" /> <a href={`mailto:${guide.email}`} className="underline hover:text-blue-700">{guide.email}</a></li>
                  )}
                  {guide.phone_primary && (
                    <li className="flex items-center gap-2"><Phone className="w-4 h-4 text-blue-500" /> <a href={`tel:${guide.phone_primary}`} className="underline hover:text-blue-700">{guide.phone_primary}</a></li>
                  )}
                  {guide.phone_secondary && (
                    <li className="flex items-center gap-2"><Phone className="w-4 h-4 text-blue-500" /> <a href={`tel:${guide.phone_secondary}`} className="underline hover:text-blue-700">{guide.phone_secondary}</a></li>
                  )}
                  {guide.website && (
                    <li className="flex items-center gap-2"><Globe className="w-4 h-4 text-blue-500" /> <a href={guide.website} target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-700">{guide.website}</a></li>
                  )}
                  {guide.instagram && (
                    <li className="flex items-center gap-2"><Instagram className="w-4 h-4 text-pink-500" /> <a href={guide.instagram} target="_blank" rel="noopener noreferrer" className="underline hover:text-pink-600">{guide.instagram}</a></li>
                  )}
                  {guide.facebook && (
                    <li className="flex items-center gap-2"><Facebook className="w-4 h-4 text-blue-700" /> <a href={guide.facebook} target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-700">{guide.facebook}</a></li>
                  )}
                  {/* Exibir todos os campos extras se existirem */}
                  {guide.address_street && (
                    <li><span className="font-semibold">Rua:</span> {guide.address_street}</li>
                  )}
                  {guide.address_number && (
                    <li><span className="font-semibold">Número:</span> {guide.address_number}</li>
                  )}
                  {guide.address_complement && (
                    <li><span className="font-semibold">Complemento:</span> {guide.address_complement}</li>
                  )}
                  {guide.address_district && (
                    <li><span className="font-semibold">Bairro:</span> {guide.address_district}</li>
                  )}
                </ul>
                {guide.tags && guide.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {guide.tags.map((tag: { id: string; name: string; icon?: string }) => {
                      const Icon = tag.icon && typeof LucideIcons[tag.icon as keyof typeof LucideIcons] === 'function'
                        ? (LucideIcons[tag.icon as keyof typeof LucideIcons] as React.ElementType)
                        : null;
                      return (
                        <span key={tag.id} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium flex items-center gap-1">
                          {Icon ? <Icon className="w-4 h-4 mr-1" /> : null}
                          {tag.name}
                        </span>
                      );
                    })}
                  </div>
                )}
                {guide.details && (
                  <div className="prose max-w-none mt-2" dangerouslySetInnerHTML={{ __html: guide.details }} />
                )}
              </div>
            ))}
          </div>

          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </div>
      </section>
    </div>
  );
}
