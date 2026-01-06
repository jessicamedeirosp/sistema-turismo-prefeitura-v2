import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    // Filtra apenas agências aprovadas do tipo AGENCY
    const agencies = await prisma.agency.findMany({
      where: {
        status: 'APPROVED',
        type: 'AGENCY',
      },
      select: {
        id: true,
        name: true,
        images: true,
        details: true,
        tags: {
          select: {
            tag: {
              select: { id: true, name: true, icon: true }
            }
          }
        },
      },
    })
    // Ajusta o formato dos tags
    const agenciesWithTags = agencies.map(a => ({
      ...a,
      tags: a.tags.map(t => t.tag)
    }))
    return NextResponse.json(agenciesWithTags)
  } catch (error) {
    console.error('Error fetching agencies:', error)
    return NextResponse.json({ error: 'Erro ao buscar agências' }, { status: 500 })
  }
}
