import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/beach-tags - Listar todas as tags de praia
export async function GET(request: NextRequest) {
  try {
    const tags = await prisma.beachTagModel.findMany({
      orderBy: { name: 'asc' }
    })
    return NextResponse.json(tags)
  } catch (error) {
    console.error('Error fetching beach tags:', error)
    return NextResponse.json({ error: 'Erro ao buscar tags de praia' }, { status: 500 })
  }
}