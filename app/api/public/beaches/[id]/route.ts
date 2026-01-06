import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id
    if (!id) return NextResponse.json({ error: 'ID não informado' }, { status: 400 })

    const beach = await prisma.beach.findUnique({
      where: { id },
      include: {
        tags: { include: { tag: true } },
      },
    })
    if (!beach) return NextResponse.json({ error: 'Praia não encontrada' }, { status: 404 })

    // Formatar resposta igual à listagem
    return NextResponse.json({
      id: beach.id,
      name: beach.name,
      district: beach.address_district,
      images: beach.images,
      details: beach.details,
      tags: beach.tags?.map(t => ({
        id: t.tag.id,
        name: t.tag.name,
        icon: t.tag.icon || '',
      })) || [],
    })
  } catch (error) {
    console.error('Erro ao buscar praia por id:', error)
    return NextResponse.json({ error: 'Erro ao buscar praia' }, { status: 500 })
  }
}
