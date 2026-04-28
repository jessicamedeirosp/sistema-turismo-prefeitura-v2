import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/authOptions'
import { randomUUID } from 'crypto'

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

async function getBranding(): Promise<BrandingRow | null> {
  const rows = await prisma.$queryRaw<BrandingRow[]>`
    SELECT id, header_logo, header_logo_in_footer, footer_images
    FROM site_branding
    ORDER BY created_at ASC
    LIMIT 1
  `
  return rows?.[0] || null
}

async function ensureBranding() {
  const existing = await getBranding()
  if (existing) return existing

  const id = randomUUID()
  const inserted = await prisma.$queryRaw<BrandingRow[]>`
    INSERT INTO site_branding (
      id,
      header_logo,
      header_logo_in_footer,
      footer_images,
      created_at,
      updated_at
    )
    VALUES (
      ${id},
      ${DEFAULT_BRANDING.header_logo},
      ${DEFAULT_BRANDING.header_logo_in_footer},
      ${DEFAULT_BRANDING.footer_images},
      now(),
      now()
    )
    RETURNING id, header_logo, header_logo_in_footer, footer_images
  `
  return inserted[0]
}

// GET /api/site-branding - retorna branding (admin only)
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  }

  try {
    const branding = await ensureBranding()
    return NextResponse.json(branding)
  } catch (error) {
    console.error('Erro ao buscar branding (admin):', error)
    return NextResponse.json({ error: 'Erro ao buscar branding' }, { status: 500 })
  }
}

// PUT /api/site-branding - atualiza branding (admin only)
export async function PUT(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const { header_logo, header_logo_in_footer, footer_images } = body || {}

    const branding = await ensureBranding()

    // Update parcial:
    // - se não vier no body, mantém o valor atual
    // - se vier vazio, volta ao default
    const nextHeaderLogo =
      header_logo === undefined
        ? branding.header_logo
        : (typeof header_logo === 'string' && header_logo.trim().length > 0 ? header_logo : DEFAULT_BRANDING.header_logo)

    const nextHeaderLogoInFooter =
      header_logo_in_footer === undefined ? branding.header_logo_in_footer : !!header_logo_in_footer

    const nextFooterImages =
      footer_images === undefined
        ? branding.footer_images
        : (Array.isArray(footer_images) ? footer_images : DEFAULT_BRANDING.footer_images)

    const updated = await prisma.$queryRaw<BrandingRow[]>`
      UPDATE site_branding
      SET
        header_logo = ${nextHeaderLogo},
        header_logo_in_footer = ${nextHeaderLogoInFooter},
        footer_images = ${nextFooterImages},
        updated_at = now()
      WHERE id = ${branding.id}
      RETURNING id, header_logo, header_logo_in_footer, footer_images
    `

    if (!updated?.[0]) {
      return NextResponse.json({ error: 'Falha ao salvar branding' }, { status: 500 })
    }

    return NextResponse.json(updated[0])
  } catch (error) {
    console.error('Erro ao atualizar branding (admin):', error)
    return NextResponse.json({ error: 'Erro ao atualizar branding' }, { status: 500 })
  }
}

