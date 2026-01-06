/**
 * @jest-environment node
 */
import { GET, POST } from '@/app/api/tags/route'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'

jest.mock('next-auth')
jest.mock('@/lib/prisma', () => ({
  prisma: {
    tag: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}))

const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>

describe('Tags API - GET /api/tags', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return all tags', async () => {
    const mockTags = [
      {
        id: '1',
        name: 'Restaurante',
        category: 'FOOD',
        icon: 'Utensils',
        created_at: new Date(),
        _count: { businesses: 5 },
      },
      {
        id: '2',
        name: 'Hotel',
        category: 'ACCOMMODATION',
        icon: 'Hotel',
        created_at: new Date(),
        _count: { businesses: 3 },
      },
    ]

      ; (prisma.tag.findMany as jest.Mock).mockResolvedValue(mockTags)

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.tags).toEqual(mockTags)
    expect(prisma.tag.findMany).toHaveBeenCalledWith({
      include: {
        _count: {
          select: {
            businesses: true,
          },
        },
      },
      orderBy: [
        { category: 'asc' },
        { name: 'asc' },
      ],
    })
  })

  it('should handle errors', async () => {
    ; (prisma.tag.findMany as jest.Mock).mockRejectedValue(new Error('Database error'))

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Erro ao buscar tags')
  })
})

describe('Tags API - POST /api/tags', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should create a new tag when admin is authenticated', async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: '1', name: 'Admin', email: 'admin@test.com', role: 'ADMIN' },
      expires: '2024-12-31',
    })

    const mockTag = {
      id: '1',
      name: 'Cafeteria',
      category: 'FOOD',
      icon: 'Coffee',
      created_at: new Date(),
    }

      ; (prisma.tag.findUnique as jest.Mock).mockResolvedValue(null)
      ; (prisma.tag.create as jest.Mock).mockResolvedValue(mockTag)

    const request = new Request('http://localhost:3000/api/tags', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Cafeteria',
        category: 'FOOD',
        icon: 'Coffee',
      }),
    })

    const response = await POST(request as any)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.tag).toEqual(mockTag)
    expect(prisma.tag.create).toHaveBeenCalledWith({
      data: {
        name: 'Cafeteria',
        category: 'FOOD',
        icon: 'Coffee',
      },
    })
  })

  it('should return 403 when user is not admin', async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: '1', name: 'User', email: 'user@test.com', role: 'BUSINESS_FOOD' },
      expires: '2024-12-31',
    })

    const request = new Request('http://localhost:3000/api/tags', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test Tag',
        category: 'FOOD',
      }),
    })

    const response = await POST(request as any)
    const data = await response.json()

    expect(response.status).toBe(403)
    expect(data.error).toBe('Não autorizado')
  })

  it('should return 400 when name is missing', async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: '1', name: 'Admin', email: 'admin@test.com', role: 'ADMIN' },
      expires: '2024-12-31',
    })

    const request = new Request('http://localhost:3000/api/tags', {
      method: 'POST',
      body: JSON.stringify({
        category: 'FOOD',
      }),
    })

    const response = await POST(request as any)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Nome e categoria são obrigatórios')
  })

  it('should return 400 when category is invalid', async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: '1', name: 'Admin', email: 'admin@test.com', role: 'ADMIN' },
      expires: '2024-12-31',
    })

    const request = new Request('http://localhost:3000/api/tags', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test Tag',
        category: 'INVALID',
      }),
    })

    const response = await POST(request as any)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Categoria inválida')
  })

  it('should return 400 when tag name already exists', async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: '1', name: 'Admin', email: 'admin@test.com', role: 'ADMIN' },
      expires: '2024-12-31',
    })

      ; (prisma.tag.findUnique as jest.Mock).mockResolvedValue({
        id: '1',
        name: 'Restaurante',
        category: 'FOOD',
      })

    const request = new Request('http://localhost:3000/api/tags', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Restaurante',
        category: 'FOOD',
      }),
    })

    const response = await POST(request as any)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Já existe uma tag com este nome')
  })
})
