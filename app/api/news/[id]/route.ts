import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/authOptions'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// GET /api/news/[id] - Busca notícia específica
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const news = await prisma.news.findUnique({
      where: { id: params.id },
    })

    if (!news) {
      return NextResponse.json({ error: 'Notícia não encontrada' }, { status: 404 })
    }

    return NextResponse.json(news)
  } catch (error) {
    console.error('Erro ao buscar notícia:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar notícia' },
      { status: 500 }
    )
  }
}

// PUT /api/news/[id] - Atualiza notícia (admin only)
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
    const { title, content, image, author, active } = body

    if (!title || !content || !image) {
      return NextResponse.json(
        { error: 'Título, conteúdo e imagem são obrigatórios' },
        { status: 400 }
      )
    }

    const news = await prisma.news.update({
      where: { id: params.id },
      data: {
        title,
        content,
        image,
        author: author || null,
        active: active ?? true,
      },
    })

    return NextResponse.json(news)
  } catch (error) {
    console.error('Erro ao atualizar notícia:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar notícia' },
      { status: 500 }
    )
  }
}

// DELETE /api/news/[id] - Deleta notícia (admin only)
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
    }

    await prisma.news.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Notícia deletada com sucesso' })
  } catch (error) {
    console.error('Erro ao deletar notícia:', error)
    return NextResponse.json(
      { error: 'Erro ao deletar notícia' },
      { status: 500 }
    )
  }
}
