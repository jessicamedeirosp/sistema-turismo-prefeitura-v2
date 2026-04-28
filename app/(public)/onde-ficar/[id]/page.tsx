"use client";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { SectionSkeleton } from "@/components/SectionSkeleton";
import DetailBanner from "@/components/DetailBanner";
import * as lucideIcons from 'lucide-react'
import { Mail, Phone, Globe, Instagram, Facebook, MapPin, MessageCircle } from "lucide-react";

function buildAddress(data: any) {
  const parts = [
    [data.address_street, data.address_number].filter(Boolean).join(', '),
    data.address_complement ? ` - ${data.address_complement}` : '',
  ]
    .join('')
    .trim()

  const district = data.address_district ? `, ${data.address_district}` : ''
  return `${parts}${district}`.trim()
}

function onlyDigits(value: string) {
  return (value || '').replace(/\D/g, '')
}

function buildWhatsappLink(phone: string, text: string) {
  const digits = onlyDigits(phone)
  if (!digits) return null
  const withCountry = digits.startsWith('55') ? digits : `55${digits}`
  return `https://wa.me/${withCountry}?text=${encodeURIComponent(text)}`
}

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

  const address = buildAddress(data)
  const whatsappText = 'Olá, vim do site de turismo da cidade de São Sebastião.'
  const whatsappHref = data.phone_primary ? buildWhatsappLink(data.phone_primary, whatsappText) : null

  return (
    <div className="min-h-screen bg-gray-50">
      <DetailBanner title={data.name} images={data.images} />
      <section className="container mx-auto px-4 py-10 max-w-3xl">
        <div className="mb-6">
          <h1 className="text-4xl md:text-5xl font-bold mb-2 text-gray-900">{data.name}</h1>
        </div>

        {data.tags && data.tags.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-2">
            {data.tags.map((tag: any) => {
              const IconRaw = tag.icon && (lucideIcons as any)[tag.icon]
              const Icon = typeof IconRaw === 'function' ? IconRaw : null
              return (
                <span
                  key={tag.id}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium flex items-center gap-1"
                >
                  {Icon ? <Icon className="w-4 h-4 mr-1" /> : null}
                  {tag.name}
                </span>
              )
            })}
          </div>
        )}

        {data.coupon && (
          <div className="mb-6 bg-emerald-50 border border-emerald-200 rounded-lg p-4">
            <p className="text-sm text-emerald-700 font-medium">Cupom</p>
            <p className="text-xl font-bold text-emerald-800">{data.coupon}</p>
          </div>
        )}

        {data.details && (
          <div
            className="prose max-w-none text-lg text-gray-700 mb-6"
            dangerouslySetInnerHTML={{ __html: data.details }}
          />
        )}

        <ul className="space-y-2 text-gray-700 text-base mb-4">
          {data.email && (
            <li className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-blue-500" />
              <a href={`mailto:${data.email}`} className="underline hover:text-blue-700">
                {data.email}
              </a>
            </li>
          )}

          {data.phone_primary && whatsappHref && (
            <li className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-green-600" />
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-green-700"
              >
                {data.phone_primary} (WhatsApp)
              </a>
            </li>
          )}

          {data.phone_secondary && (
            <li className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-blue-500" />
              <a href={`tel:${data.phone_secondary}`} className="underline hover:text-blue-700">
                {data.phone_secondary}
              </a>
            </li>
          )}

          {address && (
            <li className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-500" />
              <span>{address}</span>
            </li>
          )}

          {data.website && (
            <li className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-500" />
              <a
                href={data.website}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-blue-700"
              >
                {data.website}
              </a>
            </li>
          )}
          {data.instagram && (
            <li className="flex items-center gap-2">
              <Instagram className="w-4 h-4 text-pink-500" />
              <a
                href={data.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-pink-600"
              >
                {data.instagram}
              </a>
            </li>
          )}
          {data.facebook && (
            <li className="flex items-center gap-2">
              <Facebook className="w-4 h-4 text-blue-700" />
              <a
                href={data.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-blue-700"
              >
                {data.facebook}
              </a>
            </li>
          )}
        </ul>
      </section>
    </div>
  );
}
