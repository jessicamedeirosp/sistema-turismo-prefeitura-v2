'use client'

import { LucideIcon } from 'lucide-react'

interface DetailFieldProps {
  icon: LucideIcon
  label: string
  value: string | number | null | undefined
  isHtml?: boolean
}

export default function DetailField({ icon: Icon, label, value, isHtml = false }: DetailFieldProps) {
  if (!value && value !== 0) return null

  return (
    <div className="flex items-start gap-3">
      <Icon className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
      <div className="flex-1">
        <span className="text-sm font-medium text-gray-700">{label}:</span>{' '}
        {isHtml ? (
          <div
            className="text-sm text-gray-600 prose prose-sm max-w-none mt-1"
            dangerouslySetInnerHTML={{ __html: value.toString() }}
          />
        ) : (
          <span className="text-sm text-gray-600">{value}</span>
        )}
      </div>
    </div>
  )
}
