import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/public/events/[id] - Busca evento pelo id
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const event = await prisma.event.findUnique({
      where: { id: params.id },
    })
    if (!event || !event.active) {
      return NextResponse.json({ error: 'Evento não encontrado' }, { status: 404 })
    }
    return NextResponse.json(event)
  } catch (error) {
    console.error('Erro ao buscar evento:', error)
    return NextResponse.json({ error: 'Erro ao buscar evento' }, { status: 500 })
  }
}
