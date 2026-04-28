import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/authOptions'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// GET /api/city-departments - Lista departamentos (dashboard com auth ou público filtrado)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const dashboard = searchParams.get('dashboard') === 'true'

    if (dashboard) {
      const session = await getServerSession(authOptions)
      if (!session?.user || session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
      }

      const departments = await prisma.cityDepartment.findMany({
        orderBy: { department: 'asc' },
      })

      return NextResponse.json(departments)
    }

    const departments = await prisma.cityDepartment.findMany({
      where: { active: true },
      orderBy: { department: 'asc' },
    })

    return NextResponse.json(departments)
  } catch (error) {
    console.error('Erro ao buscar departamentos:', error)
    return NextResponse.json({ error: 'Erro ao buscar departamentos' }, { status: 500 })
  }
}

// POST /api/city-departments - Cria novo departamento (admin only)
export async function POST(request: Request) {
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

    const created = await prisma.cityDepartment.create({
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

    return NextResponse.json(created, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar departamento:', error)
    return NextResponse.json({ error: 'Erro ao criar departamento' }, { status: 500 })
  }
}

