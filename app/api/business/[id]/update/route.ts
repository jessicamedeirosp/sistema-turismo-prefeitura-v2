import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { hasPermission, UserRole } from '@/lib/permissions'
import { authOptions } from '../../../auth/authOptions'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Apenas ADMIN e MODERATOR podem editar qualquer empresa
    if (!hasPermission(session.user.role as UserRole, 'editAnyBusiness')) {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
    }

    const body = await request.json()
    const { tags, ...businessData } = body

    // Atualiza a empresa
    const updatedBusiness = await prisma.business.update({
      where: { id: params.id },
      data: {
        ...businessData,
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

    return NextResponse.json({ success: true, business: updatedBusiness })
  } catch (error) {
    console.error('Error updating business:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar empresa' },
      { status: 500 }
    )
  }
}
