import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { canManageBeaches, UserRole } from '@/lib/permissions'
import { authOptions } from '../../../auth/authOptions'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// GET /api/beaches/admin/[id] - Busca praia específica
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || !canManageBeaches(session.user.role as UserRole)) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
    }

    const beach = await prisma.beach.findUnique({
      where: { id: params.id },
      include: {
        tags: {
          include: {
            tag: true
          }
        }
      }
    })

    if (!beach) {
      return NextResponse.json({ error: 'Praia não encontrada' }, { status: 404 })
    }

    return NextResponse.json(beach)
  } catch (error) {
    console.error('Erro ao buscar praia:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar praia' },
      { status: 500 }
    )
  }
}

// PUT /api/beaches/admin/[id] - Atualiza praia
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || !canManageBeaches(session.user.role as UserRole)) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
    }

    const body = await request.json()
    const { name, address_district, details, images, status, tagIds } = body

    if (!name || !address_district) {
      return NextResponse.json(
        { error: 'Nome e bairro são obrigatórios' },
        { status: 400 }
      )
    }

    // Remove todas as tags antigas
    await prisma.beachTag.deleteMany({
      where: { beach_id: params.id }
    })

    // Atualiza a praia e adiciona novas tags
    const beach = await prisma.beach.update({
      where: { id: params.id },
      data: {
        name,
        address_district,
        details: details || null,
        images: images || [],
        status: status || 'PENDING',
        tags: {
          create: (tagIds || []).map((tagId: string) => ({
            tag: {
              connect: { id: tagId }
            }
          }))
        }
      },
      include: {
        tags: {
          include: {
            tag: true
          }
        }
      }
    })

    return NextResponse.json(beach)
  } catch (error) {
    console.error('Erro ao atualizar praia:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar praia' },
      { status: 500 }
    )
  }
}

// DELETE /api/beaches/admin/[id] - Deleta praia
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || !canManageBeaches(session.user.role as UserRole)) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
    }

    await prisma.beach.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Praia deletada com sucesso' })
  } catch (error) {
    console.error('Erro ao deletar praia:', error)
    return NextResponse.json(
      { error: 'Erro ao deletar praia' },
      { status: 500 }
    )
  }
}
