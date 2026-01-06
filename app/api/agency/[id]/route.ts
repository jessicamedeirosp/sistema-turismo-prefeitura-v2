import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '../../auth/authOptions'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const agency = await prisma.agency.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        tags: {
          include: {
            tag: true,
          },
        },
      },
    })

    if (!agency) {
      return NextResponse.json({ error: 'Agência não encontrada' }, { status: 404 })
    }

    return NextResponse.json({ agency })
  } catch (error) {
    console.error('Error fetching agency:', error)
    return NextResponse.json({ error: 'Erro ao buscar agência' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const {
      name,
      email,
      phone_primary,
      phone_secondary,
      address_street,
      address_number,
      address_district,
      address_complement,
      credential,
      website,
      instagram,
      facebook,
      details,
      image,
      images,
      tags,
    } = body

    // Verificar se o usuário tem permissão para editar
    const agency = await prisma.agency.findUnique({
      where: { id: params.id },
    })

    if (!agency) {
      return NextResponse.json({ error: 'Agência não encontrada' }, { status: 404 })
    }

    // Apenas ADMIN, MODERATOR ou o próprio dono podem editar
    const userRole = session.user.role
    const isOwner = agency.user_id === session.user.id
    const canEdit = ['ADMIN', 'MODERATOR'].includes(userRole) || isOwner

    if (!canEdit) {
      return NextResponse.json({ error: 'Sem permissão para editar' }, { status: 403 })
    }

    // Atualizar agência
    const updatedAgency = await prisma.agency.update({
      where: { id: params.id },
      data: {
        name,
        email,
        phone_primary,
        phone_secondary,
        address_street,
        address_number,
        address_district,
        address_complement,
        credential,
        website,
        instagram,
        facebook,
        details,
        image,
        images,
      },
    })

    // Atualizar tags
    if (tags) {
      // Remover tags antigas
      await prisma.agencyTag.deleteMany({
        where: { agency_id: params.id },
      })

      // Adicionar novas tags
      if (tags.length > 0) {
        await prisma.agencyTag.createMany({
          data: tags.map((tagId: string) => ({
            agency_id: params.id,
            tag_id: tagId,
          })),
        })
      }
    }

    return NextResponse.json({ agency: updatedAgency })
  } catch (error) {
    console.error('Error updating agency:', error)
    return NextResponse.json({ error: 'Erro ao atualizar agência' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Verificar se o usuário tem permissão para deletar
    const agency = await prisma.agency.findUnique({
      where: { id: params.id },
    })

    if (!agency) {
      return NextResponse.json({ error: 'Agência não encontrada' }, { status: 404 })
    }

    // Apenas ADMIN, MODERATOR ou o próprio dono podem deletar
    const userRole = session.user.role
    const isOwner = agency.user_id === session.user.id
    const canDelete = ['ADMIN', 'MODERATOR'].includes(userRole) || isOwner

    if (!canDelete) {
      return NextResponse.json({ error: 'Sem permissão para excluir' }, { status: 403 })
    }

    // Deletar tags relacionadas
    await prisma.agencyTag.deleteMany({
      where: { agency_id: params.id },
    })

    // Deletar agência
    await prisma.agency.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting agency:', error)
    return NextResponse.json({ error: 'Erro ao excluir agência' }, { status: 500 })
  }
}
