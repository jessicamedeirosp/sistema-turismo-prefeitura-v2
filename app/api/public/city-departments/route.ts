import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const departments = await prisma.cityDepartment.findMany({
      where: { active: true },
      orderBy: { department: 'asc' },
    })
    return NextResponse.json(departments)
  } catch (error) {
    console.error('Erro ao buscar departamentos:', error)
    return NextResponse.json({ error: 'Erro ao buscar departamentos' }, { status: 500 })
  }
}
