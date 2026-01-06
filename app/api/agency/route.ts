import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { hasPermission, UserRole } from '@/lib/permissions'
import { authOptions } from '../auth/authOptions'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const type = searchParams.get('type')

    // Se está buscando apenas guias aprovados, qualquer usuário autenticado pode ver
    // (necessário para seleção de guia auxiliar)
    const isPublicQuery = type === 'GUIDE' && status === 'APPROVED'

    // Se não é query pública, verifica permissão
    if (!isPublicQuery && !hasPermission(user.role as UserRole, 'viewAllAgencies')) {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
    }

    const where: any = {}

    if (status) {
      where.status = status
    }

    if (type) {
      where.type = type
    }

    const agencies = await prisma.agency.findMany({
      where,
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
      orderBy: {
        created_at: 'desc',
      },
    })

    return NextResponse.json({ agencies })
  } catch (error) {
    console.error('Error fetching agencies:', error)
    return NextResponse.json({ error: 'Erro ao buscar agências' }, { status: 500 })
  }
}
