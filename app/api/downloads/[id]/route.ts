import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '../../auth/authOptions'

// GET /api/downloads/[id] - Busca download específico
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const download = await prisma.download.findUnique({
      where: { id: params.id },
    })

    if (!download) {
      return NextResponse.json({ error: 'Download não encontrado' }, { status: 404 })
    }

    return NextResponse.json(download)
  } catch (error) {
    console.error('Erro ao buscar download:', error)
    return NextResponse.json({ error: 'Erro ao buscar download' }, { status: 500 })
  }
}

// PUT /api/downloads/[id] - Atualiza download (apenas ADMIN)
// Permite editar apenas: name e active
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { name, active } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Nome é obrigatório' },
        { status: 400 }
      )
    }

    const download = await prisma.download.update({
      where: { id: params.id },
      data: {
        name,
        active,
      },
    })

    return NextResponse.json(download)
  } catch (error) {
    console.error('Erro ao atualizar download:', error)
    return NextResponse.json({ error: 'Erro ao atualizar download' }, { status: 500 })
  }
}

// DELETE /api/downloads/[id] - Deleta download (apenas ADMIN)
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Busca o download para pegar a URL do PDF
    const download = await prisma.download.findUnique({
      where: { id: params.id },
    })

    if (!download) {
      return NextResponse.json({ error: 'Download não encontrado' }, { status: 404 })
    }

    // Deleta o PDF do blob storage
    if (download.link) {
      const { del } = await import('@vercel/blob')
      try {
        await del(download.link, { token: process.env.BLOB_READ_WRITE_TOKEN })
      } catch (blobError) {
        console.error('Erro ao deletar PDF do blob:', blobError)
        // Continue mesmo se falhar a deleção do blob
      }
    }

    // Deleta o registro do banco
    await prisma.download.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao deletar download:', error)
    return NextResponse.json({ error: 'Erro ao deletar download' }, { status: 500 })
  }
}
