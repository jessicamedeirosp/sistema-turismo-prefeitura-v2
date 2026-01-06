import { GET } from '@/app/api/beaches/route'

describe('/api/beaches', () => {
  it('should return approved beaches only', async () => {
    const request = new Request('http://localhost:3000/api/beaches')
    const response = await GET(request)
    const beaches = await response.json()

    expect(response.status).toBe(200)
    expect(Array.isArray(beaches)).toBe(true)
  })

  it('should support random query parameter', async () => {
    const request = new Request('http://localhost:3000/api/beaches?random=true')
    const response = await GET(request)

    expect(response.status).toBe(200)
  })

  it('should support limit query parameter', async () => {
    const request = new Request('http://localhost:3000/api/beaches?limit=4')
    const response = await GET(request)
    const beaches = await response.json()

    expect(beaches.length).toBeLessThanOrEqual(4)
  })

  it('should support district filter', async () => {
    const request = new Request('http://localhost:3000/api/beaches?district=Maresias')
    const response = await GET(request)

    expect(response.status).toBe(200)
  })

  it('should support tags filter', async () => {
    const request = new Request('http://localhost:3000/api/beaches?tags=Surf,Família')
    const response = await GET(request)

    expect(response.status).toBe(200)
  })
})
