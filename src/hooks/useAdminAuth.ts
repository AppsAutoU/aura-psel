'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface AdminUser {
  id: string
  nome: string
  email: string
  role: 'admin' | 'avaliador'
  departamento?: string
  cargo?: string
}

export function useAdminAuth() {
  const [user, setUser] = useState<AdminUser | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const sessionToken = localStorage.getItem('admin_session')
      
      if (!sessionToken) {
        setUser(null)
        setLoading(false)
        return
      }

      const supabase = createClient()
      
      // Verificar sessão válida
      const { data: session, error: sessionError } = await supabase
        .from('aura_jobs_admin_sessions')
        .select('*, aura_jobs_usuarios!inner(*)')
        .eq('token', sessionToken)
        .gt('expires_at', new Date().toISOString())
        .single()

      if (sessionError || !session) {
        localStorage.removeItem('admin_session')
        localStorage.removeItem('admin_user')
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
        role: session.aura_jobs_usuarios.role,
        departamento: session.aura_jobs_usuarios.departamento,
        cargo: session.aura_jobs_usuarios.cargo
      }

      setUser(userData)
      localStorage.setItem('admin_user', JSON.stringify(userData))
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    const sessionToken = localStorage.getItem('admin_session')
    
    if (sessionToken) {
      const supabase = createClient()
      await supabase
        .from('aura_jobs_admin_sessions')
        .delete()
        .eq('token', sessionToken)
    }

    localStorage.removeItem('admin_session')
    localStorage.removeItem('admin_user')
    setUser(null)
    router.push('/admin/auth/login')
  }

  const isAdmin = user?.role === 'admin'
  const isAvaliador = user?.role === 'avaliador'

  return { 
    user, 
    loading, 
    logout, 
    isAdmin,
    isAvaliador,
    refreshAuth: checkAuth 
  }
}