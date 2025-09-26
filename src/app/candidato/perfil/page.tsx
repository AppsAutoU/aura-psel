'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useCandidatoAuth } from '@/hooks/useCandidatoAuth'
import { PortalLayout } from '@/components/layout/portal-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  User,
  Mail,
  Phone,
  Calendar,
  Shield,
  Edit,
  Save,
  X
} from 'lucide-react'

export default function PerfilPage() {
  const router = useRouter()
  const { user, loading: authLoading, logout } = useCandidatoAuth()
  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    nome_completo: '',
    email: '',
    telefone: ''
  })

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/candidato/auth/login')
    }
  }, [user, authLoading, router])

  // Load user data
  useEffect(() => {
    if (user) {
      loadUserData()
    }
  }, [user])

  const loadUserData = async () => {
    if (!user) return
    
    const supabase = createClient()
    const { data, error } = await supabase
      .from('aura_jobs_users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (data) {
      setFormData({
        nome_completo: data.nome_completo || '',
        email: data.email || '',
        telefone: data.telefone || ''
      })
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSave = async () => {
    if (!user) return
    
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('aura_jobs_users')
        .update({
          nome_completo: formData.nome_completo,
          telefone: formData.telefone,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (error) throw error

      // Update local storage
      const updatedUser = {
        ...user,
        nome: formData.nome_completo
      }
      localStorage.setItem('candidato_user', JSON.stringify(updatedUser))
      
      setSuccess('Perfil atualizado com sucesso!')
      setEditing(false)
      
      // Reload to update header
      setTimeout(() => window.location.reload(), 1500)
    } catch (error: any) {
      setError('Erro ao atualizar perfil. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const userData = user ? {
    name: user.nome,
    email: user.email
  } : null

  if (authLoading || !userData) {
    return (
      <PortalLayout user={userData} onLogout={logout}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <div className="w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin mx-auto"></div>
            <h1 className="text-heading-2">Carregando perfil...</h1>
          </div>
        </div>
      </PortalLayout>
    )
  }

  return (
    <PortalLayout user={userData} onLogout={logout}>
      <div className="space-y-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-display">Meu Perfil</h1>
          <p className="text-body-large text-neutral-600">
            Gerencie suas informações pessoais
          </p>
        </div>

        {/* Profile Card */}
        <Card variant="premium">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-heading-2">Informações Pessoais</CardTitle>
                <CardDescription>
                  Mantenha suas informações atualizadas
                </CardDescription>
              </div>
              {!editing && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setEditing(true)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
              )}
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Messages */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}
            
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg text-sm">
                {success}
              </div>
            )}

            {/* Form Fields */}
            <div className="space-y-4">
              <div>
                <label className="flex items-center gap-2 text-body-small font-medium text-neutral-700 mb-2">
                  <User className="h-4 w-4" />
                  Nome Completo
                </label>
                {editing ? (
                  <input
                    type="text"
                    name="nome_completo"
                    value={formData.nome_completo}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-body text-neutral-900">{formData.nome_completo}</p>
                )}
              </div>

              <div>
                <label className="flex items-center gap-2 text-body-small font-medium text-neutral-700 mb-2">
                  <Mail className="h-4 w-4" />
                  Email
                </label>
                <p className="text-body text-neutral-900">{formData.email}</p>
                {editing && (
                  <p className="text-body-small text-neutral-500 mt-1">
                    O email não pode ser alterado
                  </p>
                )}
              </div>

              <div>
                <label className="flex items-center gap-2 text-body-small font-medium text-neutral-700 mb-2">
                  <Phone className="h-4 w-4" />
                  Telefone/WhatsApp
                </label>
                {editing ? (
                  <input
                    type="text"
                    name="telefone"
                    value={formData.telefone}
                    onChange={handleChange}
                    placeholder="(11) 98765-4321"
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-body text-neutral-900">
                    {formData.telefone || 'Não informado'}
                  </p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            {editing && (
              <div className="flex justify-end gap-3 pt-4 border-t border-neutral-200">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditing(false)
                    loadUserData()
                    setError(null)
                    setSuccess(null)
                  }}
                  disabled={loading}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSave}
                  disabled={loading}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? 'Salvando...' : 'Salvar'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Security Card */}
        <Card variant="clean">
          <CardHeader>
            <CardTitle className="text-heading-3">Segurança</CardTitle>
            <CardDescription>
              Gerencie suas configurações de segurança
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-violet-600" />
                <div>
                  <p className="text-body font-medium">Senha</p>
                  <p className="text-body-small text-neutral-600">
                    Última alteração há mais de 30 dias
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Alterar senha
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-violet-600" />
                <div>
                  <p className="text-body font-medium">Conta criada</p>
                  <p className="text-body-small text-neutral-600">
                    {user && user.created_at ? new Date(user.created_at).toLocaleDateString('pt-BR') : 'Data não disponível'}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PortalLayout>
  )
}