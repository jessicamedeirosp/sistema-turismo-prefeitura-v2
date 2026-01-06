"use client";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { SectionSkeleton } from "@/components/SectionSkeleton";
import DetailBanner from "@/components/DetailBanner";
import { Mail, Phone, Globe, Instagram, Facebook } from "lucide-react";

export default function OndeFicarDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const { data, isLoading } = useQuery({
    queryKey: ["onde-ficar-detail", id],
    queryFn: async () => {
      const res = await fetch(`/api/public/onde-ficar/${id}`);
      if (!res.ok) throw new Error("Erro ao buscar detalhes do local");
      return res.json();
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
  });

  if (isLoading) {
    return <SectionSkeleton height={600} />;
  }

  if (!data) {
    return <div className="text-center py-12 text-gray-500">Local não encontrado.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DetailBanner title={data.name} images={data.images} details={""} />
      <section className="container mx-auto px-4 py-10 max-w-3xl">
        <div className="mb-6">
          <h1 className="text-4xl md:text-5xl font-bold mb-2 text-gray-900">{data.name}</h1>
          {data.details && (
            <div className="prose max-w-none text-lg text-gray-700" dangerouslySetInnerHTML={{ __html: data.details }} />
          )}
        </div>
        <ul className="space-y-2 text-gray-700 text-base mb-4">
          {data.email && (
            <li className="flex items-center gap-2"><Mail className="w-4 h-4 text-blue-500" /> <a href={`mailto:${data.email}`} className="underline hover:text-blue-700">{data.email}</a></li>
          )}
          {data.phone && (
            <li className="flex items-center gap-2"><Phone className="w-4 h-4 text-blue-500" /> <a href={`tel:${data.phone}`} className="underline hover:text-blue-700">{data.phone}</a></li>
          )}
          {data.website && (
            <li className="flex items-center gap-2"><Globe className="w-4 h-4 text-blue-500" /> <a href={data.website} target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-700">{data.website}</a></li>
          )}
          {data.instagram && (
            <li className="flex items-center gap-2"><Instagram className="w-4 h-4 text-pink-500" /> <a href={data.instagram} target="_blank" rel="noopener noreferrer" className="underline hover:text-pink-600">{data.instagram}</a></li>
          )}
          {data.facebook && (
            <li className="flex items-center gap-2"><Facebook className="w-4 h-4 text-blue-700" /> <a href={data.facebook} target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-700">{data.facebook}</a></li>
          )}
        </ul>
      </section>
    </div>
  );
}
