import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/authOptions'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// GET /api/events - Lista eventos (dashboard com auth ou público filtrado)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const dashboard = searchParams.get('dashboard') === 'true'
    const session = await getServerSession(authOptions)
    const isAdmin = session?.user?.role === 'ADMIN'

    // Se for requisição do dashboard, verifica autenticação
    if (dashboard) {
      if (!session?.user || session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
      }

      // Retorna todos os eventos para o dashboard
      const events = await prisma.event.findMany({
        orderBy: { date: 'desc' },
      })

      return NextResponse.json(events)
    }

    // Requisição pública: apenas eventos ativos
    const events = await prisma.event.findMany({
      where: { active: true },
      orderBy: { date: 'desc' },
    })

    return NextResponse.json(events)
  } catch (error) {
    console.error('Erro ao buscar eventos:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar eventos' },
      { status: 500 }
    )
  }
}

// POST /api/events - Cria novo evento (admin only)
export async function POST(request: Request) {
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

    const event = await prisma.event.create({
      data: {
        name,
        date: new Date(date),
        location,
        details: details || null,
        images,
        active: active ?? true,
      },
    })

    return NextResponse.json(event, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar evento:', error)
    return NextResponse.json(
      { error: 'Erro ao criar evento' },
      { status: 500 }
    )
  }
}
