import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Buscar todos eventos ativos
    const now = new Date()
    const allEvents = await prisma.event.findMany({
      where: {
        active: true,
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

    // Separar futuros e passados
    const futureEvents = allEvents.filter(e => new Date(e.date) >= now)
    const pastEvents = allEvents.filter(e => new Date(e.date) < now)

    // Ordenar futuros (asc), passados (desc)
    futureEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    pastEvents.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    const events = [...futureEvents, ...pastEvents]

    return NextResponse.json(events)
  } catch (error) {
    console.error('Error fetching events:', error)
    return NextResponse.json({ error: 'Erro ao buscar eventos' }, { status: 500 })
  }
}
