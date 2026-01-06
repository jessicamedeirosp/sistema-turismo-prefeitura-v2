import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { canManageBeaches } from '@/lib/permissions'
import { authOptions } from '../../auth/authOptions'
import { UserRole } from '@prisma/client'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// GET /api/beaches/admin - Lista todas as praias (admin)
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || !canManageBeaches(session.user.role as UserRole)) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
    }

    const beaches = await prisma.beach.findMany({
      include: {
        tags: {
          include: {
            tag: true
          }
        }
      },
      orderBy: { created_at: 'desc' }
    })

    return NextResponse.json(beaches)
  } catch (error) {
    console.error('Erro ao buscar praias:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar praias' },
      { status: 500 }
    )
  }
}

// POST /api/beaches/admin - Cria nova praia
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || !canManageBeaches(session.user.role as UserRole)) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
    }

    const body = await request.json()
    const { name, address_district, details, images, status, tagIds } = body

    if (!name || !address_district) {
      return NextResponse.json(
        { error: 'Nome e bairro são obrigatórios' },
        { status: 400 }
      )
    }

    const beach = await prisma.beach.create({
      data: {
        name,
        address_district,
        details: details || null,
        images: images || [],
        status: status || 'PENDING',
        tags: {
          create: (tagIds || []).map((tagId: string) => ({
            tag: {
              connect: { id: tagId }
            }
          }))
        }
      },
      include: {
        tags: {
          include: {
            tag: true
          }
        }
      }
    })

    return NextResponse.json(beach, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar praia:', error)
    return NextResponse.json(
      { error: 'Erro ao criar praia' },
      { status: 500 }
    )
  }
}
