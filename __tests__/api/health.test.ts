import { GET } from '@/app/api/health/route'
import { prisma } from '@/lib/prisma'

// Mock do Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    $queryRaw: jest.fn(),
  },
}))

describe('API Health Check', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return status ok when database is connected', async () => {
    // Mock da query bem-sucedida
    ; (prisma.$queryRaw as jest.Mock).mockResolvedValue([{ 1: 1 }])

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toHaveProperty('status', 'ok')
    expect(data).toHaveProperty('database', 'conectado')
    expect(data).toHaveProperty('timestamp')
  })

  it('should return error status when database fails', async () => {
    // Mock de erro no banco
    ; (prisma.$queryRaw as jest.Mock).mockRejectedValue(
      new Error('Connection failed')
    )

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data).toHaveProperty('status', 'error')
    expect(data).toHaveProperty('message')
  })
})
