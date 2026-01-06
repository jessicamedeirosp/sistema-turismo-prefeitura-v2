import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { canManageBeaches, UserRole } from '@/lib/permissions'
import { authOptions } from '../auth/authOptions'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// GET /api/beaches - Lista praias (dashboard com auth ou público filtrado)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const dashboard = searchParams.get('dashboard') === 'true'
    const limit = searchParams.get('limit')
    const random = searchParams.get('random') === 'true'
    const district = searchParams.get('district')
    const tags = searchParams.get('tags')?.split(',').filter(Boolean)

    // Se for requisição do dashboard, verifica autenticação
    if (dashboard) {
      const session = await getServerSession(authOptions)

      if (!session?.user) {
        return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
      }

      if (!canManageBeaches(session.user.role as UserRole)) {
        return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
      }

      // Retorna todas as praias para o dashboard
      const beaches = await prisma.beach.findMany({
        include: {
          tags: {
            include: {
              tag: true
            }
          }
        },
        orderBy: [
          { status: 'asc' },
          { created_at: 'desc' }
        ]
      })

      return NextResponse.json(beaches)
    }

    const where: any = {
      status: 'APPROVED'
    }

    if (district) {
      where.address_district = district
    }

    if (tags && tags.length > 0) {
      where.tags = {
        some: {
          tag: {
            name: {
              in: tags
            }
          }
        }
      }
    }

    let beaches = await prisma.beach.findMany({
      where,
      include: {
        tags: {
          include: {
            tag: true
          }
        }
      },
      orderBy: random ? undefined : { created_at: 'desc' }
    })

    // Se random=true, embaralha os resultados
    if (random) {
      beaches = beaches.sort(() => Math.random() - 0.5)
    }

    // Aplica o limite se fornecido
    if (limit) {
      beaches = beaches.slice(0, parseInt(limit))
    }

    // Formata a resposta
    const formatted = beaches.map(beach => ({
      id: beach.id,
      name: beach.name,
      district: beach.address_district,
      details: beach.details,
      images: beach.images,
      tags: beach.tags.map(t => ({
        id: t.tag.id,
        name: t.tag.name,
        icon: t.tag.icon
      }))
    }))

    return NextResponse.json(formatted)
  } catch (error) {
    console.error('Erro ao buscar praias:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar praias' },
      { status: 500 }
    )
  }
}
