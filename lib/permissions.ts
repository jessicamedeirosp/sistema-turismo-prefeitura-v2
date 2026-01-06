/**
 * Sistema de Controle de Acesso Baseado em Roles (RBAC)
 * Define permissões e funcionalidades por tipo de usuário
 */

export type UserRole = 'ADMIN' | 'MODERATOR' | 'BUSINESS_FOOD' | 'BUSINESS_ACCOMMODATION' | 'GUIDE'

export interface RolePermissions {
  // Dashboard
  viewDashboard: boolean
  viewStatistics: boolean

  // Business Management
  viewAllBusinesses: boolean
  approveBusinesses: boolean
  rejectBusinesses: boolean
  editAnyBusiness: boolean
  deleteAnyBusiness: boolean
  manageOwnBusiness: boolean
  createBusiness: boolean

  // Agency/Guide Management
  viewAllAgencies: boolean
  approveAgencies: boolean
  rejectAgencies: boolean
  editAnyAgency: boolean
  deleteAnyAgency: boolean
  manageOwnAgency: boolean
  createAgency: boolean

  // Tags Management
  viewTags: boolean
  createTags: boolean
  editTags: boolean
  deleteTags: boolean

  // Beaches Management
  viewAllBeaches: boolean
  createBeaches: boolean
  editBeaches: boolean
  deleteBeaches: boolean
  approveBeaches: boolean

  // User Management
  viewAllUsers: boolean
  createUsers: boolean
  editUsers: boolean
  deleteUsers: boolean
  changeUserRoles: boolean

  // Tours Management
  viewAllTours: boolean
  approveTours: boolean
  rejectTours: boolean
  editAnyTour: boolean
  deleteAnyTour: boolean
  manageOwnTours: boolean
  createTours: boolean
}

/**
 * Mapeamento de permissões por role
 */
