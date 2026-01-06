import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    if (!id) return NextResponse.json({ error: 'ID não informado' }, { status: 400 })
    const guide = await prisma.agency.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        details: true,
        images: true,
        type: true,
        status: true,
        email: true,
        phone_primary: true,
        phone_secondary: true,
        address_street: true,
        address_number: true,
        address_district: true,
        address_complement: true,
        cnpj_cpf: true,
        credential: true,
        website: true,
        instagram: true,
        facebook: true,
        tags: {
          select: {
            tag: {
              select: { id: true, name: true, icon: true }
            }
          }
        },
      },
    })
    if (!guide || guide.type !== 'GUIDE' || guide.status !== 'APPROVED') {
      return NextResponse.json({ error: 'Guia não encontrado' }, { status: 404 })
    }
    return NextResponse.json({
      ...guide,
      tags: guide.tags.map(t => t.tag)
    })
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar guia' }, { status: 500 })
  }
}
