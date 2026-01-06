import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '../auth/authOptions'

// GET /api/downloads - Lista todos os downloads
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const dashboard = searchParams.get('dashboard') === 'true'

    // Se for dashboard, verificar autenticação admin
    if (dashboard) {
      const session = await getServerSession(authOptions)
      if (!session || session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
      }

      // Retorna todos os downloads
      const downloads = await prisma.download.findMany({
        orderBy: { created_at: 'desc' },
      })
      return NextResponse.json(downloads)
    }

    // Para páginas públicas, retorna apenas downloads ativos e filtra por categoria se informado
    const category = searchParams.get('category')
    const downloads = await prisma.download.findMany({
      where: {
        active: true,
        ...(category ? { category: category as any } : {}),
      },
      orderBy: { created_at: 'desc' },
    })

    return NextResponse.json(downloads)
  } catch (error) {
    console.error('Erro ao buscar downloads:', error)
    return NextResponse.json({ error: 'Erro ao buscar downloads' }, { status: 500 })
  }
}

// POST /api/downloads - Cria novo download (apenas ADMIN)
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { name, category, link } = body

    if (!name || !category || !link) {
      return NextResponse.json(
        { error: 'Nome, categoria e arquivo são obrigatórios' },
        { status: 400 }
      )
    }

    const download = await prisma.download.create({
      data: {
        name,
        category,
        link,
      },
    })

    return NextResponse.json(download, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar download:', error)
    return NextResponse.json({ error: 'Erro ao criar download' }, { status: 500 })
  }
}
