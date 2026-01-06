import * as LucideIcons from 'lucide-react'
export const getIcon = (icon: string) => {
  if (icon in LucideIcons) {
    return LucideIcons[icon as keyof typeof LucideIcons] as React.ElementType
  }
  return LucideIcons['Globe'] as React.ElementType
}