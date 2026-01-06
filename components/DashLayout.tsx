'use client'

import { useSession, signOut } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  LayoutDashboard,
  Building2,
  UtensilsCrossed,
  Hotel,
  Tag,
  Users,
  LogOut,
  Menu,
  X,
  MapPin,
  CheckCircle,
  Briefcase,
  Calendar,
  Share2,
  Newspaper,
  ParkingSquare,
  Info,
  FileText,
  Download,
} from 'lucide-react'
import { useState } from 'react'
import { canManageBusinesses, canManageAgencies, canManageBeaches, canManageTags, canManageTours, UserRole } from '@/lib/permissions'

type MenuItem = {
  label: string
  href: string
  icon: any
  checkPermission: ((role: UserRole) => boolean) | null
}

// Menu para ADMIN e MODERATOR (Administrador)
const adminMenuItems: MenuItem[] = [
  {
    label: 'Dashboard',
    href: '/dash',
    icon: LayoutDashboard,
    checkPermission: null,
  },
  {
    label: 'Empresas',
    href: '/dash/businesses',
    icon: Building2,
    checkPermission: (role: UserRole) => canManageBusinesses(role),
  },
  {
    label: 'Agências e Guias',
    href: '/dash/agencies',
    icon: Briefcase,
    checkPermission: (role: UserRole) => canManageAgencies(role),
  },
  {
    label: 'Praias',
    href: '/dash/beaches',
    icon: MapPin,
    checkPermission: (role: UserRole) => canManageBeaches(role),
  },
  {
    label: 'Tags',
    href: '/dash/tags',
    icon: Tag,
    checkPermission: (role: UserRole) => canManageTags(role),
  },
  {
    label: 'Solicitações de Passeios',
    href: '/dash/tours',
    icon: Calendar,
    checkPermission: (role: UserRole) => canManageTours(role),
  },
  {
    label: 'Cadastro de Passeios',
    href: '/dash/tour-templates',
    icon: MapPin,
    checkPermission: (role: UserRole) => canManageTours(role),
  },
  {
    label: 'Redes Sociais',
    href: '/dash/social-media',
    icon: Share2,
    checkPermission: (role: UserRole) => role === 'ADMIN',
  },
  {
    label: 'Bairros',
    href: '/dash/districts',
    icon: MapPin,
    checkPermission: (role: UserRole) => role === 'ADMIN',
  },
  {
    label: 'Notícias',
    href: '/dash/news',
    icon: Newspaper,
    checkPermission: (role: UserRole) => role === 'ADMIN',
  },
  {
    label: 'Estacionamentos',
    href: '/dash/parkings',
    icon: ParkingSquare,
    checkPermission: (role: UserRole) => role === 'ADMIN',
  },
  {
    label: 'Eventos',
    href: '/dash/events',
    icon: Calendar,
    checkPermission: (role: UserRole) => role === 'ADMIN',
  },
  {
    label: 'Informações Úteis',
    href: '/dash/useful-info',
    icon: Info,
    checkPermission: (role: UserRole) => role === 'ADMIN',
  },
  {
    label: 'Páginas do Site',
    href: '/dash/common-pages',
    icon: FileText,
    checkPermission: (role: UserRole) => role === 'ADMIN',
  },
  {
    label: 'Downloads',
    href: '/dash/downloads',
    icon: Download,
    checkPermission: (role: UserRole) => role === 'ADMIN',
  },
  {
    label: 'Usuários',
    href: '/dash/users',
    icon: Users,
    checkPermission: (role: UserRole) => role === 'ADMIN',
  },
]

// Menu para BUSINESS (Empresa)
const businessMenuItems: MenuItem[] = [
  {
    label: 'Dashboard',
    href: '/dash',
    icon: LayoutDashboard,
    checkPermission: null,
  },
  {
    label: 'Meu Cadastro',
    href: '/dash/business/form',
    icon: Building2,
    checkPermission: null,
  },
  {
    label: 'Minhas Solicitações',
    href: '/dash/business/status',
    icon: CheckCircle,
    checkPermission: null,
  },
]

// Menu para GUIDE (Guia)
const guideMenuItems: MenuItem[] = [
  {
    label: 'Dashboard',
    href: '/dash',
    icon: LayoutDashboard,
    checkPermission: null,
  },
  {
    label: 'Meu Cadastro',
    href: '/dash/agency/form',
    icon: Briefcase,
    checkPermission: null,
  },
  {
    label: 'Status',
    href: '/dash/agency/status',
    icon: CheckCircle,
    checkPermission: null,
  },
  {
    label: 'Meus Passeios',
    href: '/dash/tours',
    icon: Calendar,
    checkPermission: null,
  },
]

export default function DashLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Seleciona o menu baseado no role do usuário e filtra por permissões
  const getMenuItems = () => {
    const role = session?.user?.role as UserRole
    if (!role) return []

    let baseMenu: MenuItem[] = []
    if (role === 'ADMIN' || role === 'MODERATOR') {
      baseMenu = adminMenuItems
    } else if (role === 'BUSINESS_FOOD' || role === 'BUSINESS_ACCOMMODATION') {
      baseMenu = businessMenuItems
    } else if (role === 'GUIDE') {
      baseMenu = guideMenuItems
    }

    // Filtra menu items baseado em permissões
    return baseMenu.filter(item => {
      if (!item.checkPermission) return true
      return item.checkPermission(role)
    })
  }

  const menuItems = getMenuItems()

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-slate-900 text-white">
        {/* Logo */}
        <div className="flex items-center justify-center h-16 bg-slate-950 border-b border-slate-800">
          <h1 className="text-xl font-bold">🏖️ Turismo Admin</h1>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-semibold">
              {session?.user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {session?.user?.name || 'Usuário'}
              </p>
              <p className="text-xs text-slate-400 truncate">
                {session?.user?.email}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-800 hover:scrollbar-thumb-slate-600">
          <ul className="space-y-1 px-3 pb-20">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={() => signOut({ callbackUrl: '/dash/auth' })}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 hover:bg-red-600 hover:text-white transition-colors w-full"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-medium">Sair</span>
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Sidebar */}
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-slate-900 text-white">
            {/* Logo */}
            <div className="flex items-center justify-between h-16 px-4 bg-slate-950 border-b border-slate-800">
              <h1 className="text-xl font-bold">🏖️ Turismo</h1>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 hover:bg-slate-800 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* User Info */}
            <div className="p-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-semibold">
                  {session?.user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {session?.user?.name || 'Usuário'}
                  </p>
                  <p className="text-xs text-slate-400 truncate">
                    {session?.user?.email}
                  </p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="overflow-y-auto py-4 max-h-[calc(100vh-200px)] scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-800 hover:scrollbar-thumb-slate-600">
              <ul className="space-y-1 px-3 pb-4">
                {menuItems.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${isActive
                          ? 'bg-blue-600 text-white'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                          }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="text-sm font-medium">{item.label}</span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </nav>

            {/* Logout */}
            <div className="p-4 border-t border-slate-800">
              <button
                onClick={() => signOut({ callbackUrl: '/auth' })}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 hover:bg-red-600 hover:text-white transition-colors w-full"
              >
                <LogOut className="w-5 h-5" />
                <span className="text-sm font-medium">Sair</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar Mobile */}
        <header className="lg:hidden flex items-center justify-between h-16 px-4 bg-white border-b border-gray-200">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-bold">🏖️ Turismo Admin</h1>
          <div className="w-10" /> {/* Spacer */}
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
