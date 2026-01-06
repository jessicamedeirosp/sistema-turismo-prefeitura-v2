import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/authOptions'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// GET /api/news - Lista notícias (dashboard com auth ou público filtrado)
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

      // Retorna todas as notícias para o dashboard
      const news = await prisma.news.findMany({
        orderBy: { created_at: 'desc' },
      })

      return NextResponse.json(news)
    }

    // Requisição pública: apenas notícias ativas
    const news = await prisma.news.findMany({
      where: { active: true },
      orderBy: { created_at: 'desc' },
    })

    return NextResponse.json(news)
  } catch (error) {
    console.error('Erro ao buscar notícias:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar notícias' },
      { status: 500 }
    )
  }
}

// POST /api/news - Cria nova notícia (admin only)
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
    }

    const body = await request.json()
    const { title, content, image, author, active } = body

    if (!title || !content || !image) {
      return NextResponse.json(
        { error: 'Título, conteúdo e imagem são obrigatórios' },
        { status: 400 }
      )
    }

    const news = await prisma.news.create({
      data: {
        title,
        content,
        image,
        author: author || null,
        active: active ?? true,
      },
    })

    return NextResponse.json(news, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar notícia:', error)
    return NextResponse.json(
      { error: 'Erro ao criar notícia' },
      { status: 500 }
    )
  }
}
