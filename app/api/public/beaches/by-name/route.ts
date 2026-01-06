import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const name = searchParams.get('name')
  if (!name) {
    return NextResponse.json({ error: 'Nome não informado' }, { status: 400 })
  }
  try {
    const beach = await prisma.beach.findFirst({
      where: {
        name: {
          equals: name,
          mode: 'insensitive',
        },
      },
      include: {
        tags: { include: { tag: true } },
      },
    })
    if (!beach) return NextResponse.json({ error: 'Praia não encontrada' }, { status: 404 })
    return NextResponse.json({
      id: beach.id,
      name: beach.name,
      district: beach.address_district,
      images: beach.images,
      details: beach.details,
      tags: beach.tags?.map(t => ({
        id: t.tag.id,
        name: t.tag.name,
        icon: t.tag.icon,
      })) || [],
    })
  } catch (error) {
    console.error('Erro ao buscar praia por nome:', error)
    return NextResponse.json({ error: 'Erro ao buscar praia' }, { status: 500 })
  }
}
