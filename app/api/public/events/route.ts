import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Buscar eventos ativos e futuros
    const now = new Date()

    const allEvents = await prisma.event.findMany({
      where: {
        active: true,
        date: {
          gte: now,
        },
      },
      select: {
        id: true,
        name: true,
        date: true,
        location: true,
        images: true,
      },
      orderBy: {
        date: 'asc',
      },
    })

    // Randomizar e pegar apenas 4
    const shuffled = allEvents.sort(() => 0.5 - Math.random())
    const events = shuffled.slice(0, 4)

    return NextResponse.json(events)
  } catch (error) {
    console.error('Error fetching events:', error)
    return NextResponse.json({ error: 'Erro ao buscar eventos' }, { status: 500 })
  }
}
