'use client'

import BusinessForm from '@/components/BusinessForm'

interface BusinessEditProps {
  params: {
    id: string
  }
}

export default function BusinessEditPage({ params }: BusinessEditProps) {
  return (
    <div>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Editar Cadastro</h1>
          <p className="text-gray-600 mt-1">Edição administrativa</p>
        </div>

        <BusinessForm
          mode="admin-edit"
          businessId={params.id}
        />
      </div>
    </div>
  )
}
