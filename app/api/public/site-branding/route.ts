import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const DEFAULT_BRANDING = {
  header_logo: '/logo-menu.png',
  header_logo_in_footer: false,
  footer_images: ['/observatorio-turismo.png', '/setur-prefeitura.png'],
}

type BrandingRow = {
  id: string
  header_logo: string
  header_logo_in_footer: boolean
  footer_images: string[]
}

// GET /api/public/site-branding - retorna branding para o site público
export async function GET() {
  try {
    const rows = await prisma.$queryRaw<BrandingRow[]>`
      SELECT id, header_logo, header_logo_in_footer, footer_images
      FROM site_branding
      ORDER BY created_at ASC
      LIMIT 1
    `
    const branding = rows?.[0]
    if (!branding) {
      return NextResponse.json(DEFAULT_BRANDING)
    }
    return NextResponse.json(branding)
  } catch (error) {
    console.error('Erro ao buscar branding:', error)
    return NextResponse.json(DEFAULT_BRANDING)
  }
}