export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  ADMIN: {
    // Dashboard
    viewDashboard: true,
    viewStatistics: true,

    // Business Management
    viewAllBusinesses: true,
    approveBusinesses: true,
    rejectBusinesses: true,
    editAnyBusiness: true,
    deleteAnyBusiness: true,
    manageOwnBusiness: false, // Admin não tem business próprio
    createBusiness: false,

    // Agency/Guide Management
    viewAllAgencies: true,
    approveAgencies: true,
    rejectAgencies: true,
    editAnyAgency: true,
    deleteAnyAgency: true,
    manageOwnAgency: false,
    createAgency: false,

    // Tags Management
    viewTags: true,
    createTags: true,
    editTags: true,
    deleteTags: true,

    // Beaches Management
    viewAllBeaches: true,
    createBeaches: true,
    editBeaches: true,
    deleteBeaches: true,
    approveBeaches: true,

    // User Management
    viewAllUsers: true,
    createUsers: true,
    editUsers: true,
    deleteUsers: true,
    changeUserRoles: true,

    // Tours Management
    viewAllTours: true,
    approveTours: true,
    rejectTours: true,
    editAnyTour: true,
    deleteAnyTour: true,
    manageOwnTours: false,
    createTours: false,
  },

  MODERATOR: {
    // Dashboard
    viewDashboard: true,
    viewStatistics: true,

    // Business Management
    viewAllBusinesses: true,
    approveBusinesses: true,
    rejectBusinesses: true,
    editAnyBusiness: true,
    deleteAnyBusiness: true,
    manageOwnBusiness: false,
    createBusiness: true,

    // Agency/Guide Management
    viewAllAgencies: true,
    approveAgencies: true,
    rejectAgencies: true,
    editAnyAgency: true,
    deleteAnyAgency: true,
    manageOwnAgency: false,
    createAgency: true,

    // Tags Management
    viewTags: true,
    createTags: true,
    editTags: true,
    deleteTags: true,

    // Beaches Management
    viewAllBeaches: true,
    createBeaches: true,
    editBeaches: true,
    deleteBeaches: true,
    approveBeaches: true,

    // User Management
    viewAllUsers: false,
    createUsers: false,
    editUsers: false,
    deleteUsers: false,
    changeUserRoles: false,

    // Tours Management
    viewAllTours: true,
    approveTours: true,
    rejectTours: true,
    editAnyTour: true,
    deleteAnyTour: true,
    manageOwnTours: false,
    createTours: true,
  },

  BUSINESS_FOOD: {
    // Dashboard
    viewDashboard: true,
    viewStatistics: false, // Vê apenas seu próprio status

    // Business Management
    viewAllBusinesses: false,
    approveBusinesses: false,
    rejectBusinesses: false,
    editAnyBusiness: false,
    deleteAnyBusiness: false,
    manageOwnBusiness: true, // Gerencia apenas seu cadastro
    createBusiness: true,

    // Agency/Guide Management
    viewAllAgencies: false,
    approveAgencies: false,
    rejectAgencies: false,
    editAnyAgency: false,
    deleteAnyAgency: false,
    manageOwnAgency: false,
    createAgency: false,

    // Tags Management
    viewTags: true, // Pode ver tags para selecionar no cadastro
    createTags: false,
    editTags: false,
    deleteTags: false,

    // Beaches Management
    viewAllBeaches: false,
    createBeaches: false,
    editBeaches: false,
    deleteBeaches: false,
    approveBeaches: false,

    // User Management
    viewAllUsers: false,
    createUsers: false,
    editUsers: false,
    deleteUsers: false,
    changeUserRoles: false,

    // Tours Management
    viewAllTours: false,
    approveTours: false,
    rejectTours: false,
    editAnyTour: false,
    deleteAnyTour: false,
    manageOwnTours: false,
    createTours: false,
  },

  BUSINESS_ACCOMMODATION: {
    // Dashboard
    viewDashboard: true,
    viewStatistics: false,

    // Business Management
    viewAllBusinesses: false,
    approveBusinesses: false,
    rejectBusinesses: false,
    editAnyBusiness: false,
    deleteAnyBusiness: false,
    manageOwnBusiness: true,
    createBusiness: true,

    // Agency/Guide Management
    viewAllAgencies: false,
    approveAgencies: false,
    rejectAgencies: false,
    editAnyAgency: false,
    deleteAnyAgency: false,
    manageOwnAgency: false,
    createAgency: false,

    // Tags Management
    viewTags: true,
    createTags: false,
    editTags: false,
    deleteTags: false,

    // Beaches Management
    viewAllBeaches: false,
    createBeaches: false,
    editBeaches: false,
    deleteBeaches: false,
    approveBeaches: false,

    // User Management
    viewAllUsers: false,
    createUsers: false,
    editUsers: false,
    deleteUsers: false,
    changeUserRoles: false,

    // Tours Management
    viewAllTours: false,
    approveTours: false,
    rejectTours: false,
    editAnyTour: false,
    deleteAnyTour: false,
    manageOwnTours: false,
    createTours: false,
  },

  GUIDE: {
    // Dashboard
    viewDashboard: true,
    viewStatistics: false,

    // Business Management
    viewAllBusinesses: false,
    approveBusinesses: false,
    rejectBusinesses: false,
    editAnyBusiness: false,
    deleteAnyBusiness: false,
    manageOwnBusiness: false,
    createBusiness: false,

    // Agency/Guide Management
    viewAllAgencies: false,
    approveAgencies: false,
    rejectAgencies: false,
    editAnyAgency: false,
    deleteAnyAgency: false,
    manageOwnAgency: true, // Gerencia apenas seu cadastro
    createAgency: true,

    // Tags Management
    viewTags: true, // Pode ver tags para selecionar
    createTags: false,
    editTags: false,
    deleteTags: false,

    // Beaches Management
    viewAllBeaches: false,
    createBeaches: false,
    editBeaches: false,
    deleteBeaches: false,
    approveBeaches: false,

    // User Management
    viewAllUsers: false,
    createUsers: false,
    editUsers: false,
    deleteUsers: false,
    changeUserRoles: false,

    // Tours Management
    viewAllTours: false,
    approveTours: false,
    rejectTours: false,
    editAnyTour: false,
    deleteAnyTour: false,
    manageOwnTours: true, // Gerencia apenas seus passeios
    createTours: true,
  },
}

