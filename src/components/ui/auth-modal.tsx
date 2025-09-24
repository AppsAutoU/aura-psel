'use client'

import { useState } from 'react'
import { X, Mail, Lock, User, Phone, CheckCircle2, ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (user: any) => void
  vagaTitulo?: string
}

export function AuthModal({ isOpen, onClose, onSuccess, vagaTitulo }: AuthModalProps) {
  const [mode, setMode] = useState<'choice' | 'login' | 'signup'>('choice')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  })
  
  const [signupData, setSignupData] = useState({
    nome_completo: '',
    email: '',
    telefone: '',
    password: '',
    confirmPassword: ''
  })

  const hashPassword = async (password: string): Promise<string> => {
    const encoder = new TextEncoder()
    const data = encoder.encode(password)
    const hash = await crypto.subtle.digest('SHA-256', data)
    return Array.from(new Uint8Array(hash))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const supabase = createClient()
      const passwordHash = await hashPassword(loginData.password)

      const { data: user, error: userError } = await supabase
        .from('aura_jobs_users')
        .select('*')
        .eq('email', loginData.email)
        .eq('password_hash', passwordHash)
        .single()

      if (userError || !user) {
        setError('Email ou senha incorretos')
        setLoading(false)
        return
      }

      if (!user.ativo) {
        setError('Sua conta está desativada')
        setLoading(false)
        return
      }

      // Limpar sessões antigas
      await supabase
        .from('aura_jobs_sessions')
        .delete()
        .eq('user_id', user.id)

      // Criar nova sessão
      const sessionToken = crypto.randomUUID()
      const expiresAt = new Date()
      expiresAt.setHours(expiresAt.getHours() + 24)

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

      // Salvar no localStorage
      localStorage.setItem('candidato_session', sessionToken)
      localStorage.setItem('candidato_user', JSON.stringify({
        id: user.id,
        nome: user.nome_completo,
        email: user.email,
        telefone: user.telefone
      }))

      onSuccess(user)
    } catch (error: any) {
      console.error('Erro ao fazer login:', error)
      setError('Erro ao fazer login. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validações
    if (signupData.password !== signupData.confirmPassword) {
      setError('As senhas não coincidem')
      return
    }

    if (signupData.password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres')
      return
    }

    setLoading(true)

    try {
      const supabase = createClient()

      // Verificar se email já existe
      const { data: existingUser } = await supabase
        .from('aura_jobs_users')
        .select('id')
        .eq('email', signupData.email)
        .single()

      if (existingUser) {
        setError('Este email já está cadastrado')
        setLoading(false)
        return
      }

      const passwordHash = await hashPassword(signupData.password)

      // Criar usuário
      const { data: newUser, error: insertError } = await supabase
        .from('aura_jobs_users')
        .insert([{
          nome_completo: signupData.nome_completo,
          email: signupData.email,
          password_hash: passwordHash,
          telefone: signupData.telefone || null,
          email_verificado: false,
          ativo: true
        }])
        .select()
        .single()

      if (insertError) throw insertError

      // Criar sessão
      const sessionToken = crypto.randomUUID()
      const expiresAt = new Date()
      expiresAt.setHours(expiresAt.getHours() + 24)

      await supabase
        .from('aura_jobs_sessions')
        .insert([{
          user_id: newUser.id,
          token: sessionToken,
          expires_at: expiresAt.toISOString()
        }])

      // Salvar no localStorage
      localStorage.setItem('candidato_session', sessionToken)
      localStorage.setItem('candidato_user', JSON.stringify({
        id: newUser.id,
        nome: newUser.nome_completo,
        email: newUser.email,
        telefone: newUser.telefone
      }))

      onSuccess(newUser)
    } catch (error: any) {
      console.error('Erro ao criar conta:', error)
      setError('Erro ao criar conta. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop com blur */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-md"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors z-10"
        >
          <X className="h-5 w-5 text-gray-500" />
        </button>

        {/* Choice Screen */}
        {mode === 'choice' && (
          <div className="p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-violet-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Vamos começar sua candidatura!
              </h2>
              <p className="text-gray-600">
                {vagaTitulo ? (
                  <>Para se candidatar à vaga de <span className="font-semibold text-violet-600">{vagaTitulo}</span>, você precisa ter uma conta.</>
                ) : (
                  'Crie uma conta ou faça login para continuar'
                )}
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => setMode('login')}
                className="w-full p-4 bg-gradient-to-r from-violet-600 to-blue-600 text-white rounded-xl hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 font-medium"
              >
                <div className="flex items-center justify-between">
                  <span>Já tenho conta</span>
                  <ArrowRight className="h-5 w-5" />
                </div>
              </button>
              
              <button
                onClick={() => setMode('signup')}
                className="w-full p-4 bg-white border-2 border-gray-200 text-gray-700 rounded-xl hover:border-violet-400 hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 font-medium"
              >
                <div className="flex items-center justify-between">
                  <span>Criar conta agora</span>
                  <ArrowRight className="h-5 w-5" />
                </div>
              </button>
            </div>

            <p className="text-xs text-gray-500 text-center mt-6">
              Ao continuar, você concorda com nossos termos de uso e política de privacidade
            </p>
          </div>
        )}

        {/* Login Screen */}
        {mode === 'login' && (
          <div className="p-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Bem-vindo de volta!</h2>
              <p className="text-gray-600 text-sm">Entre com sua conta para continuar</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={loginData.email}
                    onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    placeholder="seu@email.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="password"
                    required
                    value={loginData.password}
                    onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-violet-600 to-blue-600 text-white font-medium rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Entrando...
                  </span>
                ) : (
                  'Entrar'
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => setMode('signup')}
                className="text-sm text-violet-600 hover:text-violet-700 font-medium"
              >
                Não tem conta? Cadastre-se
              </button>
            </div>
          </div>
        )}

        {/* Signup Screen */}
        {mode === 'signup' && (
          <div className="p-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Crie sua conta</h2>
              <p className="text-gray-600 text-sm">Rápido e fácil, leva menos de 1 minuto</p>
            </div>

            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={signupData.nome_completo}
                    onChange={(e) => setSignupData({...signupData, nome_completo: e.target.value})}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    placeholder="João Silva"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={signupData.email}
                    onChange={(e) => setSignupData({...signupData, email: e.target.value})}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    placeholder="seu@email.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefone (opcional)</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={signupData.telefone}
                    onChange={(e) => setSignupData({...signupData, telefone: e.target.value})}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    placeholder="(11) 99999-9999"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
                  <input
                    type="password"
                    required
                    value={signupData.password}
                    onChange={(e) => setSignupData({...signupData, password: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    placeholder="Min. 6 caracteres"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar</label>
                  <input
                    type="password"
                    required
                    value={signupData.confirmPassword}
                    onChange={(e) => setSignupData({...signupData, confirmPassword: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    placeholder="Repita a senha"
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-violet-600 to-blue-600 text-white font-medium rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Criando conta...
                  </span>
                ) : (
                  'Criar conta e continuar'
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => setMode('login')}
                className="text-sm text-violet-600 hover:text-violet-700 font-medium"
              >
                Já tem conta? Faça login
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}