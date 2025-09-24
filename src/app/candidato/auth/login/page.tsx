'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function CandidatoLoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  useEffect(() => {
    const redirect = searchParams.get('redirect')
    if (redirect) {
      setRedirectUrl(redirect)
    }
  }, [searchParams])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const hashPassword = async (password: string): Promise<string> => {
    // Simples hash para exemplo - em produção use bcrypt
    const encoder = new TextEncoder()
    const data = encoder.encode(password)
    const hash = await crypto.subtle.digest('SHA-256', data)
    return Array.from(new Uint8Array(hash))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const supabase = createClient()

      // Hash da senha digitada
      const passwordHash = await hashPassword(formData.password)

      // Buscar usuário
      const { data: user, error: userError } = await supabase
        .from('aura_jobs_users')
        .select('*')
        .eq('email', formData.email)
        .eq('password_hash', passwordHash)
        .single()

      if (userError || !user) {
        setError('Email ou senha incorretos')
        setLoading(false)
        return
      }

      if (!user.ativo) {
        setError('Sua conta está desativada. Entre em contato com o suporte.')
        setLoading(false)
        return
      }

      // Limpar sessões antigas do usuário
      await supabase
        .from('aura_jobs_sessions')
        .delete()
        .eq('user_id', user.id)

      // Criar nova sessão
      const sessionToken = crypto.randomUUID()
      const expiresAt = new Date()
      expiresAt.setHours(expiresAt.getHours() + 24) // Sessão de 24 horas

      await supabase
        .from('aura_jobs_sessions')
        .insert([{
          user_id: user.id,
          token: sessionToken,
          expires_at: expiresAt.toISOString()
        }])

      // Atualizar último login
      await supabase
        .from('aura_jobs_users')
        .update({ ultimo_login: new Date().toISOString() })
        .eq('id', user.id)

      // Salvar token no localStorage
      localStorage.setItem('candidato_session', sessionToken)
      localStorage.setItem('candidato_user', JSON.stringify({
        id: user.id,
        nome: user.nome_completo,
        email: user.email
      }))

      // Redirecionar para URL especificada ou dashboard
      const returnUrl = redirectUrl || '/candidato'
      router.push(returnUrl)

    } catch (error: any) {
      console.error('Erro ao fazer login:', error)
      setError('Erro ao fazer login. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Entrar</h1>
          <p className="text-gray-600">Acesse sua conta de candidato</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="seu@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Senha
            </label>
            <input
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Digite sua senha"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Lembrar de mim</span>
            </label>
            <Link href="/candidato/auth/forgot-password" className="text-sm text-blue-600 hover:text-blue-700">
              Esqueceu a senha?
            </Link>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Ou</span>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Não tem uma conta?{' '}
              <Link 
                href={redirectUrl ? `/candidato/auth/signup?redirect=${encodeURIComponent(redirectUrl)}` : "/candidato/auth/signup"} 
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Cadastre-se grátis
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}