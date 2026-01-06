import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '../auth/authOptions'

// GET /api/common-pages - Lista todas as páginas
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

      // Retorna todas as páginas, adaptando campos para o dashboard
      const pages = await prisma.commonPage.findMany({
        orderBy: { page: 'asc' },
      })
      // Adaptar campos para frontend
      const mapped = pages.map((p) => ({
        ...p,
        visibleInHeader: p.visible_header,
        visibleInFooter: p.only_footer,
      }))
      return NextResponse.json(mapped)
    }

    // Para páginas públicas, retorna apenas páginas ativas
    const pages = await prisma.commonPage.findMany({
      where: { active: true },
      orderBy: { page: 'asc' },
    })

    return NextResponse.json(pages)
  } catch (error) {
    console.error('Erro ao buscar páginas:', error)
    return NextResponse.json({ error: 'Erro ao buscar páginas' }, { status: 500 })
  }
}

// POST /api/common-pages - Cria nova página (admin only)
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)


    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
    }

    const body = await request.json()
    const { title, video, images, details, page, active } = body

    if (!title || !page) {
      return NextResponse.json(
        { error: 'Título e página são obrigatórios' },
        { status: 400 }
      )
    }

    const { visibleInHeader, visibleInFooter } = body
    const commonPage = await prisma.commonPage.create({
      data: {
        title,
        video: video || null,
        images: images || [],
        details,
        page,
        active: active ?? true,
        visible_header: visibleInHeader ?? false,
        only_footer: visibleInFooter ?? false,
      },
    })

    return NextResponse.json({
      ...commonPage,
      visibleInHeader: commonPage.visible_header,
      visibleInFooter: commonPage.only_footer,
    }, { status: 201 })
  } catch (error: any) {
    console.error('Erro ao criar página:', error)

    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Já existe uma página para esta categoria' },
        { status: 400 }
      )
    }

    return NextResponse.json({ error: 'Erro ao criar página' }, { status: 500 })
  }
}
