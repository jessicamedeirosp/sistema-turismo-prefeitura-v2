import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/authOptions'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// GET /api/useful-info/[id] - Busca informação útil específica
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const usefulInfo = await prisma.usefulInfo.findUnique({
      where: { id: params.id },
    })

    if (!usefulInfo) {
      return NextResponse.json({ error: 'Informação útil não encontrada' }, { status: 404 })
    }

    return NextResponse.json(usefulInfo)
  } catch (error) {
    console.error('Erro ao buscar informação útil:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar informação útil' },
      { status: 500 }
    )
  }
}

// PUT /api/useful-info/[id] - Atualiza informação útil (admin only)
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
    }

    const body = await request.json()
    const { name, phone, address, website, email, category, active } = body

    if (!name || !phone || !category) {
      return NextResponse.json(
        { error: 'Nome, telefone e categoria são obrigatórios' },
        { status: 400 }
      )
    }

    const usefulInfo = await prisma.usefulInfo.update({
      where: { id: params.id },
      data: {
        name,
        phone,
        address,
        website: website || null,
        email: email || null,
        category,
        active: active ?? true,
      },
    })

    return NextResponse.json(usefulInfo)
  } catch (error) {
    console.error('Erro ao atualizar informação útil:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar informação útil' },
      { status: 500 }
    )
  }
}

// DELETE /api/useful-info/[id] - Deleta informação útil (admin only)
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
    }

    await prisma.usefulInfo.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Informação útil deletada com sucesso' })
  } catch (error) {
    console.error('Erro ao deletar informação útil:', error)
    return NextResponse.json(
      { error: 'Erro ao deletar informação útil' },
      { status: 500 }
    )
  }
}
