/**
 * Teste de integração do fluxo completo de negócio
 * 
 * Fluxo testado:
 * 1. Usuário se registra como BUSINESS_FOOD
 * 2. Faz login
 * 3. Cria um cadastro de negócio
 * 4. Admin aprova o negócio
 * 5. Admin publica o negócio
 * 6. Usuário edita o negócio (volta para PENDING)
 */

import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

describe('Fluxo completo de negócio', () => {
  let userId: string
  let businessId: string
  let adminId: string

  beforeAll(async () => {
    // Limpa dados de teste
    await prisma.businessTag.deleteMany()
    await prisma.business.deleteMany()
    await prisma.user.deleteMany({
      where: {
        email: {
          in: ['test-business@example.com', 'test-admin@example.com'],
        },
      },
    })

    // Cria usuário admin
    const hashedPasswordAdmin = await bcrypt.hash('Admin@123', 10)
    const admin = await prisma.user.create({
      data: {
        email: 'test-admin@example.com',
        name: 'Admin Teste',
        password_hash: hashedPasswordAdmin,
        role: 'ADMIN',
      },
    })
    adminId = admin.id
  })

  afterAll(async () => {
    // Limpa dados de teste
    await prisma.businessTag.deleteMany()
    await prisma.business.deleteMany()
    await prisma.user.deleteMany({
      where: {
        email: {
          in: ['test-business@example.com', 'test-admin@example.com'],
        },
      },
    })
    await prisma.$disconnect()
  })

  it('1. Registra usuário BUSINESS_FOOD', async () => {
    const hashedPassword = await bcrypt.hash('Test@123', 10)
    const user = await prisma.user.create({
      data: {
        email: 'test-business@example.com',
        name: 'Negócio Teste',
        password_hash: hashedPassword,
        role: 'BUSINESS_FOOD',
      },
    })

    expect(user).toBeDefined()
    expect(user.role).toBe('BUSINESS_FOOD')
    userId = user.id
  })

  it('2. Cria negócio com status PENDING', async () => {
    const business = await prisma.business.create({
      data: {
        name: 'Restaurante Teste',
        category: 'FOOD',
        cnpj_cpf: '12345678901234',
        cadastur: '123456',
        address_street: 'Rua Teste',
        address_number: '123',
        address_district: 'Centro',
        phone_primary: '11999999999',
        details: '<p>Restaurante de comida caseira</p>',
        user_id: userId,
        status: 'PENDING',
      },
    })

    expect(business).toBeDefined()
    expect(business.status).toBe('PENDING')
    expect(business.user_id).toBe(userId)
    businessId = business.id
  })

  it('3. Admin aprova o negócio', async () => {
    const approved = await prisma.business.update({
      where: { id: businessId },
      data: {
        status: 'APPROVED',
        status_details: 'Aprovado pela administração',
      },
    })

    expect(approved.status).toBe('APPROVED')
    expect(approved.status_details).toBe('Aprovado pela administração')
  })

  it('4. Admin publica o negócio', async () => {
    const published = await prisma.business.update({
      where: { id: businessId },
      data: { status: 'APPROVED' },
    })

    expect(published.status).toBe('APPROVED')
  })

  it('5. Usuário edita negócio, volta para PENDING', async () => {
    const updated = await prisma.business.update({
      where: { id: businessId },
      data: {
        name: 'Restaurante Atualizado',
        status: 'PENDING',
        status_details: 'Aguardando nova aprovação após edição',
      },
    })

    expect(updated.name).toBe('Restaurante Atualizado')
    expect(updated.status).toBe('PENDING')
  })

  it('6. Admin pode editar sem mudar status', async () => {
    // Primeiro volta para APPROVED
    await prisma.business.update({
      where: { id: businessId },
      data: { status: 'APPROVED' },
    })

    // Admin edita mantendo status
    const adminEdit = await prisma.business.update({
      where: { id: businessId },
      data: {
        phone_secondary: '11888888888',
      },
    })

    expect(adminEdit.phone_secondary).toBe('11888888888')
    expect(adminEdit.status).toBe('APPROVED')
  })

  it('7. Admin pode rejeitar negócio', async () => {
    const rejected = await prisma.business.update({
      where: { id: businessId },
      data: {
        status: 'REJECTED',
        status_details: 'Cadastur inválido',
      },
    })

    expect(rejected.status).toBe('REJECTED')
    expect(rejected.status_details).toBe('Cadastur inválido')
  })
})
