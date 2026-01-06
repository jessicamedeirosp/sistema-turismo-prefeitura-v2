import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { CommonPageName } from '@prisma/client'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = searchParams.get('page')
    const onlyFooter = searchParams.get('only_footer')
    const visibleHeader = searchParams.get('visible_header')

    if (page) {
      // Buscar página específica
      const commonPage = await prisma.commonPage.findFirst({
        where: {
          page: page as CommonPageName,
          active: true,
        },
      })

      if (!commonPage) {
        return NextResponse.json({ error: 'Página não encontrada' }, { status: 404 })
      }

      return NextResponse.json(commonPage)
    }

    // Buscar páginas para o footer se solicitado
    if (onlyFooter === 'true') {
      const footerPages = await prisma.commonPage.findMany({
        where: {
          active: true,
          only_footer: true,
        },
        select: {
          id: true,
          title: true,
          link_externo: true,
          page: true,
        },
      })
      return NextResponse.json(footerPages)
    }

    // Buscar páginas para o header se solicitado
    if (visibleHeader === 'true') {
      const headerPages = await prisma.commonPage.findMany({
        where: {
          active: true,
          visible_header: true,
        },
        select: {
          page: true,
          title: true,
        },
      })
      return NextResponse.json(headerPages)
    }

    // Buscar todas as páginas ativas
    const pages = await prisma.commonPage.findMany({
      where: { active: true },
      select: {
        page: true,
        title: true,
      },
    })

    return NextResponse.json(pages)
  } catch (error) {
    console.error('Error fetching common pages:', error)
    return NextResponse.json({ error: 'Erro ao buscar páginas' }, { status: 500 })
  }
}
