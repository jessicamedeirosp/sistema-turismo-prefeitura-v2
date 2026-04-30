import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const business = await prisma.business.findFirst({
      where: { id, status: 'APPROVED', category: 'SERVICES' },
      select: {
        id: true,
        name: true,
        images: true,
        details: true,
        phone_primary: true,
        phone_secondary: true,
        website: true,
        instagram: true,
        facebook: true,
        address_street: true,
        address_number: true,
        address_district: true,
        address_complement: true,
        cnpj_cpf: true,
        cadastur: true,
        coupon: true,
        tags: {
          select: {
            tag: { select: { id: true, name: true, icon: true } }
          }
        },
      },
    })

    if (!business) {
      return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })
    }

    const tags = business.tags?.map((item: any) => item.tag) || []
    return NextResponse.json({ ...business, tags })
  } catch (error) {
    console.error('Erro ao buscar detalhe do serviço:', error)
    return NextResponse.json({ error: 'Erro ao buscar detalhe' }, { status: 500 })
  }
}
