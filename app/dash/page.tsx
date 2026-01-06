import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Building2, UtensilsCrossed, Hotel, Clock, MapPin, Users, CheckCircle, Edit, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { authOptions } from '../api/auth/authOptions'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth')
  }

  const role = session.user.role

  // Busca o usuário pelo email
  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
  })

  if (!user) {
    redirect('/auth')
  }

  // Dashboard para ADMIN e MODERATOR (Administrador)
  if (role === 'ADMIN' || role === 'MODERATOR') {
    // Buscar estatísticas reais
    const totalBusinesses = await prisma.business.count()
    const pendingBusinesses = await prisma.business.count({
      where: { status: 'PENDING' },
    })
    const approvedBusinesses = await prisma.business.count({
      where: { status: 'APPROVED' },
    })
    const totalUsers = await prisma.user.count({
      where: {
        role: {
          in: ['BUSINESS_FOOD', 'BUSINESS_ACCOMMODATION', 'GUIDE'],
        },
      },
    })

    const stats = [
      {
        label: 'Total de Empresas',
        value: totalBusinesses.toString(),
        icon: Building2,
        color: 'bg-blue-500',
      },
      {
        label: 'Aprovadas',
        value: approvedBusinesses.toString(),
        icon: CheckCircle,
        color: 'bg-green-500',
      },
      {
        label: 'Usuários',
        value: totalUsers.toString(),
        icon: Users,
        color: 'bg-purple-500',
      },
      {
        label: 'Pendentes',
        value: pendingBusinesses.toString(),
        icon: Clock,
        color: 'bg-orange-500',
      },
    ]

    return (
      <div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Bem-vindo, {session.user.name}!
          </h1>
          <p className="text-gray-600 mt-1">
            Painel de aprovação - Administrador
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <div
                key={stat.label}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {stat.label}
                    </p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Aprovações Pendentes */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              Aprovações Pendentes
            </h2>
            <Link
              href="/dash/businesses"
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Ver todas →
            </Link>
          </div>

          {pendingBusinesses === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Clock className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p>Nenhuma aprovação pendente</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Empresa
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Categoria
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Data
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {(await prisma.business.findMany({
                    where: { status: 'PENDING' },
                    include: {
                      user: {
                        select: {
                          name: true,
                        },
                      },
                    },
                    orderBy: { created_at: 'desc' },
                    take: 5,
                  })).map((business) => (
                    <tr key={business.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">
                          {business.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {business.user.name}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {business.category === 'FOOD' ? '🍽️ Alimentação' : '🏨 Acomodação'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {new Date(business.created_at).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/dash/businesses/${business.id}`}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          Analisar →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Dashboard para BUSINESS (Empresa)
  if (role === 'BUSINESS_FOOD' || role === 'BUSINESS_ACCOMMODATION') {
    // Busca o cadastro da empresa
    const business = await prisma.business.findFirst({
      where: { user_id: user!.id },
    })

    // Se não tem cadastro, redireciona para o formulário
    if (!business) {
      redirect('/dash/business/form')
    }

    // Se tem cadastro, redireciona para a página de status
    redirect('/dash/business/status')
  }

  // Dashboard para GUIDE (Guia)
  if (role === 'GUIDE') {
    // Busca o cadastro da agência/guia
    const agency = await prisma.agency.findFirst({
      where: { user_id: user.id },
    })

    // Se não tem cadastro, redireciona para o formulário
    if (!agency) {
      return (
        <div>
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Bem-vindo, {session.user.name}!
            </h1>
            <p className="text-gray-600 mt-1">
              Complete seu cadastro para começar
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <AlertCircle className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 text-center mb-2">
              Complete seu Cadastro
            </h2>
            <p className="text-gray-600 text-center mb-6">
              Você precisa completar seu cadastro de guia para acessar o sistema
            </p>
            <div className="text-center">
              <Link
                href="/dash/agency/form"
                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Completar Cadastro
              </Link>
            </div>
          </div>
        </div>
      )
    }

    // Define status config
    const statusConfig = {
      PENDING: {
        label: 'Pendente',
        color: 'bg-orange-100 text-orange-700',
        borderColor: 'border-orange-200',
        bgAlert: 'bg-orange-50',
        textColor: 'text-orange-900',
        icon: AlertCircle,
        iconColor: 'text-orange-600',
      },
      APPROVED: {
        label: 'Aprovado',
        color: 'bg-green-100 text-green-700',
        borderColor: 'border-green-200',
        bgAlert: 'bg-green-50',
        textColor: 'text-green-900',
        icon: CheckCircle,
        iconColor: 'text-green-600',
      },
      REJECTED: {
        label: 'Rejeitado',
        color: 'bg-red-100 text-red-700',
        borderColor: 'border-red-200',
        bgAlert: 'bg-red-50',
        textColor: 'text-red-900',
        icon: AlertCircle,
        iconColor: 'text-red-600',
      },
    }

    const config = statusConfig[agency.status]
    const StatusIcon = config.icon

    return (
      <div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Bem-vindo, {session.user.name}!
          </h1>
          <p className="text-gray-600 mt-1">
            Gerencie seu perfil e passeios
          </p>
        </div>

        {/* Status do Cadastro */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              Status do Cadastro
            </h2>
            <span className={`px-3 py-1 ${config.color} rounded-full text-sm font-medium`}>
              {config.label}
            </span>
          </div>
          <div className={`flex items-start gap-3 p-4 ${config.bgAlert} rounded-lg border ${config.borderColor}`}>
            <StatusIcon className={`w-5 h-5 ${config.iconColor} mt-0.5`} />
            <div>
              {agency.status === 'PENDING' && (
                <>
                  <p className={`text-sm font-medium ${config.textColor}`}>
                    Seu cadastro de guia está aguardando aprovação
                  </p>
                  <p className={`text-sm ${config.textColor} mt-1 opacity-90`}>
                    Você será notificado quando houver uma atualização.
                  </p>
                </>
              )}
              {agency.status === 'APPROVED' && (
                <>
                  <p className={`text-sm font-medium ${config.textColor}`}>
                    Seu cadastro está aprovado e ativo!
                  </p>
                  <p className={`text-sm ${config.textColor} mt-1 opacity-90`}>
                    Você pode criar e gerenciar passeios.
                  </p>
                </>
              )}
              {agency.status === 'REJECTED' && (
                <>
                  <p className={`text-sm font-medium ${config.textColor}`}>
                    Seu cadastro foi rejeitado
                  </p>
                  {agency.status_details && (
                    <p className={`text-sm ${config.textColor} mt-1 opacity-90`}>
                      Motivo: {agency.status_details}
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Ações */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link
            href="/dash/agency/status"
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:border-blue-500 transition text-left block"
          >
            <Users className="w-10 h-10 text-blue-600 mb-3" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Meu Perfil
            </h3>
            <p className="text-sm text-gray-600">
              {agency.status === 'APPROVED' ? 'Visualize e edite seu cadastro' : 'Complete ou edite seu cadastro de guia'}
            </p>
          </Link>

          {agency.status === 'APPROVED' ? (
            <Link
              href="/dash/tours/new"
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:border-green-500 transition text-left block"
            >
              <MapPin className="w-10 h-10 text-green-600 mb-3" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Cadastrar Passeio
              </h3>
              <p className="text-sm text-gray-600">
                Adicione novos passeios para aprovação
              </p>
            </Link>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 opacity-50 cursor-not-allowed text-left">
              <MapPin className="w-10 h-10 text-green-600 mb-3" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Cadastrar Passeio
              </h3>
              <p className="text-sm text-gray-600">
                Aguarde a aprovação do seu cadastro
              </p>
            </div>
          )}
        </div>

        {/* Meus Passeios */}
        <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              Meus Passeios
            </h2>
            {agency.status === 'APPROVED' && (
              <Link
                href="/dash/tours"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Ver todos →
              </Link>
            )}
          </div>
          <div className="text-center py-12 text-gray-500">
            <MapPin className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p>
              {agency.status === 'APPROVED'
                ? 'Nenhum passeio cadastrado ainda'
                : 'Aguarde a aprovação do seu cadastro para criar passeios'}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return null
}
