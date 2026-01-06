import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Buscar todas as praias aprovadas
    const allBeaches = await prisma.beach.findMany({
      where: { status: 'APPROVED' },
      select: {
        id: true,
        name: true,
        address_district: true,
        images: true,
      },
    })

    // Randomizar e pegar apenas 4
    const shuffled = allBeaches.sort(() => 0.5 - Math.random())
    const beaches = shuffled.slice(0, 4)

    return NextResponse.json(beaches)
  } catch (error) {
    console.error('Error fetching beaches:', error)
    return NextResponse.json({ error: 'Erro ao buscar praias' }, { status: 500 })
  }
}
