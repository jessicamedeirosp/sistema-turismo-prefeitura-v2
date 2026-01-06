import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Buscar todos os tour templates
    const allTours = await prisma.tourTemplate.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        images: true,
      },
    })

    // Randomizar e pegar apenas 4
    const shuffled = allTours.sort(() => 0.5 - Math.random())
    const tours = shuffled.slice(0, 4)

    return NextResponse.json(tours)
  } catch (error) {
    console.error('Error fetching tours:', error)
    return NextResponse.json({ error: 'Erro ao buscar passeios' }, { status: 500 })
  }
}
