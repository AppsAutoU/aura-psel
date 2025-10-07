'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface AvaliadorUser {
  id: string
  nome: string
  email: string
  role: 'avaliador'
  departamento?: string
  cargo?: string
}

export function useAvaliadorAuth() {
  const [user, setUser] = useState<AvaliadorUser | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const sessionToken = localStorage.getItem('avaliador_session')

      if (!sessionToken) {
        setUser(null)
        setLoading(false)
        return
      }

      const supabase = createClient()

      // Verificar sessão válida (usando mesma tabela do admin)
      const { data: session, error: sessionError } = await supabase
        .from('aura_jobs_admin_sessions')
        .select('*, aura_jobs_usuarios!inner(*)')
        .eq('token', sessionToken)
        .gt('expires_at', new Date().toISOString())
        .single()

      if (sessionError || !session) {
        localStorage.removeItem('avaliador_session')
        localStorage.removeItem('avaliador_user')
        setUser(null)
        setLoading(false)
        return
      }

      // Verificar se é avaliador
      if (session.aura_jobs_usuarios.role !== 'avaliador') {
        localStorage.removeItem('avaliador_session')
        localStorage.removeItem('avaliador_user')
        setUser(null)
        setLoading(false)
        return
      }

      // Atualizar último acesso
      await supabase
        .from('aura_jobs_admin_sessions')
        .update({ ultimo_acesso: new Date().toISOString() })
        .eq('token', sessionToken)

      const userData = {
        id: session.aura_jobs_usuarios.id,
        nome: session.aura_jobs_usuarios.nome_completo,
        email: session.aura_jobs_usuarios.email,
        role: 'avaliador' as const,
        departamento: session.aura_jobs_usuarios.departamento,
        cargo: session.aura_jobs_usuarios.cargo
      }

      setUser(userData)
      localStorage.setItem('avaliador_user', JSON.stringify(userData))
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    const sessionToken = localStorage.getItem('avaliador_session')

    if (sessionToken) {
      const supabase = createClient()
      await supabase
        .from('aura_jobs_admin_sessions')
        .delete()
        .eq('token', sessionToken)
    }

    localStorage.removeItem('avaliador_session')
    localStorage.removeItem('avaliador_user')
    setUser(null)
    router.push('/avaliador/auth/login')
  }

  return {
    user,
    loading,
    logout,
    refreshAuth: checkAuth
  }
}
