import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { hasPermission, UserRole } from '@/lib/permissions'
import { authOptions } from '../auth/authOptions'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    // Verificar permissão para visualizar todas as empresas
    if (!hasPermission(session.user.role as UserRole, 'viewAllBusinesses')) {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
    }

    // Buscar todas as empresas
    const businesses = await prisma.business.findMany({
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
      orderBy: [
        { status: 'asc' }, // PENDING primeiro
        { created_at: 'desc' },
      ],
    })

    return NextResponse.json(businesses)
  } catch (error) {
    console.error('Erro ao buscar empresas:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar empresas' },
      { status: 500 }
    )
  }
}
