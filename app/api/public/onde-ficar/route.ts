import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/public/onde-ficar - Lista todas as acomodações públicas aprovadas
export async function GET(req: NextRequest) {
  try {
    const hotels = await prisma.business.findMany({
      where: {
        status: "APPROVED",
        category: "ACCOMMODATION",
      },
      select: {
        id: true,
        name: true,
        images: true,
        details: true,
        phone_primary: true,
        phone_secondary: true,
        website: true,
        instagram: true,
        facebook: true,
        address_street: true,
        address_number: true,
        address_district: true,
        address_complement: true,
        cnpj_cpf: true,
        cadastur: true,
        tags: {
          select: {
            tag: { select: { id: true, name: true, icon: true } }
          }
        },
      },
      orderBy: [
        { name: "asc" },
      ],
    });
    // Flatten tags
    const hotelsWithTags = hotels.map((hotel: any) => ({
      ...hotel,
      tags: hotel.tags?.map((t: any) => t.tag) || [],
    }));
    return NextResponse.json(hotelsWithTags);
  } catch (e) {
    return NextResponse.json({ error: "Erro ao buscar acomodações" }, { status: 500 });
  }
}
