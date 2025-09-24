'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function AdminSignupPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    nome_completo: '',
    email: '',
    password: '',
    confirmPassword: '',
    departamento: '',
    cargo: '',
    role: 'avaliador' as 'admin' | 'avaliador'
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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

    // Validações
    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem')
      return
    }

    if (formData.password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres')
      return
    }

    setLoading(true)

    try {
      const supabase = createClient()

      // Verificar se email já existe
      const { data: existingUser } = await supabase
        .from('aura_jobs_usuarios')
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

      // Criar usuário admin/avaliador
      const { data: newUser, error: insertError } = await supabase
        .from('aura_jobs_usuarios')
        .insert([{
          nome_completo: formData.nome_completo,
          email: formData.email,
          password_hash: passwordHash,
          role: formData.role as 'admin' | 'avaliador',
          departamento: formData.departamento || null,
          cargo: formData.cargo || null,
          ativo: false // Começa desativado, precisa de aprovação do admin
        }])
        .select()
        .single()

      if (insertError) {
        console.error('Erro ao inserir:', insertError)
        if (insertError.message.includes('aura_jobs_usuarios_email_key')) {
          setError('Este email já está cadastrado')
        } else if (insertError.message.includes('invalid input value for enum user_role')) {
          setError('Tipo de acesso inválido')
        } else {
          setError(`Erro ao criar conta: ${insertError.message}`)
        }
        setLoading(false)
        return
      }

      setSuccess(true)

    } catch (error: any) {
      console.error('Erro ao criar conta:', error)
      setError('Erro ao criar conta. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 to-purple-100 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Solicitação Enviada!</h2>
          <p className="text-gray-600 mb-6">
            Sua solicitação de cadastro foi enviada com sucesso. 
            Um administrador irá revisar e aprovar seu acesso em breve.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Você receberá um email quando sua conta for aprovada.
          </p>
          <Link 
            href="/admin/auth/login"
            className="inline-block px-6 py-3 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition"
          >
            Voltar ao Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 to-purple-100 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-cosmic shadow-lg">
              <span className="text-lg font-bold text-white">A</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Solicitar Acesso</h1>
          <p className="text-gray-600">Portal Administrativo AutoU</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              placeholder="João Silva"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Corporativo *
            </label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              placeholder="seu.nome@autou.com.br"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Departamento
              </label>
              <input
                type="text"
                name="departamento"
                value={formData.departamento}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                placeholder="RH"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cargo
              </label>
              <input
                type="text"
                name="cargo"
                value={formData.cargo}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                placeholder="Analista"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Acesso *
            </label>
            <select
              name="role"
              required
              value={formData.role}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            >
              <option value="avaliador">Avaliador</option>
              <option value="admin">Administrador</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Administradores têm acesso total ao sistema
            </p>
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              placeholder="Digite a senha novamente"
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
            {loading ? 'Enviando solicitação...' : 'Solicitar Acesso'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Já tem uma conta?{' '}
            <Link href="/admin/auth/login" className="text-violet-600 hover:text-violet-700 font-medium">
              Fazer login
            </Link>
          </p>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-center text-gray-500">
            Após o cadastro, um administrador precisará aprovar seu acesso
          </p>
        </div>
      </div>
    </div>
  )
}