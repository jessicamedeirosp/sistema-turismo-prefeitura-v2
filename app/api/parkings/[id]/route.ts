import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/authOptions'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// GET /api/parkings/[id] - Busca estacionamento específico
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const parking = await prisma.parking.findUnique({
      where: { id: params.id },
    })

    if (!parking) {
      return NextResponse.json({ error: 'Estacionamento não encontrado' }, { status: 404 })
    }

    return NextResponse.json(parking)
  } catch (error) {
    console.error('Erro ao buscar estacionamento:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar estacionamento' },
      { status: 500 }
    )
  }
}

// PUT /api/parkings/[id] - Atualiza estacionamento (admin only)
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
    const { company, address, address_district, van, micro, onibus, phone, email, route_link, active } = body

    if (!company || !address || !address_district || !phone) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: empresa, endereço, bairro e telefone' },
        { status: 400 }
      )
    }

    const parking = await prisma.parking.update({
      where: { id: params.id },
      data: {
        company,
        address,
        address_district,
        van: van ?? false,
        micro: micro ?? false,
        onibus: onibus ?? false,
        phone,
        email,
        route_link,
        active: active ?? true,
      },
    })

    return NextResponse.json(parking)
  } catch (error) {
    console.error('Erro ao atualizar estacionamento:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar estacionamento' },
      { status: 500 }
    )
  }
}

// DELETE /api/parkings/[id] - Deleta estacionamento (admin only)
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
    }

    await prisma.parking.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Estacionamento deletado com sucesso' })
  } catch (error) {
    console.error('Erro ao deletar estacionamento:', error)
    return NextResponse.json(
      { error: 'Erro ao deletar estacionamento' },
      { status: 500 }
    )
  }
}
