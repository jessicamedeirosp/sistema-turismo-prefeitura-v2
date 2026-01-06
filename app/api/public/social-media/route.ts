import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const socialMedia = await prisma.socialMedia.findMany({
      where: { active: true },
      orderBy: { created_at: 'asc' },
    })

    return NextResponse.json(socialMedia)
  } catch (error) {
    console.error('Error fetching social media:', error)
    return NextResponse.json({ error: 'Erro ao buscar redes sociais' }, { status: 500 })
  }
}
