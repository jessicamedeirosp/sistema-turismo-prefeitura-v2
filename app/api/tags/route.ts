import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { hasPermission } from '@/lib/permissions'
import { UserRole } from '@prisma/client'
import { authOptions } from '../auth/authOptions'

// GET /api/tags - Listar todas as tags
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const isDashboard = searchParams.get('dashboard') === 'true'
    const category = searchParams.get('category')

    if (isDashboard) {
      const session = await getServerSession(authOptions)
      if (!session || !hasPermission(session.user.role as UserRole, 'viewTags')) {
        return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
      }
    }

    // Montar filtro
    const where: any = {}
    if (category) {
      where.category = category
    }

    const tags = await prisma.tag.findMany({
      where,
      include: {
        _count: {
          select: {
            businesses: true,
          },
        },
      },
      orderBy: [
        { category: 'asc' },
        { name: 'asc' },
      ],
    })

    return NextResponse.json(tags)
  } catch (error) {
    console.error('Error fetching tags:', error)
    return NextResponse.json({ error: 'Erro ao buscar tags' }, { status: 500 })
  }
}

// POST /api/tags - Criar nova tag
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !hasPermission(session.user.role as UserRole, 'createTags')) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
    }

    const body = await request.json()
    const { name, category, icon } = body

    if (!name || !category) {
      return NextResponse.json({ error: 'Nome e categoria são obrigatórios' }, { status: 400 })
    }

    if (!['FOOD', 'ACCOMMODATION'].includes(category)) {
      return NextResponse.json({ error: 'Categoria inválida' }, { status: 400 })
    }

    // Verificar se já existe uma tag com esse nome
    const existingTag = await prisma.tag.findUnique({
      where: { name },
    })

    if (existingTag) {
      return NextResponse.json({ error: 'Já existe uma tag com este nome' }, { status: 400 })
    }

    const tag = await prisma.tag.create({
      data: {
        name: name.trim(),
        category,
        icon: icon?.trim() || null,
      },
    })

    return NextResponse.json({ tag }, { status: 201 })
  } catch (error) {
    console.error('Error creating tag:', error)
    return NextResponse.json({ error: 'Erro ao criar tag' }, { status: 500 })
  }
}
