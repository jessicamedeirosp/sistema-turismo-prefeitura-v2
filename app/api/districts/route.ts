import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '../auth/authOptions'

// GET - Listar todos os bairros
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const isDashboard = searchParams.get('dashboard') === 'true'

    if (isDashboard) {
      const session = await getServerSession(authOptions)
      if (!session || session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
      }

      const districts = await prisma.district.findMany({
        orderBy: { name: 'asc' },
      })

      return NextResponse.json(districts)
    }

    // Para o público, retorna apenas ativos
    const districts = await prisma.district.findMany({
      where: { active: true },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json(districts)
  } catch (error) {
    console.error('Erro ao buscar bairros:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar bairros' },
      { status: 500 }
    )
  }
}

// POST - Criar novo bairro (somente admin)
export async function POST(request: NextRequest) {
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

    const district = await prisma.district.create({
      data: {
        name,
        active: active ?? true,
      },
    })

    return NextResponse.json(district, { status: 201 })
  } catch (error: any) {
    console.error('Erro ao criar bairro:', error)

    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Já existe um bairro com este nome' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Erro ao criar bairro' },
      { status: 500 }
    )
  }
}
