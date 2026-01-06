import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { hasPermission, UserRole } from '@/lib/permissions';
import { authOptions } from '../../auth/authOptions';

// GET /api/tour-templates/[id] - Busca template específico
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tourTemplate = await prisma.tourTemplate.findUnique({
      where: { id: params.id },
    });

    if (!tourTemplate) {
      return NextResponse.json({ error: 'Template não encontrado' }, { status: 404 });
    }

    return NextResponse.json(tourTemplate);
  } catch (error) {
    console.error('Erro ao buscar template:', error);
    return NextResponse.json({ error: 'Erro ao buscar template' }, { status: 500 });
  }
}

// PUT /api/tour-templates/[id] - Atualiza template (apenas ADMIN)
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const userRole = session.user.role as UserRole;

    if (!hasPermission(userRole, 'viewAllTours')) {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 });
    }

    const body = await req.json();
    const { name, description, images, requires_guide } = body;

    const tourTemplate = await prisma.tourTemplate.update({
      where: { id: params.id },
      data: {
        name: name || undefined,
        description: description !== undefined ? description : undefined,
        images: images || undefined,
        requires_guide: requires_guide !== undefined ? requires_guide : undefined,
      },
    });

    return NextResponse.json(tourTemplate);
  } catch (error) {
    console.error('Erro ao atualizar template:', error);
    return NextResponse.json({ error: 'Erro ao atualizar template' }, { status: 500 });
  }
}

// DELETE /api/tour-templates/[id] - Deleta template (apenas ADMIN)
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const userRole = session.user.role as UserRole;

    if (!hasPermission(userRole, 'viewAllTours')) {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 });
    }

    await prisma.tourTemplate.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Template deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar template:', error);
    return NextResponse.json({ error: 'Erro ao deletar template' }, { status: 500 });
  }
}
