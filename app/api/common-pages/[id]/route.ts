import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '../../auth/authOptions'

// GET /api/common-pages/[id] - Busca uma página específica
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const page = await prisma.commonPage.findUnique({
      where: { id: params.id },
    })

    if (!page) {
      return NextResponse.json({ error: 'Página não encontrada' }, { status: 404 })
    }

    return NextResponse.json(page)
  } catch (error) {
    console.error('Erro ao buscar página:', error)
    return NextResponse.json({ error: 'Erro ao buscar página' }, { status: 500 })
  }
}

// PUT /api/common-pages/[id] - Atualiza uma página (admin only)
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
    const { title, video, images, details, page, active, visibleInHeader, visibleInFooter } = body

    if (!title || !page) {
      return NextResponse.json(
        { error: 'Título e página são obrigatórios' },
        { status: 400 }
      )
    }

    const commonPage = await prisma.commonPage.update({
      where: { id: params.id },
      data: {
        title,
        video: video || null,
        images: images || [],
        details,
        page,
        active,
        visible_header: visibleInHeader ?? false,
        only_footer: visibleInFooter ?? false,
      },
    })

    return NextResponse.json({
      ...commonPage,
      visibleInHeader: commonPage.visible_header,
      visibleInFooter: commonPage.only_footer,
    })
  } catch (error: any) {
    console.error('Erro ao atualizar página:', error)

    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Já existe uma página para esta categoria' },
        { status: 400 }
      )
    }

    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Página não encontrada' }, { status: 404 })
    }

    return NextResponse.json({ error: 'Erro ao atualizar página' }, { status: 500 })
  }
}
