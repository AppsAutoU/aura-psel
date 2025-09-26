'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAdminAuth } from '@/hooks/useAdminAuth'
import { AdminLayout } from '@/components/admin/AdminLayout'

interface Usuario {
  id: string
  email: string
  nome_completo: string
  role: string
  departamento?: string
  cargo?: string
  ativo: boolean
  created_at: string
  updated_at: string
}
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function UsuariosPage() {
  const { user, loading: authLoading, isAdmin } = useAdminAuth()
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && user && isAdmin) {
      loadUsuarios()
    }
  }, [authLoading, user, isAdmin])

  const loadUsuarios = async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('aura_jobs_usuarios')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && data) {
      setUsuarios(data)
    }
    setLoading(false)
  }

  const toggleUsuarioStatus = async (usuarioId: string, ativo: boolean) => {
    const supabase = createClient()
    await supabase
      .from('aura_jobs_usuarios')
      .update({ ativo: !ativo })
      .eq('id', usuarioId)
    
    loadUsuarios()
  }

  const updateRole = async (usuarioId: string, role: 'admin' | 'avaliador') => {
    const supabase = createClient()
    await supabase
      .from('aura_jobs_usuarios')
      .update({ role })
      .eq('id', usuarioId)
    
    loadUsuarios()
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Carregando...</h1>
        </div>
      </div>
    )
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Acesso negado</h1>
          <p className="text-gray-600">Você não tem permissão para acessar esta página.</p>
        </div>
      </div>
    )
  }

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Usuários</h1>
            <p className="text-gray-600 mt-1">
              {usuarios.length} usuário{usuarios.length !== 1 ? 's' : ''} cadastrado{usuarios.length !== 1 ? 's' : ''}
            </p>
          </div>
          <Link href="/admin/auth/signup">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
              <span>+</span>
              <span>Novo Usuário</span>
            </button>
          </Link>
        </div>
        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card variant="clean" size="sm">
            <CardContent className="text-center">
              <div className="text-2xl font-bold text-neutral-900">
                {usuarios.filter(u => u.ativo).length}
              </div>
              <div className="text-xs text-neutral-600">Usuários Ativos</div>
            </CardContent>
          </Card>
          
          <Card variant="clean" size="sm">
            <CardContent className="text-center">
              <div className="text-2xl font-bold text-neutral-900">
                {usuarios.filter(u => u.role === 'admin').length}
              </div>
              <div className="text-xs text-neutral-600">Administradores</div>
            </CardContent>
          </Card>

          <Card variant="clean" size="sm">
            <CardContent className="text-center">
              <div className="text-2xl font-bold text-neutral-900">
                {usuarios.filter(u => u.role === 'avaliador').length}
              </div>
              <div className="text-xs text-neutral-600">Avaliadores</div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Usuários */}
        <div className="space-y-4">
          {usuarios.map((usuario) => (
            <Card key={usuario.id} variant="clean">
              <CardContent>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-3">
                      <h3 className="text-heading-3">{usuario.nome_completo}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        usuario.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {usuario.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        usuario.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {usuario.role === 'admin' ? 'Administrador' : 'Avaliador'}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-body-small text-neutral-600">
                      <div>
                        <strong>Email:</strong> {usuario.email}
                      </div>
                      <div>
                        <strong>Departamento:</strong> {usuario.departamento || 'N/A'}
                      </div>
                      <div>
                        <strong>Cargo:</strong> {usuario.cargo || 'N/A'}
                      </div>
                      <div>
                        <strong>Cadastrado:</strong> {format(new Date(usuario.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                      </div>
                      <div>
                        <strong>Última atualização:</strong> {format(new Date(usuario.updated_at), 'dd/MM/yyyy', { locale: ptBR })}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2 ml-4">
                    <select
                      value={usuario.role}
                      onChange={(e) => updateRole(usuario.id, e.target.value as 'admin' | 'avaliador')}
                      className="text-xs border rounded px-2 py-1"
                      disabled={usuario.id === user.id} // Não pode alterar o próprio role
                    >
                      <option value="admin">Administrador</option>
                      <option value="avaliador">Avaliador</option>
                    </select>
                    
                    <button
                      onClick={() => toggleUsuarioStatus(usuario.id, usuario.ativo)}
                      className={`text-xs py-1 px-2 rounded ${
                        usuario.ativo 
                          ? 'bg-red-100 text-red-800 hover:bg-red-200' 
                          : 'bg-green-100 text-green-800 hover:bg-green-200'
                      }`}
                      disabled={usuario.id === user.id} // Não pode desativar a si mesmo
                    >
                      {usuario.ativo ? 'Desativar' : 'Ativar'}
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {usuarios.length === 0 && (
            <Card variant="clean">
              <CardContent className="text-center py-12">
                <p className="text-neutral-500">
                  Nenhum usuário encontrado.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}