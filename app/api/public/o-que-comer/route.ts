import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const businesses = await prisma.business.findMany({
      where: { status: "APPROVED", category: "FOOD" },
      select: {
        id: true,
        name: true,
        address_district: true,
        images: true,
        details: true,
        tags: {
          select: {
            tag: { select: { id: true, name: true, icon: true } }
          }
        },
      },
    });
    // Flatten tags
    const result = businesses.map((b) => ({ ...b, tags: b.tags?.map((t: any) => t.tag) || [] }));
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ error: "Erro ao buscar estabelecimentos" }, { status: 500 });
  }
}
