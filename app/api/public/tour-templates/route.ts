import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/public/tour-templates - Lista todos os templates de passeios públicos
export async function GET() {
  try {
    const templates = await prisma.tourTemplate.findMany({
      orderBy: { name: 'asc' },
    })
    return NextResponse.json(templates)
  } catch (error) {
    console.error('Erro ao buscar tour templates:', error)
    return NextResponse.json({ error: 'Erro ao buscar templates' }, { status: 500 })
  }
}
