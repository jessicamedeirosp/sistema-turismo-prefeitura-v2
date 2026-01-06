import { put, del } from '@vercel/blob'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 })
    }

    // Verifica tipo de arquivo
    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Apenas arquivos PDF são permitidos' }, { status: 400 })
    }

    // Verifica tamanho (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'Arquivo muito grande (máx 10MB)' }, { status: 400 })
    }

    // Gera nome único com timestamp e random
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const uniqueFileName = `pdf-${timestamp}-${randomString}-${originalName}`

    const blob = await put(uniqueFileName, file, {
      access: 'public',
      addRandomSuffix: false,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    })

    return NextResponse.json({ url: blob.url })
  } catch (error) {
    console.error('Erro no upload do PDF:', error)
    return NextResponse.json({ error: 'Erro ao fazer upload' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json({ error: 'URL não fornecida' }, { status: 400 })
    }

    await del(url, { token: process.env.BLOB_READ_WRITE_TOKEN })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao deletar PDF:', error)
    return NextResponse.json({ error: 'Erro ao deletar arquivo' }, { status: 500 })
  }
}
