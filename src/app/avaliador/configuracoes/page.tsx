'use client'

import { useAvaliadorAuth } from '@/hooks/useAvaliadorAuth'
import { AvaliadorLayout } from '@/components/avaliador/AvaliadorLayout'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function ConfiguracoesPage() {
  const router = useRouter()
  const { user, loading } = useAvaliadorAuth()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/avaliador/auth/login')
    }
  }, [loading, user, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Carregando...</h1>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <AvaliadorLayout>
      <div className="p-6">
        <h2 className="text-2xl font-semibold mb-6">Configurações</h2>

        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-600">Esta seção estará disponível em breve.</p>
        </div>
      </div>
    </AvaliadorLayout>
  )
}
