'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import LoadingSpinner from '@/components/LoadingSpinner'
import BusinessForm from '@/components/BusinessForm'

export default function BusinessFormPage() {
  const { data: session } = useSession()
  const [isFetching, setIsFetching] = useState(true)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    const checkExistingBusiness = async () => {
      try {
        const res = await fetch('/api/business/my-business')
        if (res.ok) {
          const data = await res.json()
          if (data.business) {
            setIsEditing(true)
          }
        }
      } catch (error) {
        console.error('Erro ao verificar negócio:', error)
      } finally {
        setIsFetching(false)
      }
    }

    checkExistingBusiness()
  }, [])

  if (isFetching) {
    return <LoadingSpinner message="Carregando dados..." />
  }

  return (
    <div>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditing ? 'Editar Cadastro' : 'Novo Cadastro'}
          </h1>
          <p className="text-gray-600 mt-1">Preencha os dados da sua empresa</p>
        </div>

        <BusinessForm
          mode={isEditing ? 'edit' : 'create'}
          userRole={session?.user?.role}
        />
      </div>
    </div>
  )
}
