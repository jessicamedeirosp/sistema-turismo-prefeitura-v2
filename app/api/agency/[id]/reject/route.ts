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

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
    })

    if (!user || !hasPermission(user.role as UserRole, 'rejectAgencies')) {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
    }

    const { reason } = await request.json()

    if (!reason) {
      return NextResponse.json({ error: 'Motivo é obrigatório' }, { status: 400 })
    }

    const agency = await prisma.agency.update({
      where: { id: params.id },
      data: {
        status: 'REJECTED',
        status_details: reason,
      },
    })

    return NextResponse.json({ success: true, agency })
  } catch (error) {
    console.error('Error rejecting agency:', error)
    return NextResponse.json({ error: 'Erro ao rejeitar agência' }, { status: 500 })
  }
}