/**
 * Helper function para verificar se um usuário tem uma permissão específica
 */
export function hasPermission(role: UserRole, permission: keyof RolePermissions): boolean {
  return ROLE_PERMISSIONS[role][permission]
}

/**
 * Helper function para verificar múltiplas permissões (precisa ter TODAS)
 */
export function hasAllPermissions(role: UserRole, permissions: (keyof RolePermissions)[]): boolean {
  return permissions.every((permission) => hasPermission(role, permission))
}

/**
 * Helper function para verificar múltiplas permissões (precisa ter PELO MENOS UMA)
 */
export function hasAnyPermission(role: UserRole, permissions: (keyof RolePermissions)[]): boolean {
  return permissions.some((permission) => hasPermission(role, permission))
}

/**
 * Verifica se um usuário é Admin ou Moderator (staff)
 */
export function isStaff(role: UserRole): boolean {
  return role === 'ADMIN' || role === 'MODERATOR'
}

/**
 * Verifica se um usuário é Admin
 */
export function isAdmin(role: UserRole): boolean {
  return role === 'ADMIN'
}

/**
 * Verifica se um usuário pode gerenciar businesses
 */
export function canManageBusinesses(role: UserRole): boolean {
  return hasAnyPermission(role, ['viewAllBusinesses', 'manageOwnBusiness'])
}

/**
 * Verifica se um usuário pode gerenciar agencies
 */
export function canManageAgencies(role: UserRole): boolean {
  return hasAnyPermission(role, ['viewAllAgencies', 'manageOwnAgency'])
}

/**
 * Verifica se um usuário pode gerenciar praias
 */
export function canManageBeaches(role: UserRole): boolean {
  return hasAnyPermission(role, ['viewAllBeaches', 'createBeaches', 'editBeaches'])
}

/**
 * Verifica se um usuário pode gerenciar tags
 */
export function canManageTags(role: UserRole): boolean {
  return hasAnyPermission(role, ['viewTags', 'createTags', 'editTags'])
}

/**
 * Verifica se um usuário pode gerenciar passeios
 */
export function canManageTours(role: UserRole): boolean {
  return hasAnyPermission(role, ['viewAllTours', 'manageOwnTours', 'createTours', 'approveTours'])
}

/**
 * Rotas protegidas e suas permissões necessárias
 */
export const PROTECTED_ROUTES: Record<string, (keyof RolePermissions)[]> = {
  // Dashboard geral
  '/dash': ['viewDashboard'],

  // Business routes
  '/dash/businesses': ['viewAllBusinesses'],
  '/dash/businesses/[id]': ['viewAllBusinesses', 'editAnyBusiness'],
  '/dash/business/form': ['manageOwnBusiness', 'createBusiness'],
  '/dash/business/status': ['manageOwnBusiness'],

  // Agency routes
  '/dash/agencies': ['viewAllAgencies'],
  '/dash/agencies/[id]': ['viewAllAgencies', 'editAnyAgency'],
  '/dash/agency/form': ['manageOwnAgency', 'createAgency'],
  '/dash/agency/status': ['manageOwnAgency'],

  // Beaches routes
  '/dash/beaches': ['viewAllBeaches'],
  '/dash/beaches/[id]': ['viewAllBeaches', 'editBeaches'],
  '/dash/beaches/new': ['createBeaches'],

  // Tags routes
  '/dash/tags': ['viewTags', 'createTags'], // Admin only
  '/dash/tags/[id]': ['editTags'], // Admin only
  '/dash/tags/new': ['createTags'], // Admin only
}

/**
 * Verifica se um usuário tem acesso a uma rota
 */
export function canAccessRoute(role: UserRole, path: string): boolean {
  const requiredPermissions = PROTECTED_ROUTES[path]

  if (!requiredPermissions) {
    return true // Rota não protegida
  }

  // Para rotas de tags, precisa ter TODAS as permissões
  if (path.includes('/tags')) {
    return hasAllPermissions(role, requiredPermissions)
  }

  // Para outras rotas, precisa ter PELO MENOS UMA permissão
  return hasAnyPermission(role, requiredPermissions)
}
