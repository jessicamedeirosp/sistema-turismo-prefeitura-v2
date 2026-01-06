import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '../../auth/authOptions'

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

    // Admin pode buscar qualquer agência (retorna null se não tiver)
    // Outros usuários podem buscar apenas sua própria agência
    const agency = await prisma.agency.findFirst({
      where: { user_id: user.id },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    })

    // Retorna null se não encontrar agência (não é erro)
    return NextResponse.json({ agency })
  } catch (error) {
    console.error('Error fetching agency:', error)
    return NextResponse.json({ error: 'Erro ao buscar agência' }, { status: 500 })
  }
}
