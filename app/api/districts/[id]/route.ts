import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '../../auth/authOptions'

// GET - Buscar um bairro específico
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const district = await prisma.district.findUnique({
      where: { id: params.id },
    })

    if (!district) {
      return NextResponse.json(
        { error: 'Bairro não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(district)
  } catch (error) {
    console.error('Erro ao buscar bairro:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar bairro' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar bairro (somente admin)
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
    const { name, active } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Nome é obrigatório' },
        { status: 400 }
      )
    }

    const district = await prisma.district.update({
      where: { id: params.id },
      data: {
        name,
        active,
      },
    })

    return NextResponse.json(district)
  } catch (error: any) {
    console.error('Erro ao atualizar bairro:', error)

    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Já existe um bairro com este nome' },
        { status: 400 }
      )
    }

    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Bairro não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Erro ao atualizar bairro' },
      { status: 500 }
    )
  }
}

// DELETE - Excluir bairro (somente admin)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
    }

    await prisma.district.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Bairro excluído com sucesso' })
  } catch (error: any) {
    console.error('Erro ao excluir bairro:', error)

    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Bairro não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Erro ao excluir bairro' },
      { status: 500 }
    )
  }
}
