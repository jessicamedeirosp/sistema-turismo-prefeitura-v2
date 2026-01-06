import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { authOptions } from '../auth/authOptions'

// GET /api/users - Lista todos os usuários (apenas ADMIN pode ver)
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Pega o filtro de role da query string
    const { searchParams } = new URL(request.url)
    const roleFilter = searchParams.get('role')

    const users = await prisma.user.findMany({
      where: roleFilter ? { role: roleFilter as any } : {},
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        first_login: true,
        created_at: true,
        updated_at: true,
        // Não retorna password_hash por segurança
      },
      orderBy: { created_at: 'desc' },
    })

    return NextResponse.json(users)
  } catch (error) {
    console.error('Erro ao buscar usuários:', error)
    return NextResponse.json({ error: 'Erro ao buscar usuários' }, { status: 500 })
  }
}

// POST /api/users - Cria novo usuário ADMIN (apenas ADMIN pode criar)
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { name, email, role } = body

    if (!name || !email || !role) {
      return NextResponse.json(
        { error: 'Nome, email e tipo de usuário são obrigatórios' },
        { status: 400 }
      )
    }

    // Valida role
    const validRoles = ['ADMIN', 'MODERATOR', 'BUSINESS_FOOD', 'BUSINESS_ACCOMMODATION', 'GUIDE']
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Tipo de usuário inválido' },
        { status: 400 }
      )
    }

    // Verifica se email já existe
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Este email já está em uso' },
        { status: 400 }
      )
    }

    // Senha padrão: "Admin@123"
    const defaultPassword = 'Admin@123'
    const password_hash = await bcrypt.hash(defaultPassword, 10)

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password_hash,
        role,
        first_login: role === 'ADMIN', // Apenas ADMIN precisa redefinir senha no primeiro acesso
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        first_login: true,
        created_at: true,
      },
    })

    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar usuário:', error)
    return NextResponse.json({ error: 'Erro ao criar usuário' }, { status: 500 })
  }
}
