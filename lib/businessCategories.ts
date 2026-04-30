export const BUSINESS_CATEGORIES = ['FOOD', 'ACCOMMODATION', 'SERVICES', 'ARTISAN'] as const

export type BusinessCategory = (typeof BUSINESS_CATEGORIES)[number]

export const BUSINESS_ROLES = [
  'BUSINESS_FOOD',
  'BUSINESS_ACCOMMODATION',
  'BUSINESS_SERVICES',
  'BUSINESS_ARTISAN',
] as const

export type BusinessRole = (typeof BUSINESS_ROLES)[number]

export const BUSINESS_CATEGORY_DISPLAY: Record<BusinessCategory, string> = {
  FOOD: 'Alimentação',
  ACCOMMODATION: 'Acomodação',
  SERVICES: 'Serviços Case-na-Praia',
  ARTISAN: 'Artesanato',
}

export const BUSINESS_CATEGORY_ICONS: Record<BusinessCategory, string> = {
  FOOD: '🍽️',
  ACCOMMODATION: '🏨',
  SERVICES: '🛠️',
  ARTISAN: '🎨',
}

export const BUSINESS_CATEGORY_PUBLIC_HREF: Record<BusinessCategory, string> = {
  FOOD: '/o-que-comer',
  ACCOMMODATION: '/onde-ficar',
  SERVICES: '/case-na-praia-servico',
  ARTISAN: '/artesanato',
}

export const BUSINESS_ROLE_TO_CATEGORY: Record<BusinessRole, BusinessCategory> = {
  BUSINESS_FOOD: 'FOOD',
  BUSINESS_ACCOMMODATION: 'ACCOMMODATION',
  BUSINESS_SERVICES: 'SERVICES',
  BUSINESS_ARTISAN: 'ARTISAN',
}

export function isBusinessRole(role: string | null | undefined): role is BusinessRole {
  return BUSINESS_ROLES.includes(role as BusinessRole)
}

export function isBusinessCategory(category: string | null | undefined): category is BusinessCategory {
  return BUSINESS_CATEGORIES.includes(category as BusinessCategory)
}

export function getBusinessCategoryLabel(category: string | null | undefined) {
  if (!isBusinessCategory(category)) return category || ''
  return `${BUSINESS_CATEGORY_ICONS[category]} ${BUSINESS_CATEGORY_DISPLAY[category]}`
}

export function getBusinessPublicHref(category: string | null | undefined, id: string) {
  if (!isBusinessCategory(category)) return `/business/${id}`
  return `${BUSINESS_CATEGORY_PUBLIC_HREF[category]}/${id}`
}
