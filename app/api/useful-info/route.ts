import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/authOptions'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// GET /api/useful-info - Lista informações úteis (dashboard com auth ou público filtrado)
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

      // Retorna todas as informações para o dashboard
      const usefulInfo = await prisma.usefulInfo.findMany({
        orderBy: [{ category: 'asc' }, { name: 'asc' }],
      })

      return NextResponse.json(usefulInfo)
    }

    // Requisição pública: apenas informações ativas
    const usefulInfo = await prisma.usefulInfo.findMany({
      where: { active: true },
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    })

    return NextResponse.json(usefulInfo)
  } catch (error) {
    console.error('Erro ao buscar informações úteis:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar informações úteis' },
      { status: 500 }
    )
  }
}

// POST /api/useful-info - Cria nova informação útil (admin only)
export async function POST(request: Request) {
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

    const usefulInfo = await prisma.usefulInfo.create({
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

    return NextResponse.json(usefulInfo, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar informação útil:', error)
    return NextResponse.json(
      { error: 'Erro ao criar informação útil' },
      { status: 500 }
    )
  }
}
