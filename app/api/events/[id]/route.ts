import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/authOptions'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// GET /api/events/[id] - Busca evento específico
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const event = await prisma.event.findUnique({
      where: { id: params.id },
    })

    if (!event) {
      return NextResponse.json({ error: 'Evento não encontrado' }, { status: 404 })
    }

    return NextResponse.json(event)
  } catch (error) {
    console.error('Erro ao buscar evento:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar evento' },
      { status: 500 }
    )
  }
}

// PUT /api/events/[id] - Atualiza evento (admin only)
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
    }

    const body = await request.json()
    const { name, date, location, details, images, active } = body

    if (!name || !date || !location || !images || images.length === 0) {
      return NextResponse.json(
        { error: 'Nome, data, localização e pelo menos uma imagem são obrigatórios' },
        { status: 400 }
      )
    }

    const event = await prisma.event.update({
      where: { id: params.id },
      data: {
        name,
        date: new Date(date),
        location,
        details: details || null,
        images,
        active: active ?? true,
      },
    })

    return NextResponse.json(event)
  } catch (error) {
    console.error('Erro ao atualizar evento:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar evento' },
      { status: 500 }
    )
  }
}

// DELETE /api/events/[id] - Deleta evento (admin only)
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
    }

    await prisma.event.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Evento deletado com sucesso' })
  } catch (error) {
    console.error('Erro ao deletar evento:', error)
    return NextResponse.json(
      { error: 'Erro ao deletar evento' },
      { status: 500 }
    )
  }
}
