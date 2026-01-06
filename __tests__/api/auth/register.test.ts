import { POST } from '@/app/api/auth/register/route'
import { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

// Mock do prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}))

// Mock do bcrypt
jest.mock('bcryptjs')

describe('POST /api/auth/register', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('cria um novo usuário com dados válidos', async () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
      role: 'BUSINESS_FOOD',
      password: 'hashedPassword',
      created_at: new Date(),
    }

      ; (prisma.user.findUnique as jest.Mock).mockResolvedValue(null)
      ; (prisma.user.create as jest.Mock).mockResolvedValue(mockUser)
      ; (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword')

    const request = new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'Test@123',
        name: 'Test User',
        role: 'BUSINESS_FOOD',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.message).toBe('Usuário criado com sucesso')
    expect(prisma.user.create).toHaveBeenCalled()
  })

  it('retorna erro se email já existe', async () => {
    ; (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: '1',
      email: 'existing@example.com',
    })

    const request = new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: 'existing@example.com',
        password: 'Test@123',
        name: 'Test User',
        role: 'BUSINESS_FOOD',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Email já cadastrado')
  })

  it('valida senha com requisitos', async () => {
    const request = new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'weak',
        name: 'Test User',
        role: 'BUSINESS_FOOD',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('Senha')
  })
})
