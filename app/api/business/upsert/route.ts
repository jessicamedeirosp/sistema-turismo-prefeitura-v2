import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '../../auth/authOptions'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    const body = await request.json()
    const { tags, ...businessData } = body

    // Verifica se já existe um cadastro
    const existingBusiness = await prisma.business.findFirst({
      where: { user_id: user.id },
    })

    if (existingBusiness) {
      // Atualiza o cadastro existente e volta para PENDING
      const updatedBusiness = await prisma.business.update({
        where: { id: existingBusiness.id },
        data: {
          ...businessData,
          status: 'PENDING', // Volta para pendente ao editar
          status_details: null, // Limpa detalhes de rejeição anterior
          updated_at: new Date(),
        },
      })

      // Atualiza tags
      if (tags && Array.isArray(tags)) {
        // Remove tags antigas
        await prisma.businessTag.deleteMany({
          where: { business_id: updatedBusiness.id },
        })

        // Adiciona novas tags
        if (tags.length > 0) {
          await prisma.businessTag.createMany({
            data: tags.map((tagId: string) => ({
              business_id: updatedBusiness.id,
              tag_id: tagId,
            })),
          })
        }
      }

      return NextResponse.json({ success: true, business: updatedBusiness, isNew: false })
    } else {
      // Cria novo cadastro
      const newBusiness = await prisma.business.create({
        data: {
          ...businessData,
          user_id: user.id,
          status: 'PENDING',
          images: businessData.images || [],
        },
      })

      // Adiciona tags
      if (tags && Array.isArray(tags) && tags.length > 0) {
        await prisma.businessTag.createMany({
          data: tags.map((tagId: string) => ({
            business_id: newBusiness.id,
            tag_id: tagId,
          })),
        })
      }

      return NextResponse.json({ success: true, business: newBusiness, isNew: true })
    }
  } catch (error) {
    console.error('Erro ao salvar negócio:', error)
    return NextResponse.json({ error: 'Erro ao processar solicitação' }, { status: 500 })
  }
}
