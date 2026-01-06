import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Buscar todas as notícias ativas
    const allNews = await prisma.news.findMany({
      where: { active: true },
      select: {
        id: true,
        title: true,
        content: true,
        image: true,
        created_at: true,
      },
      orderBy: {
        created_at: 'desc',
      },
    })

    // Randomizar e pegar apenas 4
    const shuffled = allNews.sort(() => 0.5 - Math.random())
    const news = shuffled.slice(0, 4)

    return NextResponse.json(news)
  } catch (error) {
    console.error('Error fetching news:', error)
    return NextResponse.json({ error: 'Erro ao buscar notícias' }, { status: 500 })
  }
}
