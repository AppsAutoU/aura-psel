'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { PortalLayout } from "@/components/layout/portal-layout"
import { CandidatoDashboard } from "@/components/candidato/dashboard"
import { useCandidatoAuth } from '@/hooks/useCandidatoAuth'
import { LoadingPage } from '@/components/ui/loading'

export default function CandidatoPage() {
  const router = useRouter()
  const { user, loading, logout } = useCandidatoAuth()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/candidato/auth/login')
    }
  }, [loading, user, router])

  if (loading) {
    return <LoadingPage text="Carregando..." />
  }

  if (!user) {
    return null
  }

  // Formatar dados do usuário para o layout
  const userData = {
    name: user.nome,
    email: user.email,
    avatar: undefined
  }

  return (
    <PortalLayout user={userData} onLogout={logout}>
      <CandidatoDashboard user={userData} />
    </PortalLayout>
  )
}