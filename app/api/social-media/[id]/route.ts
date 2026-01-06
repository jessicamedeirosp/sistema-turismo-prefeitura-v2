import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '../../auth/authOptions'

// GET - Buscar uma rede social específica
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const socialMedia = await prisma.socialMedia.findUnique({
      where: { id: params.id },
    })

    if (!socialMedia) {
      return NextResponse.json(
        { error: 'Rede social não encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json(socialMedia)
  } catch (error) {
    console.error('Erro ao buscar rede social:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar rede social' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar rede social (somente admin)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const socialMedia = await prisma.socialMedia.update({
      where: { id: params.id },
      data: {
        name,
        link,
        icon,
        active,
      },
    })

    return NextResponse.json(socialMedia)
  } catch (error: any) {
    console.error('Erro ao atualizar rede social:', error)

    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Já existe uma rede social com este nome' },
        { status: 400 }
      )
    }

    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Rede social não encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Erro ao atualizar rede social' },
      { status: 500 }
    )
  }
}

// DELETE - Excluir rede social (somente admin)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
    }

    await prisma.socialMedia.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Rede social excluída com sucesso' })
  } catch (error: any) {
    console.error('Erro ao excluir rede social:', error)

    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Rede social não encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Erro ao excluir rede social' },
      { status: 500 }
    )
  }
}
