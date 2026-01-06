import { POST } from '@/app/api/business/upsert/route'
import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'

// Mock das dependências
jest.mock('next-auth')
jest.mock('@/lib/prisma', () => ({
  prisma: {
    business: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    businessTag: {
      deleteMany: jest.fn(),
      createMany: jest.fn(),
    },
  },
}))

describe('POST /api/business/upsert', () => {
  const mockSession = {
    user: {
      id: 'user-123',
      email: 'business@example.com',
      role: 'BUSINESS_FOOD',
    },
  }

  beforeEach(() => {
    jest.clearAllMocks()
      ; (getServerSession as jest.Mock).mockResolvedValue(mockSession)
  })

  it('cria um novo negócio', async () => {
    const mockBusiness = {
      id: 'business-123',
      name: 'Restaurante Teste',
      category: 'FOOD',
      status: 'PENDING',
      user_id: 'user-123',
    }

      ; (prisma.business.findFirst as jest.Mock).mockResolvedValue(null)
      ; (prisma.business.create as jest.Mock).mockResolvedValue(mockBusiness)

    const request = new NextRequest('http://localhost:3000/api/business/upsert', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Restaurante Teste',
        category: 'FOOD',
        cnpj_cpf: '12345678901234',
        cadastur: '123456',
        address_street: 'Rua Teste',
        address_number: '123',
        address_district: 'Centro',
        phone_primary: '11999999999',
        tags: [],
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.business.name).toBe('Restaurante Teste')
    expect(prisma.business.create).toHaveBeenCalled()
  })

  it('atualiza negócio existente', async () => {
    const existingBusiness = {
      id: 'business-123',
      name: 'Restaurante Antigo',
      user_id: 'user-123',
      status: 'APPROVED',
    }

    const updatedBusiness = {
      ...existingBusiness,
      name: 'Restaurante Atualizado',
      status: 'PENDING',
    }

      ; (prisma.business.findFirst as jest.Mock).mockResolvedValue(existingBusiness)
      ; (prisma.business.update as jest.Mock).mockResolvedValue(updatedBusiness)

    const request = new NextRequest('http://localhost:3000/api/business/upsert', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Restaurante Atualizado',
        category: 'FOOD',
        cnpj_cpf: '12345678901234',
        cadastur: '123456',
        address_street: 'Rua Teste',
        address_number: '123',
        address_district: 'Centro',
        phone_primary: '11999999999',
        tags: [],
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.business.name).toBe('Restaurante Atualizado')
    expect(data.business.status).toBe('PENDING')
    expect(prisma.business.update).toHaveBeenCalled()
  })

  it('retorna erro se não autenticado', async () => {
    ; (getServerSession as jest.Mock).mockResolvedValue(null)

    const request = new NextRequest('http://localhost:3000/api/business/upsert', {
      method: 'POST',
      body: JSON.stringify({}),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Não autorizado')
  })
})
