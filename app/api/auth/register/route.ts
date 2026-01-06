import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { generateAccessToken, generateRefreshToken, setAuthCookies } from '@/lib/auth'
import { z } from 'zod'
import { UserRole } from '@prisma/client'

const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string()
    .min(6, 'Senha deve ter no mínimo 6 caracteres')
    .regex(/[A-Z]/, 'Senha deve conter pelo menos uma letra maiúscula')
    .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Senha deve conter pelo menos um caractere especial'),
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  role: z.nativeEnum(UserRole, {
    required_error: 'Tipo de conta obrigatório',
  }),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validação
    const validation = registerSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      )
    }

    const { email, password, name, role } = validation.data

    // Verificar se usuário já existe
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email já cadastrado' },
        { status: 400 }
      )
    }

    // Hash da senha
    const password_hash = await bcrypt.hash(password, 10)

    // Criar usuário com role já definida
    const user = await prisma.user.create({
      data: {
        email,
        password_hash,
        name,
        role, // Role já vem do formulário de cadastro
      },
    })

    // Gerar tokens
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    }

    const accessToken = await generateAccessToken(payload)
    const refreshToken = await generateRefreshToken(payload)

    // Salvar em cookies httpOnly
    await setAuthCookies(accessToken, refreshToken)

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    })
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json(
      { error: 'Erro ao criar conta' },
      { status: 500 }
    )
  }
}
