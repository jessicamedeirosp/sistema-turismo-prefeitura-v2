import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    // Filtra apenas guias aprovados do tipo GUIDE
    const guides = await prisma.agency.findMany({
      where: {
        status: 'APPROVED',
        type: 'GUIDE',
      },
      select: {
        id: true,
        name: true,
        images: true,
        details: true,
        email: true,
        phone_primary: true,
        phone_secondary: true,
        address_street: true,
        address_number: true,
        address_district: true,
        address_complement: true,
        cnpj_cpf: true,
        credential: true,
        website: true,
        instagram: true,
        facebook: true,
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
    const guidesWithTags = guides.map(g => ({
      ...g,
      tags: g.tags.map(t => t.tag)
    }))
    return NextResponse.json(guidesWithTags)
  } catch (error) {
    console.error('Error fetching guides:', error)
    return NextResponse.json({ error: 'Erro ao buscar guias' }, { status: 500 })
  }
}
