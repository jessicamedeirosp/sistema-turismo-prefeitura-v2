import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { hasPermission, UserRole } from '@/lib/permissions'
import { authOptions } from '../../../auth/authOptions'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Apenas ADMIN e MODERATOR podem publicar
    if (!hasPermission(session.user.role as UserRole, 'approveBusinesses')) {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
    }

    const business = await prisma.business.update({
      where: { id: params.id },
      data: {
        status: 'APPROVED',
      },
    })

    return NextResponse.json({ success: true, business })
  } catch (error) {
    console.error('Error publishing business:', error)
    return NextResponse.json(
      { error: 'Erro ao publicar cadastro' },
      { status: 500 }
    )
  }
}
