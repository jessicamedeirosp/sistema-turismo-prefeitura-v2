import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Executa todas as requisições em paralelo
    const base = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const [
      homeRes,
      beachesRes,
      restaurantsRes,
      accommodationsRes,
      eventsRes,
      newsRes,
      toursRes
    ] = await Promise.all([
      fetch(`${base}/api/public/common-pages?page=HOME`),
      fetch(`${base}/api/public/beaches`),
      fetch(`${base}/api/public/businesses?category=FOOD`),
      fetch(`${base}/api/public/businesses?category=ACCOMMODATION`),
      fetch(`${base}/api/public/events`),
      fetch(`${base}/api/public/news`),
      fetch(`${base}/api/public/tours`)
    ])


    let homeData: { video?: string } = {}
    if (homeRes.ok) {
      const json = await homeRes.json()
      // Defensive: if error returned, treat as empty
      if (!json.error) homeData = json
    }
    const beaches = beachesRes.ok ? await beachesRes.json() : []
    const restaurants = restaurantsRes.ok ? await restaurantsRes.json() : []
    const accommodations = accommodationsRes.ok ? await accommodationsRes.json() : []
    const events = eventsRes.ok ? await eventsRes.json() : []
    const news = newsRes.ok ? await newsRes.json() : []
    const tours = toursRes.ok ? await toursRes.json() : []

    return NextResponse.json({
      homeVideo: homeData.video || '',
      beaches,
      restaurants,
      accommodations,
      events,
      news,
      tours
    })
  } catch (error) {
    console.error('Erro ao buscar dados da home:', error)
    return NextResponse.json({ error: 'Erro ao buscar dados da home.', details: error instanceof Error ? error.message : String(error) }, { status: 500 })
  }
}
