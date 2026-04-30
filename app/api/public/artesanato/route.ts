import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const businesses = await prisma.business.findMany({
      where: {
        status: 'APPROVED',
        category: 'ARTISAN',
      },
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
      orderBy: [{ name: 'asc' }],
    })

    const result = businesses.map((business) => ({
      ...business,
      tags: business.tags?.map((item: any) => item.tag) || [],
    }))

    return NextResponse.json(result)
  } catch (error) {
    console.error('Erro ao buscar artesanato:', error)
    return NextResponse.json({ error: 'Erro ao buscar artesanato' }, { status: 500 })
  }
}
