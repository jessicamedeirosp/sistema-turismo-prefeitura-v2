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

    // Apenas ADMIN e MODERATOR podem rejeitar
    if (!hasPermission(session.user.role as UserRole, 'rejectBusinesses')) {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
    }

    const body = await request.json()
    const { reason } = body

    if (!reason || !reason.trim()) {
      return NextResponse.json(
        { error: 'Motivo da rejeição é obrigatório' },
        { status: 400 }
      )
    }

    const business = await prisma.business.update({
      where: { id: params.id },
      data: {
        status: 'REJECTED',
        status_details: reason,
      },
    })

    return NextResponse.json({ success: true, business })
  } catch (error) {
    console.error('Error rejecting business:', error)
    return NextResponse.json(
      { error: 'Erro ao rejeitar cadastro' },
      { status: 500 }
    )
  }
}
