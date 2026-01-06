"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import FilterBar from "@/components/FilterBar";
import { Mail, Phone, MapPin, Globe, Instagram, Facebook } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import Pagination from "@/components/Pagination";
import { SectionSkeleton } from "@/components/SectionSkeleton";
import DetailBanner from "@/components/DetailBanner";


export default function AgenciesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Busca dados da página common_page AGENCIES
  const { data: agenciesPage, isLoading: loadingPage } = useQuery({
    queryKey: ["agency-page"],
    queryFn: async () => {
      const res = await fetch("/api/public/common-pages?page=AGENCIES");
      if (!res.ok) throw new Error("Erro ao buscar dados da página de agências");
      return res.json();
    },
    staleTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
  });

  // Busca agências do tipo AGENCY
  const { data: agencies, isLoading: loadingAgencies } = useQuery({
    queryKey: ["agencies"],
    queryFn: async () => {
      const res = await fetch("/api/public/agencies");
      if (!res.ok) throw new Error("Erro ao buscar agências");
      return res.json();
    },
    staleTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
  });



  // Filtro
  let filteredAgencies = Array.isArray(agencies)
    ? agencies.filter((agency) => {
      const matchesSearch = agency.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    })
    : [];

  const totalPages = Math.ceil(filteredAgencies.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentAgencies = filteredAgencies.slice(startIndex, endIndex);

  if (loadingPage || loadingAgencies) {
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
      {agenciesPage && (
        <DetailBanner title={agenciesPage.title} images={agenciesPage.images} details={agenciesPage.details} />
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
              Mostrando <span className="font-semibold text-gray-900">{currentAgencies.length}</span> de{' '}
              <span className="font-semibold text-gray-900">{filteredAgencies.length}</span> agências
            </p>
          </div>


          {currentAgencies.length === 0 && (
            <div className="text-center text-gray-500 py-12">Nenhuma agência encontrada com os filtros selecionados.</div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {currentAgencies.map((agency) => (
              <div key={agency.id} className="rounded-xl bg-white shadow-lg p-6 flex flex-col gap-4">
                {agency.images && agency.images.length > 0 ? (
                  <img
                    src={agency.images[0]}
                    alt={agency.name}
                    className="w-full h-48 object-cover rounded-lg mb-2 border"
                  />
                ) : (
                  <div className="w-full h-48 flex items-center justify-center bg-gray-100 text-gray-400 rounded-lg mb-2 border">
                    <span>Sem imagem</span>
                  </div>
                )}
                <h2 className="text-xl font-bold text-gray-900 mb-2">{agency.name}</h2>
                <ul className="space-y-2 text-gray-700 text-base">
                  {agency.credential && (
                    <li className="flex items-center gap-2"><span className="font-semibold">Credencial:</span> {agency.credential}</li>
                  )}
                  {agency.cnpj_cpf && (
                    <li className="flex items-center gap-2"><span className="font-semibold">CNPJ/CPF:</span> {agency.cnpj_cpf}</li>
                  )}
                  {agency.email && (
                    <li className="flex items-center gap-2"><Mail className="w-4 h-4 text-blue-500" /> <a href={`mailto:${agency.email}`} className="underline hover:text-blue-700">{agency.email}</a></li>
                  )}
                  {agency.phone_primary && (
                    <li className="flex items-center gap-2"><Phone className="w-4 h-4 text-blue-500" /> <a href={`tel:${agency.phone_primary}`} className="underline hover:text-blue-700">{agency.phone_primary}</a></li>
                  )}
                  {agency.phone_secondary && (
                    <li className="flex items-center gap-2"><Phone className="w-4 h-4 text-blue-500" /> <a href={`tel:${agency.phone_secondary}`} className="underline hover:text-blue-700">{agency.phone_secondary}</a></li>
                  )}
                  {agency.website && (
                    <li className="flex items-center gap-2"><Globe className="w-4 h-4 text-blue-500" /> <a href={agency.website} target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-700">{agency.website}</a></li>
                  )}
                  {agency.instagram && (
                    <li className="flex items-center gap-2"><Instagram className="w-4 h-4 text-pink-500" /> <a href={agency.instagram} target="_blank" rel="noopener noreferrer" className="underline hover:text-pink-600">{agency.instagram}</a></li>
                  )}
                  {agency.facebook && (
                    <li className="flex items-center gap-2"><Facebook className="w-4 h-4 text-blue-700" /> <a href={agency.facebook} target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-700">{agency.facebook}</a></li>
                  )}
                  {agency.address_street && (
                    <li><span className="font-semibold">Rua:</span> {agency.address_street}</li>
                  )}
                  {agency.address_number && (
                    <li><span className="font-semibold">Número:</span> {agency.address_number}</li>
                  )}
                  {agency.address_complement && (
                    <li><span className="font-semibold">Complemento:</span> {agency.address_complement}</li>
                  )}
                  {agency.address_district && (
                    <li><span className="font-semibold">Bairro:</span> {agency.address_district}</li>
                  )}
                </ul>
                {agency.tags && agency.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {agency.tags.map((tag: { id: string; name: string; icon?: string }) => {
                      const IconRaw = tag.icon && LucideIcons[tag.icon as keyof typeof LucideIcons];
                      const Icon = typeof IconRaw === 'function' && 'displayName' in IconRaw ? IconRaw : null;
                      return (
                        <span key={tag.id} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium flex items-center gap-1">
                          {Icon ? <Icon className="w-4 h-4 mr-1" /> : null}
                          {tag.name}
                        </span>
                      );
                    })}
                  </div>
                )}
                {agency.details && (
                  <div className="prose max-w-none mt-2" dangerouslySetInnerHTML={{ __html: agency.details }} />
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
