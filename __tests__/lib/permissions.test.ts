import {
  hasPermission,
  hasAllPermissions,
  hasAnyPermission,
  isStaff,
  isAdmin,
  canManageBusinesses,
  canManageAgencies,
  canAccessRoute,
  ROLE_PERMISSIONS,
} from '@/lib/permissions'

describe('Permissions System', () => {
  describe('hasPermission', () => {
    it('should return true when ADMIN has permission', () => {
      expect(hasPermission('ADMIN', 'viewTags')).toBe(true)
      expect(hasPermission('ADMIN', 'createTags')).toBe(true)
      expect(hasPermission('ADMIN', 'editTags')).toBe(true)
      expect(hasPermission('ADMIN', 'deleteTags')).toBe(true)
    })

    it('should return false when MODERATOR does not have tag permissions', () => {
      expect(hasPermission('MODERATOR', 'createTags')).toBe(false)
      expect(hasPermission('MODERATOR', 'editTags')).toBe(false)
      expect(hasPermission('MODERATOR', 'deleteTags')).toBe(false)
    })

    it('should return true when MODERATOR can view tags', () => {
      expect(hasPermission('MODERATOR', 'viewTags')).toBe(true)
    })

    it('should return false when BUSINESS_FOOD cannot create tags', () => {
      expect(hasPermission('BUSINESS_FOOD', 'createTags')).toBe(false)
      expect(hasPermission('BUSINESS_FOOD', 'editTags')).toBe(false)
    })

    it('should return true when BUSINESS_FOOD can manage own business', () => {
      expect(hasPermission('BUSINESS_FOOD', 'manageOwnBusiness')).toBe(true)
      expect(hasPermission('BUSINESS_FOOD', 'createBusiness')).toBe(true)
    })

    it('should return true when GUIDE can manage own agency', () => {
      expect(hasPermission('GUIDE', 'manageOwnAgency')).toBe(true)
      expect(hasPermission('GUIDE', 'createAgency')).toBe(true)
    })
  })

  describe('hasAllPermissions', () => {
    it('should return true when user has all permissions', () => {
      expect(hasAllPermissions('ADMIN', ['viewTags', 'createTags', 'editTags'])).toBe(true)
    })

    it('should return false when user is missing one permission', () => {
      expect(hasAllPermissions('MODERATOR', ['viewTags', 'createTags'])).toBe(false)
    })

    it('should return true for empty array', () => {
      expect(hasAllPermissions('BUSINESS_FOOD', [])).toBe(true)
    })
  })

  describe('hasAnyPermission', () => {
    it('should return true when user has at least one permission', () => {
      expect(hasAnyPermission('MODERATOR', ['viewTags', 'createTags'])).toBe(true)
    })

    it('should return false when user has none of the permissions', () => {
      expect(hasAnyPermission('BUSINESS_FOOD', ['createTags', 'editTags', 'deleteTags'])).toBe(false)
    })

    it('should return false for empty array', () => {
      expect(hasAnyPermission('ADMIN', [])).toBe(false)
    })
  })

  describe('isStaff', () => {
    it('should return true for ADMIN', () => {
      expect(isStaff('ADMIN')).toBe(true)
    })

    it('should return true for MODERATOR', () => {
      expect(isStaff('MODERATOR')).toBe(true)
    })

    it('should return false for BUSINESS_FOOD', () => {
      expect(isStaff('BUSINESS_FOOD')).toBe(false)
    })

    it('should return false for GUIDE', () => {
      expect(isStaff('GUIDE')).toBe(false)
    })
  })

  describe('isAdmin', () => {
    it('should return true only for ADMIN', () => {
      expect(isAdmin('ADMIN')).toBe(true)
      expect(isAdmin('MODERATOR')).toBe(false)
      expect(isAdmin('BUSINESS_FOOD')).toBe(false)
    })
  })

  describe('canManageBusinesses', () => {
    it('should return true for ADMIN', () => {
      expect(canManageBusinesses('ADMIN')).toBe(true)
    })

    it('should return true for MODERATOR', () => {
      expect(canManageBusinesses('MODERATOR')).toBe(true)
    })

    it('should return true for BUSINESS_FOOD', () => {
      expect(canManageBusinesses('BUSINESS_FOOD')).toBe(true)
    })

    it('should return false for GUIDE', () => {
      expect(canManageBusinesses('GUIDE')).toBe(false)
    })
  })

  describe('canManageAgencies', () => {
    it('should return true for ADMIN', () => {
      expect(canManageAgencies('ADMIN')).toBe(true)
    })

    it('should return true for GUIDE', () => {
      expect(canManageAgencies('GUIDE')).toBe(true)
    })

    it('should return false for BUSINESS_FOOD', () => {
      expect(canManageAgencies('BUSINESS_FOOD')).toBe(false)
    })
  })

  describe('canAccessRoute', () => {
    it('should allow ADMIN to access tags routes', () => {
      expect(canAccessRoute('ADMIN', '/dash/tags')).toBe(true)
      expect(canAccessRoute('ADMIN', '/dash/tags/[id]')).toBe(true)
      expect(canAccessRoute('ADMIN', '/dash/tags/new')).toBe(true)
    })

    it('should deny MODERATOR access to tags routes', () => {
      expect(canAccessRoute('MODERATOR', '/dash/tags')).toBe(false)
      expect(canAccessRoute('MODERATOR', '/dash/tags/[id]')).toBe(false)
      expect(canAccessRoute('MODERATOR', '/dash/tags/new')).toBe(false)
    })

    it('should allow ADMIN and MODERATOR to access businesses', () => {
      expect(canAccessRoute('ADMIN', '/dash/businesses')).toBe(true)
      expect(canAccessRoute('MODERATOR', '/dash/businesses')).toBe(true)
      expect(canAccessRoute('BUSINESS_FOOD', '/dash/businesses')).toBe(false)
    })

    it('should allow BUSINESS_FOOD to access business form', () => {
      expect(canAccessRoute('BUSINESS_FOOD', '/dash/business/form')).toBe(true)
      expect(canAccessRoute('BUSINESS_FOOD', '/dash/business/status')).toBe(true)
    })

    it('should allow GUIDE to access agency routes', () => {
      expect(canAccessRoute('GUIDE', '/dash/agency/form')).toBe(true)
      expect(canAccessRoute('GUIDE', '/dash/agency/status')).toBe(true)
    })

    it('should allow everyone to access dashboard', () => {
      expect(canAccessRoute('ADMIN', '/dash')).toBe(true)
      expect(canAccessRoute('MODERATOR', '/dash')).toBe(true)
      expect(canAccessRoute('BUSINESS_FOOD', '/dash')).toBe(true)
      expect(canAccessRoute('GUIDE', '/dash')).toBe(true)
    })

    it('should allow access to unprotected routes', () => {
      expect(canAccessRoute('BUSINESS_FOOD', '/some/random/route')).toBe(true)
    })
  })

  describe('ROLE_PERMISSIONS structure', () => {
    it('should have all roles defined', () => {
      expect(ROLE_PERMISSIONS.ADMIN).toBeDefined()
      expect(ROLE_PERMISSIONS.MODERATOR).toBeDefined()
      expect(ROLE_PERMISSIONS.BUSINESS_FOOD).toBeDefined()
      expect(ROLE_PERMISSIONS.BUSINESS_ACCOMMODATION).toBeDefined()
      expect(ROLE_PERMISSIONS.GUIDE).toBeDefined()
    })

    it('should have consistent permission keys across all roles', () => {
      const roles = Object.keys(ROLE_PERMISSIONS)
      const firstRoleKeys = Object.keys(ROLE_PERMISSIONS[roles[0] as keyof typeof ROLE_PERMISSIONS])

      roles.forEach((role) => {
        const roleKeys = Object.keys(ROLE_PERMISSIONS[role as keyof typeof ROLE_PERMISSIONS])
        expect(roleKeys.sort()).toEqual(firstRoleKeys.sort())
      })
    })

    it('should have boolean values for all permissions', () => {
      Object.values(ROLE_PERMISSIONS).forEach((permissions) => {
        Object.values(permissions).forEach((value) => {
          expect(typeof value).toBe('boolean')
        })
      })
    })
  })

  describe('Business rules', () => {
    it('ADMIN should not manage own business or agency', () => {
      expect(hasPermission('ADMIN', 'manageOwnBusiness')).toBe(false)
      expect(hasPermission('ADMIN', 'manageOwnAgency')).toBe(false)
      expect(hasPermission('ADMIN', 'createBusiness')).toBe(false)
      expect(hasPermission('ADMIN', 'createAgency')).toBe(false)
    })

    it('MODERATOR should approve but not edit directly', () => {
      expect(hasPermission('MODERATOR', 'approveBusinesses')).toBe(true)
      expect(hasPermission('MODERATOR', 'editAnyBusiness')).toBe(false)
    })

    it('BUSINESS users should only manage their own', () => {
      expect(hasPermission('BUSINESS_FOOD', 'manageOwnBusiness')).toBe(true)
      expect(hasPermission('BUSINESS_FOOD', 'viewAllBusinesses')).toBe(false)
      expect(hasPermission('BUSINESS_FOOD', 'editAnyBusiness')).toBe(false)
    })

    it('GUIDE should only manage agencies', () => {
      expect(hasPermission('GUIDE', 'manageOwnAgency')).toBe(true)
      expect(hasPermission('GUIDE', 'manageOwnBusiness')).toBe(false)
      expect(hasPermission('GUIDE', 'createBusiness')).toBe(false)
    })
  })
})
