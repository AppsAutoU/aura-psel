'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function CandidatoSignupPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    nome_completo: '',
    email: '',
    password: '',
    confirmPassword: '',
    telefone: '',
    aceito_termos: false
  })

  useEffect(() => {
    const redirect = searchParams.get('redirect')
    if (redirect) {
      setRedirectUrl(redirect)
    }
  }, [searchParams])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
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

    // Validações
    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem')
      return
    }

    if (formData.password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres')
      return
    }

    if (!formData.aceito_termos) {
      setError('Você precisa aceitar os termos de uso')
      return
    }

    setLoading(true)

    try {
      const supabase = createClient()

      // Verificar se email já existe
      const { data: existingUser } = await supabase
        .from('aura_jobs_users')
        .select('id')
        .eq('email', formData.email)
        .single()

      if (existingUser) {
        setError('Este email já está cadastrado')
        setLoading(false)
        return
      }

      // Hash da senha
      const passwordHash = await hashPassword(formData.password)

      // Criar usuário
      const { data: newUser, error: insertError } = await supabase
        .from('aura_jobs_users')
        .insert([{
          nome_completo: formData.nome_completo,
          email: formData.email,
          password_hash: passwordHash,
          telefone: formData.telefone || null,
          email_verificado: false,
          ativo: true
        }])
        .select()
        .single()

      if (insertError) throw insertError

      // Criar sessão
      const sessionToken = crypto.randomUUID()
      const expiresAt = new Date()
      expiresAt.setHours(expiresAt.getHours() + 24) // Sessão de 24 horas

      await supabase
        .from('aura_jobs_sessions')
        .insert([{
          user_id: newUser.id,
          token: sessionToken,
          expires_at: expiresAt.toISOString()
        }])

      // Salvar token no localStorage
      localStorage.setItem('candidato_session', sessionToken)
      localStorage.setItem('candidato_user', JSON.stringify({
        id: newUser.id,
        nome: newUser.nome_completo,
        email: newUser.email
      }))

      // Redirecionar para URL especificada ou dashboard
      const returnUrl = redirectUrl || '/candidato'
      router.push(returnUrl)

    } catch (error: any) {
      console.error('Erro ao criar conta:', error)
      setError('Erro ao criar conta. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Criar Conta</h1>
          <p className="text-gray-600">Cadastre-se para se candidatar às vagas</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome Completo *
            </label>
            <input
              type="text"
              name="nome_completo"
              required
              value={formData.nome_completo}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="João Silva"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email *
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
              Telefone/WhatsApp
            </label>
            <input
              type="text"
              name="telefone"
              value={formData.telefone}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="(11) 98765-4321"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Senha *
            </label>
            <input
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Mínimo 6 caracteres"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirmar Senha *
            </label>
            <input
              type="password"
              name="confirmPassword"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Digite a senha novamente"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="aceito_termos"
              id="aceito_termos"
              checked={formData.aceito_termos}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="aceito_termos" className="ml-2 block text-sm text-gray-700">
              Aceito os termos de uso e política de privacidade
            </label>
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
            {loading ? 'Criando conta...' : 'Criar Conta'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Já tem uma conta?{' '}
            <Link 
              href={redirectUrl ? `/candidato/auth/login?redirect=${encodeURIComponent(redirectUrl)}` : "/candidato/auth/login"} 
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Fazer login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}