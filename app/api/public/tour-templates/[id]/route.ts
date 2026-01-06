import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/public/tour-templates/[id] - Busca um template de passeio pelo id
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const template = await prisma.tourTemplate.findUnique({
      where: { id: params.id },
    })
    if (!template) {
      return NextResponse.json({ error: 'Passeio não encontrado' }, { status: 404 })
    }
    return NextResponse.json(template)
  } catch (error) {
    console.error('Erro ao buscar tour template:', error)
    return NextResponse.json({ error: 'Erro ao buscar passeio' }, { status: 500 })
  }
}
