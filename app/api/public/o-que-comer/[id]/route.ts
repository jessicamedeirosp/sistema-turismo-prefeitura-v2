import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  try {
    const business = await prisma.business.findUnique({
      where: { id, status: "APPROVED", category: "FOOD" },
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
    });
    if (!business) {
      return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
    }
    // Flatten tags
    const tags = business.tags?.map((t: any) => t.tag) || [];
    return NextResponse.json({ ...business, tags });
  } catch (e) {
    return NextResponse.json({ error: "Erro ao buscar detalhe" }, { status: 500 });
  }
}
