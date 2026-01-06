import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { hasPermission, UserRole } from '@/lib/permissions';
import { authOptions } from '../../auth/authOptions';

// GET /api/tours/[id] - Busca passeio específico
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const tour = await prisma.tour.findUnique({
      where: { id: params.id },
      include: {
        guide: {
          select: {
            id: true,
            name: true,
            type: true,
            email: true,
            phone_primary: true,
          },
        },
        auxiliary_guide: {
          select: {
            id: true,
            name: true,
            type: true,
            email: true,
            phone_primary: true,
          },
        },
      },
    });

    if (!tour) {
      return NextResponse.json({ error: 'Passeio não encontrado' }, { status: 404 });
    }

    const userRole = session.user.role as UserRole;

    // Guia só pode ver seus próprios passeios
    if (userRole === 'GUIDE') {
      const agency = await prisma.agency.findFirst({
        where: { user_id: session.user.id },
      });

      if (!agency || (tour.guide_id !== agency.id && tour.auxiliary_guide_id !== agency.id)) {
        return NextResponse.json({ error: 'Sem permissão para ver este passeio' }, { status: 403 });
      }
    }

    return NextResponse.json(tour);
  } catch (error) {
    console.error('Erro ao buscar passeio:', error);
    return NextResponse.json({ error: 'Erro ao buscar passeio' }, { status: 500 });
  }
}

// PUT /api/tours/[id] - Atualiza passeio
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
    const body = await req.json();

    // Busca o passeio existente
    const existingTour = await prisma.tour.findUnique({
      where: { id: params.id },
    });

    if (!existingTour) {
      return NextResponse.json({ error: 'Passeio não encontrado' }, { status: 404 });
    }

    // Verifica se tem permissão para editar qualquer passeio
    const canEditAny = hasPermission(userRole, 'editAnyTour');

    // Guia só pode editar seus próprios passeios
    if (hasPermission(userRole, 'manageOwnTours') && !canEditAny) {
      const agency = await prisma.agency.findFirst({
        where: { user_id: session.user.id },
      });

      if (!agency) {
        return NextResponse.json({ error: 'Agência não encontrada' }, { status: 404 });
      }

      if (existingTour.guide_id !== agency.id) {
        return NextResponse.json({ error: 'Sem permissão para editar este passeio' }, { status: 403 });
      }

      // Guia não pode editar status
      delete body.status;
      delete body.status_details;
    } else if (!canEditAny) {
      // Se não tem permissão para editar qualquer tour, sem permissão
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 });
    }

    // Admin pode atualizar status e status_details
    const updateData: any = {};

    if (body.auxiliary_guide_id !== undefined) updateData.auxiliary_guide_id = body.auxiliary_guide_id;
    if (body.date_time) updateData.date_time = new Date(body.date_time);
    if (body.address) updateData.address = body.address;
    if (body.visitor_profile) updateData.visitor_profile = body.visitor_profile;
    if (body.accommodation_type) updateData.accommodation_type = body.accommodation_type;
    if (body.request_date !== undefined) updateData.request_date = parseInt(body.request_date);
    if (body.stay_days !== undefined) updateData.stay_days = parseInt(body.stay_days);
    if (body.age_range) updateData.age_range = body.age_range;

    // Apenas quem pode aprovar tours pode atualizar status
    if (hasPermission(userRole, 'approveTours')) {
      if (body.status) updateData.status = body.status;
      if (body.status_details !== undefined) updateData.status_details = body.status_details;
    }

    const tour = await prisma.tour.update({
      where: { id: params.id },
      data: updateData,
      include: {
        guide: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
        auxiliary_guide: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
    });

    return NextResponse.json(tour);
  } catch (error) {
    console.error('Erro ao atualizar passeio:', error);
    return NextResponse.json({ error: 'Erro ao atualizar passeio' }, { status: 500 });
  }
}

// DELETE /api/tours/[id] - Cancela passeio
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

    // Busca o passeio existente
    const existingTour = await prisma.tour.findUnique({
      where: { id: params.id },
    });

    if (!existingTour) {
      return NextResponse.json({ error: 'Passeio não encontrado' }, { status: 404 });
    }

    // Guia só pode cancelar seus próprios passeios
    if (userRole === 'GUIDE') {
      const agency = await prisma.agency.findFirst({
        where: { user_id: session.user.id },
      });

      if (!agency || existingTour.guide_id !== agency.id) {
        return NextResponse.json({ error: 'Sem permissão para cancelar este passeio' }, { status: 403 });
      }

      // Guia não pode deletar, apenas marcar como rejeitado (cancelado)
      await prisma.tour.update({
        where: { id: params.id },
        data: {
          status: 'REJECTED',
          status_details: 'Cancelado pelo guia',
        },
      });

      return NextResponse.json({ message: 'Passeio cancelado com sucesso' });
    }

    // Admin pode deletar permanentemente
    await prisma.tour.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Passeio deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar passeio:', error);
    return NextResponse.json({ error: 'Erro ao deletar passeio' }, { status: 500 });
  }
}
