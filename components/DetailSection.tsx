'use client'

import { LucideIcon } from 'lucide-react'
import { ReactNode } from 'react'

interface DetailSectionProps {
  icon: LucideIcon
  title: string
  children: ReactNode
}

export default function DetailSection({ icon: Icon, title, children }: DetailSectionProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
        <Icon className="w-5 h-5 text-blue-600" />
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      </div>
      <div className="space-y-3">
        {children}
      </div>
    </div>
  )
}
