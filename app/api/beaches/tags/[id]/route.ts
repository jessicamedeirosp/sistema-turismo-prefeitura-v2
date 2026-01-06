import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { canManageTags, UserRole } from '@/lib/permissions'
import { authOptions } from '../../../auth/authOptions'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// GET /api/beaches/tags/[id] - Buscar tag específica
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const tag = await prisma.beachTagModel.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            beaches: true
          }
        }
      }
    })

    if (!tag) {
      return NextResponse.json({ error: 'Tag não encontrada' }, { status: 404 })
    }

    return NextResponse.json(tag)
  } catch (error) {
    console.error('Erro ao buscar tag:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar tag' },
      { status: 500 }
    )
  }
}

// PUT /api/beaches/tags/[id] - Atualizar tag
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    // Verificar se a tag existe
    const existingTag = await prisma.beachTagModel.findUnique({
      where: { id: params.id }
    })

    if (!existingTag) {
      return NextResponse.json({ error: 'Tag não encontrada' }, { status: 404 })
    }

    // Verificar se já existe outra tag com esse nome
    const duplicateTag = await prisma.beachTagModel.findFirst({
      where: {
        name: name.trim(),
        id: { not: params.id }
      }
    })

    if (duplicateTag) {
      return NextResponse.json(
        { error: 'Já existe uma tag com este nome' },
        { status: 400 }
      )
    }

    const tag = await prisma.beachTagModel.update({
      where: { id: params.id },
      data: {
        name: name.trim(),
        icon: icon || null,
      }
    })

    return NextResponse.json(tag)
  } catch (error) {
    console.error('Erro ao atualizar tag:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar tag' },
      { status: 500 }
    )
  }
}

// DELETE /api/beaches/tags/[id] - Deletar tag
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    if (!canManageTags(session.user.role as UserRole)) {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
    }

    // Verificar se a tag existe
    const existingTag = await prisma.beachTagModel.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            beaches: true
          }
        }
      }
    })

    if (!existingTag) {
      return NextResponse.json({ error: 'Tag não encontrada' }, { status: 404 })
    }

    // Verificar se a tag está sendo usada
    if (existingTag._count.beaches > 0) {
      return NextResponse.json(
        { error: `Esta tag está sendo usada por ${existingTag._count.beaches} praia(s)` },
        { status: 400 }
      )
    }

    await prisma.beachTagModel.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Tag excluída com sucesso' })
  } catch (error) {
    console.error('Erro ao deletar tag:', error)
    return NextResponse.json(
      { error: 'Erro ao deletar tag' },
      { status: 500 }
    )
  }
}
