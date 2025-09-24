'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface SimpleUser {
  id: string
  email: string
  profile: {
    id: string
    email: string
    nome_completo: string
    role: string
    departamento?: string
    cargo?: string
    ativo: boolean
    created_at: string
  }
}

export function useSimpleAuth(redirectTo?: string) {
  const [user, setUser] = useState<SimpleUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const session = localStorage.getItem('simple_auth')
      
      if (!session) {
        setUser(null)
        setLoading(false)
        if (redirectTo) {
          router.push(redirectTo)
        }
        return
      }

      const parsed = JSON.parse(session)
      
      // Verificar se não expirou
      if (Date.now() > parsed.expires) {
        localStorage.removeItem('simple_auth')
        setUser(null)
        setLoading(false)
        if (redirectTo) {
          router.push(redirectTo)
        }
        return
      }

      // Verificar se o usuário ainda existe e está ativo no banco
      const supabase = createClient()
      const { data: userData, error: userError } = await supabase
        .from('aura_jobs_usuarios')
        .select('*')
        .eq('id', parsed.user.id)
        .eq('ativo', true)
        .single()

      if (userError || !userData) {
        // Usuário não existe mais ou foi desativado
        localStorage.removeItem('simple_auth')
        setUser(null)
        setLoading(false)
        if (redirectTo) {
          router.push(redirectTo)
        }
        return
      }

      // Atualizar dados do usuário na sessão se houver mudanças
      const updatedUser = {
        ...parsed.user,
        profile: userData
      }

      setUser(updatedUser)
      
      // Atualizar sessão no localStorage se houver mudanças
      if (JSON.stringify(parsed.user.profile) !== JSON.stringify(userData)) {
        const updatedSession = {
          ...parsed,
          user: updatedUser
        }
        localStorage.setItem('simple_auth', JSON.stringify(updatedSession))
      }

    } catch (error) {
      console.error('Erro na autenticação:', error)
      setError('Erro ao verificar autenticação')
      localStorage.removeItem('simple_auth')
      setUser(null)
      if (redirectTo) {
        router.push(redirectTo)
      }
    } finally {
      setLoading(false)
    }
  }

  const signOut = () => {
    localStorage.removeItem('simple_auth')
    setUser(null)
    router.push('/auth/simple-login')
  }

  const signIn = async (email: string, password: string) => {
    const supabase = createClient()
    
    try {
      // Verificar se o usuário existe e está ativo
      const { data: userData, error: userError } = await supabase
        .from('aura_jobs_usuarios')
        .select('*')
        .eq('email', email)
        .eq('ativo', true)
        .single()

      if (userError || !userData) {
        throw new Error('Usuário não encontrado ou inativo')
      }

      // Por enquanto, qualquer senha funciona (sistema simples)
      // Mais tarde podemos adicionar hash de senha se necessário

      // Criar sessão
      const session = {
        user: {
          id: userData.id,
          email: userData.email,
          profile: userData
        },
        timestamp: Date.now(),
        expires: Date.now() + (24 * 60 * 60 * 1000) // 24 horas
      }

      localStorage.setItem('simple_auth', JSON.stringify(session))
      setUser(session.user)
      
      return { success: true, user: session.user }
    } catch (error: any) {
      setError(error.message)
      return { success: false, error: error.message }
    }
  }

  const signUp = async (userData: {
    email: string
    password: string
    nomeCompleto: string
    departamento?: string
    cargo?: string
    role?: string
  }) => {
    const supabase = createClient()
    
    try {
      // Verificar se o email já existe
      const { data: existingUser } = await supabase
        .from('aura_jobs_usuarios')
        .select('id')
        .eq('email', userData.email)
        .single()

      if (existingUser) {
        throw new Error('Email já cadastrado')
      }

      // Criar novo usuário
      const { data: newUser, error: createError } = await supabase
        .from('aura_jobs_usuarios')
        .insert([{
          id: crypto.randomUUID(),
          email: userData.email,
          nome_completo: userData.nomeCompleto,
          role: userData.role || 'admin',
          departamento: userData.departamento,
          cargo: userData.cargo,
          ativo: true,
        }])
        .select()
        .single()

      if (createError) {
        throw new Error('Erro ao criar usuário: ' + createError.message)
      }

      // Fazer login automático
      return await signIn(userData.email, userData.password)
    } catch (error: any) {
      setError(error.message)
      return { success: false, error: error.message }
    }
  }

  return {
    user,
    loading,
    error,
    signOut,
    signIn,
    signUp,
    isAdmin: user?.profile?.role === 'admin',
    isAvaliador: user?.profile?.role === 'avaliador',
    isAuthenticated: !!user,
  }
}