import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { canManageTags, UserRole } from '@/lib/permissions'
import { authOptions } from '../../auth/authOptions'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// GET /api/beaches/tags - Lista todas as tags de praias
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const isDashboard = searchParams.get('dashboard') === 'true'

    if (isDashboard) {
      const session = await getServerSession(authOptions)
      if (!session?.user || !canManageTags(session.user.role as UserRole)) {
        return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
      }
    }

    const tags = await prisma.beachTagModel.findMany({
      include: {
        _count: {
          select: {
            beaches: true,
          },
        },
      },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json(tags)
  } catch (error) {
    console.error('Erro ao buscar tags:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar tags' },
      { status: 500 }
    )
  }
}

// POST /api/beaches/tags - Criar nova tag de praia
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    if (!canManageTags(session.user.role as UserRole)) {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
    }

    const body = await request.json()
    const { name, icon } = body

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 })
    }

    // Verificar se já existe uma tag com esse nome
    const existingTag = await prisma.beachTagModel.findUnique({
      where: { name: name.trim() }
    })

    if (existingTag) {
      return NextResponse.json(
        { error: 'Já existe uma tag com este nome' },
        { status: 400 }
      )
    }

    const tag = await prisma.beachTagModel.create({
      data: {
        name: name.trim(),
        icon: icon || null,
      }
    })

    return NextResponse.json(tag, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar tag:', error)
    return NextResponse.json(
      { error: 'Erro ao criar tag' },
      { status: 500 }
    )
  }
}
