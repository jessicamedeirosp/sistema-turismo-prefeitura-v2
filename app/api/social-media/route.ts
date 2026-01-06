import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '../auth/authOptions'

// GET - Listar todas as redes sociais (público pode ver ativas, admin vê todas)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const isDashboard = searchParams.get('dashboard') === 'true'

    if (isDashboard) {
      const session = await getServerSession(authOptions)
      if (!session || session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
      }

      const socialMedias = await prisma.socialMedia.findMany({
        orderBy: { name: 'asc' },
      })

      return NextResponse.json(socialMedias)
    }

    // Para o público, retorna apenas ativas
    const socialMedias = await prisma.socialMedia.findMany({
      where: { active: true },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json(socialMedias)
  } catch (error) {
    console.error('Erro ao buscar redes sociais:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar redes sociais' },
      { status: 500 }
    )
  }
}

// POST - Criar nova rede social (somente admin)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
    }

    const body = await request.json()
    const { name, link, icon, active } = body

    if (!name || !link || !icon) {
      return NextResponse.json(
        { error: 'Nome, link e ícone são obrigatórios' },
        { status: 400 }
      )
    }

    const socialMedia = await prisma.socialMedia.create({
      data: {
        name,
        link,
        icon,
        active: active ?? true,
      },
    })

    return NextResponse.json(socialMedia, { status: 201 })
  } catch (error: any) {
    console.error('Erro ao criar rede social:', error)

    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Já existe uma rede social com este nome' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Erro ao criar rede social' },
      { status: 500 }
    )
  }
}
