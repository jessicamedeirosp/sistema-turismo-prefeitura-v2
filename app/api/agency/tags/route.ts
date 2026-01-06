import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')

    const where: any = {}

    if (type && (type === 'AGENCY' || type === 'GUIDE')) {
      where.type = type
    }

    const tags = await prisma.agencyTagModel.findMany({
      where,
      orderBy: {
        name: 'asc',
      },
    })

    return NextResponse.json({ tags })
  } catch (error) {
    console.error('Error fetching agency tags:', error)
    return NextResponse.json({ error: 'Erro ao buscar tags' }, { status: 500 })
  }
}
