import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/public/news/[id] - Busca notícia pelo id
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const news = await prisma.news.findUnique({
      where: { id: params.id },
    })
    if (!news || !news.active) {
      return NextResponse.json({ error: 'Notícia não encontrada' }, { status: 404 })
    }
    return NextResponse.json(news)
  } catch (error) {
    console.error('Erro ao buscar notícia:', error)
    return NextResponse.json({ error: 'Erro ao buscar notícia' }, { status: 500 })
  }
}
