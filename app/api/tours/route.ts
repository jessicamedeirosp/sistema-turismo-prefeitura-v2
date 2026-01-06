import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { hasPermission, UserRole } from '@/lib/permissions';
import { authOptions } from '../auth/authOptions';

// GET /api/tours - Lista todos os passeios
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const userRole = session.user.role as UserRole;
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    // Admin vê todos, Guia vê apenas seus próprios passeios
    const where: any = {};

    if (userRole === 'GUIDE') {
      // Busca a agência do guia
      const agency = await prisma.agency.findFirst({
        where: { user_id: session.user.id },
      });

      if (!agency) {
        return NextResponse.json({ error: 'Agência não encontrada' }, { status: 404 });
      }

      where.OR = [
        { guide_id: agency.id },
        { auxiliary_guide_id: agency.id },
      ];
    }

    if (status) {
      where.status = status;
    }

    const tours = await prisma.tour.findMany({
      where,
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
      orderBy: { date_time: 'desc' },
    });

    return NextResponse.json(tours);
  } catch (error) {
    console.error('Erro ao buscar passeios:', error);
    return NextResponse.json({ error: 'Erro ao buscar passeios' }, { status: 500 });
  }
}

// POST /api/tours - Cria novo passeio (apenas GUIDE)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const userRole = session.user.role as UserRole;

    // Apenas guias podem criar passeios
    if (!hasPermission(userRole, 'createTours')) {
      return NextResponse.json({ error: 'Sem permissão para criar passeios' }, { status: 403 });
    }

    // Busca a agência do guia
    const agency = await prisma.agency.findFirst({
      where: { user_id: session.user.id },
    });

    if (!agency) {
      return NextResponse.json({ error: 'Agência não encontrada' }, { status: 404 });
    }

    // Verifica se a agência está aprovada
    if (agency.status !== 'APPROVED') {
      return NextResponse.json(
        { error: 'Sua agência precisa estar aprovada para criar passeios' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      auxiliary_guide_id,
      date_time,
      address,
      visitor_profile,
      accommodation_type,
      request_date,
      stay_days,
      age_range,
    } = body;

    // Validação básica
    if (!date_time || !address || !visitor_profile || !accommodation_type || !age_range) {
      return NextResponse.json({ error: 'Campos obrigatórios faltando' }, { status: 400 });
    }

    const tour = await prisma.tour.create({
      data: {
        guide_id: agency.id,
        auxiliary_guide_id: auxiliary_guide_id || null,
        date_time: new Date(date_time),
        address,
        visitor_profile,
        accommodation_type,
        request_date: parseInt(request_date) || 0,
        stay_days: parseInt(stay_days) || 0,
        age_range,
        status: 'PENDING',
      },
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

    return NextResponse.json(tour, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar passeio:', error);
    return NextResponse.json({ error: 'Erro ao criar passeio' }, { status: 500 });
  }
}
