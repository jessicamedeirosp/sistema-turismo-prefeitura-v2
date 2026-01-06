import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { hasPermission } from '@/lib/permissions'
import { UserRole } from '@prisma/client'
import { authOptions } from '../../auth/authOptions'

// GET /api/tags/[id] - Buscar tag por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tag = await prisma.tag.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            businesses: true,
          },
        },
      },
    })

    if (!tag) {
      return NextResponse.json({ error: 'Tag não encontrada' }, { status: 404 })
    }

    return NextResponse.json({ tag })
  } catch (error) {
    console.error('Error fetching tag:', error)
    return NextResponse.json({ error: 'Erro ao buscar tag' }, { status: 500 })
  }
}

// PUT /api/tags/[id] - Atualizar tag
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !hasPermission(session.user.role as UserRole, 'editTags')) {
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

    // Verificar se a tag existe
    const existingTag = await prisma.tag.findUnique({
      where: { id: params.id },
    })

    if (!existingTag) {
      return NextResponse.json({ error: 'Tag não encontrada' }, { status: 404 })
    }

    // Verificar se já existe outra tag com esse nome
    const duplicateTag = await prisma.tag.findFirst({
      where: {
        name,
        NOT: {
          id: params.id,
        },
      },
    })

    if (duplicateTag) {
      return NextResponse.json({ error: 'Já existe uma tag com este nome' }, { status: 400 })
    }

    const tag = await prisma.tag.update({
      where: { id: params.id },
      data: {
        name: name.trim(),
        category,
        icon: icon?.trim() || null,
      },
    })

    return NextResponse.json({ tag })
  } catch (error) {
    console.error('Error updating tag:', error)
    return NextResponse.json({ error: 'Erro ao atualizar tag' }, { status: 500 })
  }
}

// DELETE /api/tags/[id] - Excluir tag
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !hasPermission(session.user.role as UserRole, 'deleteTags')) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
    }

    // Verificar se a tag existe
    const tag = await prisma.tag.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            businesses: true,
          },
        },
      },
    })

    if (!tag) {
      return NextResponse.json({ error: 'Tag não encontrada' }, { status: 404 })
    }

    // Excluir tag (BusinessTag será excluído automaticamente por cascade)
    await prisma.tag.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Tag excluída com sucesso' })
  } catch (error) {
    console.error('Error deleting tag:', error)
    return NextResponse.json({ error: 'Erro ao excluir tag' }, { status: 500 })
  }
}
