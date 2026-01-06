/**
 * @jest-environment node
 */
import { GET, PUT, DELETE } from '@/app/api/tags/[id]/route'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'

jest.mock('next-auth')
jest.mock('@/lib/prisma', () => ({
  prisma: {
    tag: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}))

const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>

describe('Tag Detail API - GET /api/tags/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return tag by id', async () => {
    const mockTag = {
      id: '1',
      name: 'Restaurante',
      category: 'FOOD',
      icon: 'Utensils',
      created_at: new Date(),
      _count: { businesses: 5 },
    }

      ; (prisma.tag.findUnique as jest.Mock).mockResolvedValue(mockTag)

    const response = await GET({} as any, { params: { id: '1' } })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.tag).toEqual(mockTag)
  })

  it('should return 404 when tag not found', async () => {
    ; (prisma.tag.findUnique as jest.Mock).mockResolvedValue(null)

    const response = await GET({} as any, { params: { id: 'invalid' } })
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error).toBe('Tag não encontrada')
  })
})

describe('Tag Detail API - PUT /api/tags/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should update tag when admin is authenticated', async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: '1', name: 'Admin', email: 'admin@test.com', role: 'ADMIN' },
      expires: '2024-12-31',
    })

    const existingTag = {
      id: '1',
      name: 'Restaurante',
      category: 'FOOD',
      icon: 'Utensils',
    }

    const updatedTag = {
      ...existingTag,
      name: 'Restaurante Atualizado',
    }

      ; (prisma.tag.findUnique as jest.Mock).mockResolvedValue(existingTag)
      ; (prisma.tag.findFirst as jest.Mock).mockResolvedValue(null)
      ; (prisma.tag.update as jest.Mock).mockResolvedValue(updatedTag)

    const request = new Request('http://localhost:3000/api/tags/1', {
      method: 'PUT',
      body: JSON.stringify({
        name: 'Restaurante Atualizado',
        category: 'FOOD',
        icon: 'Utensils',
      }),
    })

    const response = await PUT(request as any, { params: { id: '1' } })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.tag.name).toBe('Restaurante Atualizado')
  })

  it('should return 403 when user is not admin', async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: '1', name: 'User', email: 'user@test.com', role: 'BUSINESS_FOOD' },
      expires: '2024-12-31',
    })

    const request = new Request('http://localhost:3000/api/tags/1', {
      method: 'PUT',
      body: JSON.stringify({ name: 'Test', category: 'FOOD' }),
    })

    const response = await PUT(request as any, { params: { id: '1' } })
    const data = await response.json()

    expect(response.status).toBe(403)
    expect(data.error).toBe('Não autorizado')
  })

  it('should return 400 when duplicate name', async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: '1', name: 'Admin', email: 'admin@test.com', role: 'ADMIN' },
      expires: '2024-12-31',
    })

      ; (prisma.tag.findUnique as jest.Mock).mockResolvedValue({ id: '1', name: 'Tag 1' })
      ; (prisma.tag.findFirst as jest.Mock).mockResolvedValue({ id: '2', name: 'Duplicate' })

    const request = new Request('http://localhost:3000/api/tags/1', {
      method: 'PUT',
      body: JSON.stringify({ name: 'Duplicate', category: 'FOOD' }),
    })

    const response = await PUT(request as any, { params: { id: '1' } })
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Já existe uma tag com este nome')
  })
})

describe('Tag Detail API - DELETE /api/tags/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should delete tag when admin is authenticated', async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: '1', name: 'Admin', email: 'admin@test.com', role: 'ADMIN' },
      expires: '2024-12-31',
    })

      ; (prisma.tag.findUnique as jest.Mock).mockResolvedValue({
        id: '1',
        name: 'Test Tag',
        _count: { businesses: 0 },
      })
      ; (prisma.tag.delete as jest.Mock).mockResolvedValue({ id: '1' })

    const response = await DELETE({} as any, { params: { id: '1' } })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.message).toBe('Tag excluída com sucesso')
    expect(prisma.tag.delete).toHaveBeenCalledWith({ where: { id: '1' } })
  })

  it('should return 403 when user is not admin', async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: '1', name: 'User', email: 'user@test.com', role: 'BUSINESS_FOOD' },
      expires: '2024-12-31',
    })

    const response = await DELETE({} as any, { params: { id: '1' } })
    const data = await response.json()

    expect(response.status).toBe(403)
    expect(data.error).toBe('Não autorizado')
  })

  it('should return 404 when tag not found', async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: '1', name: 'Admin', email: 'admin@test.com', role: 'ADMIN' },
      expires: '2024-12-31',
    })

      ; (prisma.tag.findUnique as jest.Mock).mockResolvedValue(null)

    const response = await DELETE({} as any, { params: { id: 'invalid' } })
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error).toBe('Tag não encontrada')
  })
})
