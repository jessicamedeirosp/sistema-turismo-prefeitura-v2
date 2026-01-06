import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category') // 'FOOD' ou 'ACCOMMODATION'

    if (!category || !['FOOD', 'ACCOMMODATION'].includes(category)) {
      return NextResponse.json({ error: 'Categoria inválida' }, { status: 400 })
    }

    // Buscar todos os estabelecimentos aprovados da categoria
    const allBusinesses = await prisma.business.findMany({
      where: {
        status: 'APPROVED',
        category: category as 'FOOD' | 'ACCOMMODATION',
      },
      select: {
        id: true,
        name: true,
        category: true,
        images: true,
        address_district: true,
      },
    })

    // Randomizar e pegar apenas 4
    const shuffled = allBusinesses.sort(() => 0.5 - Math.random())
    const businesses = shuffled.slice(0, 4)

    return NextResponse.json(businesses)
  } catch (error) {
    console.error('Error fetching businesses:', error)
    return NextResponse.json({ error: 'Erro ao buscar estabelecimentos' }, { status: 500 })
  }
}
