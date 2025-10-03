'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function AvaliadorLoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const hashPassword = async (password: string): Promise<string> => {
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

      // Verificar se o usuário existe
      const { data: checkUser, error: checkError } = await supabase
        .from('aura_jobs_usuarios')
        .select('*')
        .eq('email', formData.email)
        .single()

      if (checkError || !checkUser) {
        setError('Usuário não encontrado')
        setLoading(false)
        return
      }

      // Verificar se é avaliador
      if (checkUser.role !== 'avaliador') {
        setError('Acesso negado. Esta área é exclusiva para avaliadores.')
        setLoading(false)
        return
      }

      // Verificar se tem senha configurada
      if (!checkUser.password_hash) {
        setError('Usuário sem senha configurada. Entre em contato com o administrador.')
        setLoading(false)
        return
      }

      // Hash da senha digitada
      const passwordHash = await hashPassword(formData.password)

      // Verificar se a senha está correta
      if (checkUser.password_hash !== passwordHash) {
        setError('Senha incorreta')
        setLoading(false)
        return
      }

      const user = checkUser

      if (!user.ativo) {
        setError('Sua conta está desativada. Entre em contato com o administrador.')
        setLoading(false)
        return
      }

      // Limpar sessões antigas do usuário (usando a mesma tabela do admin)
      await supabase
        .from('aura_jobs_admin_sessions')
        .delete()
        .eq('user_id', user.id)

      // Criar nova sessão
      const sessionToken = crypto.randomUUID()
      const expiresAt = new Date()
      expiresAt.setHours(expiresAt.getHours() + 24) // Sessão de 24 horas

      await supabase
        .from('aura_jobs_admin_sessions')
        .insert([{
          user_id: user.id,
          token: sessionToken,
          expires_at: expiresAt.toISOString()
        }])

      // Atualizar último login
      await supabase
        .from('aura_jobs_usuarios')
        .update({ ultimo_login: new Date().toISOString() })
        .eq('id', user.id)

      // Salvar token no localStorage (usando chave diferente do admin)
      localStorage.setItem('avaliador_session', sessionToken)
      localStorage.setItem('avaliador_user', JSON.stringify({
        id: user.id,
        nome: user.nome_completo,
        email: user.email,
        role: user.role,
        departamento: user.departamento,
        cargo: user.cargo
      }))

      // Limpar dados de admin/candidato se existirem
      localStorage.removeItem('admin_session')
      localStorage.removeItem('admin_user')
      localStorage.removeItem('candidato_session')
      localStorage.removeItem('candidato_user')

      // Redirecionar para o portal avaliador
      router.push('/avaliador')

    } catch (error: any) {
      console.error('Erro ao fazer login:', error)
      setError('Erro ao fazer login. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Portal Avaliador</h1>
          <p className="text-gray-600">Acesse sua conta para avaliar candidatos</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="seu@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Senha
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/" className="text-sm text-purple-600 hover:text-purple-700">
              ← Voltar para o início
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
