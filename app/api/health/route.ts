import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Testa a conexão com o banco
    await prisma.$queryRaw`SELECT 1`

    return NextResponse.json({
      status: 'ok',
      message: 'API rodando com sucesso',
      database: 'conectado',
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        message: 'Erro na conexão com o banco de dados',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    )
  }
}
