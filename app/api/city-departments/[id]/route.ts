import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/authOptions'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// GET /api/city-departments/[id] - Busca departamento específico
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const department = await prisma.cityDepartment.findUnique({
      where: { id: params.id },
    })

    if (!department) {
      return NextResponse.json({ error: 'Departamento não encontrado' }, { status: 404 })
    }

    return NextResponse.json(department)
  } catch (error) {
    console.error('Erro ao buscar departamento:', error)
    return NextResponse.json({ error: 'Erro ao buscar departamento' }, { status: 500 })
  }
}

// PUT /api/city-departments/[id] - Atualiza departamento (admin only)
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
    const { department, phone, address, website, email, hours, details, active } = body

    if (!department || !phone || !address) {
      return NextResponse.json(
        { error: 'Departamento, telefone e endereço são obrigatórios' },
        { status: 400 }
      )
    }

    const updated = await prisma.cityDepartment.update({
      where: { id: params.id },
      data: {
        department,
        phone,
        address,
        website: website || null,
        email: email || null,
        hours: hours || null,
        details: details || null,
        active: active ?? true,
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Erro ao atualizar departamento:', error)
    return NextResponse.json({ error: 'Erro ao atualizar departamento' }, { status: 500 })
  }
}

// DELETE /api/city-departments/[id] - Deleta departamento (admin only)
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
    }

    await prisma.cityDepartment.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Departamento deletado com sucesso' })
  } catch (error) {
    console.error('Erro ao deletar departamento:', error)
    return NextResponse.json({ error: 'Erro ao deletar departamento' }, { status: 500 })
  }
}

