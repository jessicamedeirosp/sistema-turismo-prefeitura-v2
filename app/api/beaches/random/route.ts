import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Status } from '@prisma/client'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '4')

    // Buscar todas as praias ativas
    const beaches = await prisma.beach.findMany({
      where: {
        status: Status.APPROVED
      },
      include: {
        tags: {
          include: {
            tag: true
          }
        }
      }
    })

    // Embaralhar e pegar apenas o limite solicitado
    const shuffled = beaches.sort(() => 0.5 - Math.random())
    const selected = shuffled.slice(0, limit)

    return NextResponse.json(selected)
  } catch (error) {
    console.error('Error fetching random beaches:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar praias' },
      { status: 500 }
    )
  }
}
