import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/authOptions'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// GET /api/parkings - Lista estacionamentos (dashboard com auth ou público filtrado)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const dashboard = searchParams.get('dashboard') === 'true'
    const session = await getServerSession(authOptions)
    const isAdmin = session?.user?.role === 'ADMIN'

    // Se for requisição do dashboard, verifica autenticação
    if (dashboard) {
      if (!session?.user || session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
      }

      // Retorna todos os estacionamentos para o dashboard
      const parkings = await prisma.parking.findMany({
        orderBy: { company: 'asc' },
      })

      return NextResponse.json(parkings)
    }

    // Requisição pública: apenas estacionamentos ativos
    const parkings = await prisma.parking.findMany({
      where: { active: true },
      orderBy: { company: 'asc' },
    })

    return NextResponse.json(parkings)
  } catch (error) {
    console.error('Erro ao buscar estacionamentos:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar estacionamentos' },
      { status: 500 }
    )
  }
}

// POST /api/parkings - Cria novo estacionamento (admin only)
export async function POST(request: Request) {
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

    const parking = await prisma.parking.create({
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

    return NextResponse.json(parking, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar estacionamento:', error)
    return NextResponse.json(
      { error: 'Erro ao criar estacionamento' },
      { status: 500 }
    )
  }
}
