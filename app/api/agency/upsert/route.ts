import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { authOptions } from '../../auth/authOptions'

const agencySchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  type: z.enum(['AGENCY', 'GUIDE']),
  email: z.string().email('Email inválido'),
  phone_primary: z.string().min(1, 'Telefone é obrigatório'),
  phone_secondary: z.string().optional(),
  address_street: z.string().min(1, 'Endereço é obrigatório'),
  address_number: z.string().min(1, 'Número é obrigatório'),
  address_district: z.string().min(1, 'Bairro é obrigatório'),
  address_complement: z.string().optional(),
  cnpj_cpf: z.string().min(11, 'CPF/CNPJ inválido').max(14),
  credential: z.string().min(1, 'Credencial é obrigatória'),
  website: z.string().optional(),
  instagram: z.string().optional(),
  facebook: z.string().optional(),
  details: z.string().optional(),
  image: z.string().optional(),
  images: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
    })

    if (!user || user.role !== 'GUIDE') {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
    }

    const body = await request.json()
    const data = agencySchema.parse(body)

    // Verifica se já existe um cadastro
    const existingAgency = await prisma.agency.findFirst({
      where: { user_id: user.id },
    })

    let agency: Awaited<ReturnType<typeof prisma.agency.create>>

    if (existingAgency) {
      // Atualiza o cadastro existente
      agency = await prisma.agency.update({
        where: { id: existingAgency.id },
        data: {
          name: data.name,
          type: data.type,
          email: data.email,
          phone_primary: data.phone_primary,
          phone_secondary: data.phone_secondary,
          address_street: data.address_street,
          address_number: data.address_number,
          address_district: data.address_district,
          address_complement: data.address_complement,
          cnpj_cpf: data.cnpj_cpf,
          credential: data.credential,
          website: data.website,
          instagram: data.instagram,
          facebook: data.facebook,
          details: data.details,
          image: data.image,
          images: data.images,
          status: existingAgency.status === 'APPROVED' ? 'PENDING' : existingAgency.status,
        },
      })

      // Atualiza tags
      await prisma.agencyTag.deleteMany({
        where: { agency_id: agency.id },
      })

      if (data.tags.length > 0) {
        await prisma.agencyTag.createMany({
          data: data.tags.map((tagId) => ({
            agency_id: agency.id,
            tag_id: tagId,
          })),
        })
      }
    } else {
      // Cria novo cadastro
      agency = await prisma.agency.create({
        data: {
          name: data.name,
          type: data.type,
          email: data.email,
          phone_primary: data.phone_primary,
          phone_secondary: data.phone_secondary,
          address_street: data.address_street,
          address_number: data.address_number,
          address_district: data.address_district,
          address_complement: data.address_complement,
          cnpj_cpf: data.cnpj_cpf,
          credential: data.credential,
          website: data.website,
          instagram: data.instagram,
          facebook: data.facebook,
          details: data.details,
          image: data.image,
          images: data.images,
          user_id: user.id,
        },
      })

      // Adiciona tags
      if (data.tags.length > 0) {
        await prisma.agencyTag.createMany({
          data: data.tags.map((tagId) => ({
            agency_id: agency.id,
            tag_id: tagId,
          })),
        })
      }
    }

    return NextResponse.json({ success: true, agency })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }

    console.error('Error upserting agency:', error)
    return NextResponse.json({ error: 'Erro ao salvar agência' }, { status: 500 })
  }
}
