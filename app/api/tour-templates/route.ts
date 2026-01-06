import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { hasPermission, UserRole } from '@/lib/permissions';
import { authOptions } from '../auth/authOptions';

// GET /api/tour-templates - Lista todos os templates de passeios
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const dashboard = searchParams.get('dashboard') === 'true'

    // Se for dashboard, verificar autenticação admin
    if (dashboard) {
      const session = await getServerSession(authOptions)
      if (!session || session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
      }

      // Retorna todos os templates
      const tourTemplates = await prisma.tourTemplate.findMany({
        orderBy: { name: 'asc' },
      })
      return NextResponse.json(tourTemplates)
    }

    const tourTemplates = await prisma.tourTemplate.findMany({
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(tourTemplates);
  } catch (error) {
    console.error('Erro ao buscar templates de passeios:', error);
    return NextResponse.json({ error: 'Erro ao buscar templates de passeios' }, { status: 500 });
  }
}

// POST /api/tour-templates - Cria novo template (apenas ADMIN)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const userRole = session.user.role as UserRole;

    // Apenas admin pode criar templates
    if (!hasPermission(userRole, 'viewAllTours')) {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 });
    }

    const body = await req.json();
    const { name, description, images, requires_guide } = body;

    if (!name) {
      return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 });
    }

    const tourTemplate = await prisma.tourTemplate.create({
      data: {
        name,
        description: description || null,
        images: images || [],
        requires_guide: requires_guide || false,
      },
    });

    return NextResponse.json(tourTemplate, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar template de passeio:', error);
    return NextResponse.json({ error: 'Erro ao criar template de passeio' }, { status: 500 });
  }
}
