'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function AdminLoginPage() {
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

      // Primeiro, verificar se o usuário existe
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

      // Se não tem password_hash, é um usuário antigo
      if (!checkUser.password_hash) {
        setError('Usuário sem senha configurada. Execute o script SQL de correção.')
        setLoading(false)
        return
      }

      // Hash da senha digitada
      const passwordHash = await hashPassword(formData.password)

      // Verificar se a senha está correta
      if (checkUser.password_hash !== passwordHash) {
        console.log('Senha incorreta. Hash esperado:', checkUser.password_hash.substring(0, 10) + '...')
        console.log('Hash recebido:', passwordHash.substring(0, 10) + '...')
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

      // Limpar sessões antigas do usuário
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

      // Salvar token no localStorage
      localStorage.setItem('admin_session', sessionToken)
      localStorage.setItem('admin_user', JSON.stringify({
        id: user.id,
        nome: user.nome_completo,
        email: user.email,
        role: user.role,
        departamento: user.departamento,
        cargo: user.cargo
      }))

      // Limpar dados de candidato se existirem (evita conflito)
      localStorage.removeItem('candidato_session')
      localStorage.removeItem('candidato_user')

      // Redirecionar para dashboard admin
      router.push('/admin')

    } catch (error: any) {
      console.error('Erro ao fazer login:', error)
      setError('Erro ao fazer login. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 to-purple-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-cosmic shadow-lg">
              <span className="text-lg font-bold text-white">A</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Portal Admin</h1>
          <p className="text-gray-600">Sistema de Gerenciamento AutoU</p>
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              placeholder="admin@autou.com.br"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              placeholder="Digite sua senha"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-medium rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
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
              Precisa de acesso?{' '}
              <Link href="/admin/auth/signup" className="text-violet-600 hover:text-violet-700 font-medium">
                Solicitar cadastro
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-xs text-center text-gray-500">
            Área restrita aos administradores e avaliadores da AutoU
          </p>
        </div>
      </div>
    </div>
  )
}