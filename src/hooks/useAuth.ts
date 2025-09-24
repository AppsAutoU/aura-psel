'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import { Usuario } from '@/types/database.types'

interface AuthUser extends User {
  profile?: Usuario | null
}

export function useAuth(redirectTo?: string) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      console.log('🔍 useAuth: Iniciando verificação de autenticação')
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        
        if (authError) {
          console.error('❌ useAuth: Erro ao buscar usuário:', authError)
          setError('Erro de autenticação')
          setUser(null)
          setLoading(false)
          return
        }
        
        console.log('👤 useAuth: Usuário encontrado:', user?.email)
        
        if (user) {
          console.log('🔍 useAuth: Buscando perfil na tabela usuarios...')
          // Buscar perfil do usuário na tabela usuarios
          const { data: profile, error: profileError } = await supabase
            .from('aura_jobs_usuarios')
            .select('*')
            .eq('id', user.id)
            .single()
          
          if (profileError) {
            console.error('⚠️ useAuth: Erro ao buscar perfil:', profileError)
            console.log('📝 useAuth: Usuário sem perfil - será redirecionado para setup')
            // Se não encontrar perfil, ainda assim mantém o usuário logado
            setUser({ ...user, profile: null })
          } else {
            console.log('✅ useAuth: Perfil encontrado:', profile)
            setUser({ ...user, profile })
          }
        } else {
          console.log('❌ useAuth: Nenhum usuário autenticado')
          setUser(null)
          if (redirectTo) {
            console.log('🔄 useAuth: Redirecionando para:', redirectTo)
            router.push(redirectTo)
          }
        }
      } catch (error) {
        console.error('💥 useAuth: Erro geral na autenticação:', error)
        setUser(null)
      }
      
      console.log('✅ useAuth: Finalizando verificação, setLoading(false)')
      setLoading(false)
    }

    getUser()

    // Listener para mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        try {
          if (session?.user) {
            const { data: profile, error: profileError } = await supabase
              .from('aura_jobs_usuarios')
              .select('*')
              .eq('id', session.user.id)
              .single()
            
            if (profileError) {
              console.error('Erro ao buscar perfil no auth change:', profileError)
              setUser({ ...session.user, profile: null })
            } else {
              setUser({ ...session.user, profile })
            }
          } else {
            setUser(null)
            if (redirectTo && event === 'SIGNED_OUT') {
              router.push(redirectTo)
            }
          }
        } catch (error) {
          console.error('Erro no auth state change:', error)
          setUser(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase, router, redirectTo])

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  return {
    user,
    loading,
    error,
    signOut,
    isAdmin: user?.profile?.role === 'admin',
    isAvaliador: user?.profile?.role === 'avaliador',
  }
}