import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface CandidatoUser {
  id: string
  nome: string
  email: string
  telefone?: string
  created_at?: string
}

export function useCandidatoAuth(redirectTo?: string) {
  const router = useRouter()
  const [user, setUser] = useState<CandidatoUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      // Verificar se existe sessão no localStorage
      const sessionToken = localStorage.getItem('candidato_session')
      const userData = localStorage.getItem('candidato_user')

      if (!sessionToken || !userData) {
        if (redirectTo) {
          localStorage.setItem('returnUrl', window.location.pathname)
          router.push(redirectTo)
        }
        setLoading(false)
        return
      }

      const supabase = createClient()

      // Validar sessão no banco
      const { data: session, error } = await supabase
        .from('aura_jobs_sessions')
        .select('*, user:aura_jobs_users(*)')
        .eq('token', sessionToken)
        .gt('expires_at', new Date().toISOString())
        .single()

      if (error || !session) {
        // Sessão inválida ou expirada
        localStorage.removeItem('candidato_session')
        localStorage.removeItem('candidato_user')
        if (redirectTo) {
          localStorage.setItem('returnUrl', window.location.pathname)
          router.push(redirectTo)
        }
        setLoading(false)
        return
      }

      // Atualizar dados do usuário
      const user = session.user as any
      console.log('Debug - User data from session:', user)
      console.log('Debug - created_at field:', user.created_at)
      setUser({
        id: user.id,
        nome: user.nome_completo,
        email: user.email,
        telefone: user.telefone,
        created_at: user.created_at
      })

    } catch (error) {
      console.error('Erro ao verificar autenticação:', error)
      if (redirectTo) {
        router.push(redirectTo)
      }
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      const sessionToken = localStorage.getItem('candidato_session')
      
      if (sessionToken) {
        const supabase = createClient()
        
        // Deletar sessão do banco
        await supabase
          .from('aura_jobs_sessions')
          .delete()
          .eq('token', sessionToken)
      }

      // Limpar localStorage
      localStorage.removeItem('candidato_session')
      localStorage.removeItem('candidato_user')
      
      // Redirecionar para login
      router.push('/candidato/auth/login')
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    }
  }

  const updateUser = (userData: Partial<CandidatoUser>) => {
    setUser(prev => prev ? { ...prev, ...userData } : null)
    
    const currentUser = JSON.parse(localStorage.getItem('candidato_user') || '{}')
    localStorage.setItem('candidato_user', JSON.stringify({
      ...currentUser,
      ...userData
    }))
  }

  return {
    user,
    loading,
    logout,
    updateUser,
    isAuthenticated: !!user
  }
}