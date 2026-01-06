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

    if (!user || !hasPermission(user.role as UserRole, 'approveAgencies')) {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
    }

    const agency = await prisma.agency.update({
      where: { id: params.id },
      data: {
        status: 'APPROVED',
        status_details: null,
      },
    })

    return NextResponse.json({ success: true, agency })
  } catch (error) {
    console.error('Error approving agency:', error)
    return NextResponse.json({ error: 'Erro ao aprovar agência' }, { status: 500 })
  }
}
