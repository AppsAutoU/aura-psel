'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAdminAuth } from '@/hooks/useAdminAuth'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { TipoAvaliador } from '@/types/database.types'

interface Avaliador {
  id: string
  nome_completo: string
  email: string
  tipo_avaliador?: TipoAvaliador
  pode_avaliar_tudo: boolean
  departamento?: string
  cargo?: string
  ativo: boolean
  created_at: string
}

export default function AvaliadoresPage() {
  const router = useRouter()
  const { user, isAdmin, loading: authLoading } = useAdminAuth()
  const [loading, setLoading] = useState(true)
  const [avaliadores, setAvaliadores] = useState<Avaliador[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editingAvaliador, setEditingAvaliador] = useState<Avaliador | null>(null)
  const [formData, setFormData] = useState({
    nome_completo: '',
    email: '',
    tipo_avaliador: 'desenvolvimento' as TipoAvaliador,
    pode_avaliar_tudo: false,
    departamento: '',
    cargo: ''
  })

  useEffect(() => {
    if (!authLoading && user && isAdmin) {
      loadAvaliadores()
    }
  }, [user, isAdmin, authLoading])

  const loadAvaliadores = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/avaliadores')
      const result = await response.json()

      if (result.success) {
        setAvaliadores(result.data)
      }
    } catch (error) {
      console.error('Erro ao carregar avaliadores:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const method = editingAvaliador ? 'PATCH' : 'POST'
      const body = editingAvaliador
        ? { id: editingAvaliador.id, ...formData }
        : formData

      const response = await fetch('/api/admin/avaliadores', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      const result = await response.json()

      if (result.success) {
        alert(result.message)
        setShowModal(false)
        setEditingAvaliador(null)
        setFormData({
          nome_completo: '',
          email: '',
          tipo_avaliador: 'desenvolvimento',
          pode_avaliar_tudo: false,
          departamento: '',
          cargo: ''
        })
        loadAvaliadores()
      } else {
        alert(`Erro: ${result.error}`)
      }
    } catch (error) {
      console.error('Erro ao salvar avaliador:', error)
      alert('Erro ao salvar avaliador')
    }
  }

  const handleEdit = (avaliador: Avaliador) => {
    setEditingAvaliador(avaliador)
    setFormData({
      nome_completo: avaliador.nome_completo,
      email: avaliador.email,
      tipo_avaliador: avaliador.tipo_avaliador || 'desenvolvimento',
      pode_avaliar_tudo: avaliador.pode_avaliar_tudo,
      departamento: avaliador.departamento || '',
      cargo: avaliador.cargo || ''
    })
    setShowModal(true)
  }

  const handleToggleAtivo = async (avaliador: Avaliador) => {
    try {
      const response = await fetch('/api/admin/avaliadores', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: avaliador.id,
          ativo: !avaliador.ativo
        })
      })

      const result = await response.json()

      if (result.success) {
        loadAvaliadores()
      } else {
        alert(`Erro: ${result.error}`)
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
      alert('Erro ao atualizar status')
    }
  }

  const getTipoLabel = (tipo?: TipoAvaliador) => {
    if (!tipo) return 'Não definido'
    const labels: Record<TipoAvaliador, string> = {
      desenvolvimento: 'Desenvolvimento',
      design: 'Design',
      consultoria: 'Consultoria',
      generalista: 'Generalista'
    }
    return labels[tipo]
  }

  const getTipoBadgeColor = (tipo?: TipoAvaliador) => {
    const colors: Record<string, string> = {
      desenvolvimento: 'bg-blue-100 text-blue-800',
      design: 'bg-purple-100 text-purple-800',
      consultoria: 'bg-green-100 text-green-800',
      generalista: 'bg-gray-100 text-gray-800'
    }
    return colors[tipo || ''] || 'bg-gray-100 text-gray-600'
  }

  if (authLoading || loading) {
    return (
      <AdminLayout>
        <div className="p-6">
          <p>Carregando...</p>
        </div>
      </AdminLayout>
    )
  }

  if (!user || !isAdmin) {
    return (
      <AdminLayout>
        <div className="p-6">
          <p>Sem permissão de administrador</p>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Avaliadores</h1>
            <p className="text-gray-600 mt-1">{avaliadores.length} avaliador(es) cadastrado(s)</p>
          </div>
          <button
            onClick={() => {
              setEditingAvaliador(null)
              setFormData({
                nome_completo: '',
                email: '',
                tipo_avaliador: 'desenvolvimento',
                pode_avaliar_tudo: false,
                departamento: '',
                cargo: ''
              })
              setShowModal(true)
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            + Novo Avaliador
          </button>
        </div>

        {/* Tabela de Avaliadores */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Permissões</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {avaliadores.map((avaliador) => (
                <tr key={avaliador.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{avaliador.nome_completo}</div>
                    {avaliador.cargo && <div className="text-sm text-gray-500">{avaliador.cargo}</div>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {avaliador.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${getTipoBadgeColor(avaliador.tipo_avaliador)}`}>
                      {getTipoLabel(avaliador.tipo_avaliador)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {avaliador.pode_avaliar_tudo ? (
                      <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                        🔓 Acesso Total
                      </span>
                    ) : (
                      <span className="text-gray-500">Restrito</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleAtivo(avaliador)}
                      className={`px-2 py-1 text-xs rounded-full ${
                        avaliador.ativo
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {avaliador.ativo ? '✓ Ativo' : '✗ Inativo'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                    <button
                      onClick={() => handleEdit(avaliador)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal de Criar/Editar */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">
                {editingAvaliador ? 'Editar Avaliador' : 'Novo Avaliador'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    value={formData.nome_completo}
                    onChange={(e) => setFormData({ ...formData, nome_completo: e.target.value })}
                    className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                    required
                    disabled={!!editingAvaliador}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Avaliador *
                  </label>
                  <select
                    value={formData.tipo_avaliador}
                    onChange={(e) => setFormData({ ...formData, tipo_avaliador: e.target.value as TipoAvaliador })}
                    className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="desenvolvimento">Desenvolvimento</option>
                    <option value="design">Design</option>
                    <option value="consultoria">Consultoria</option>
                    <option value="generalista">Generalista</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cargo
                  </label>
                  <input
                    type="text"
                    value={formData.cargo}
                    onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
                    className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Departamento
                  </label>
                  <input
                    type="text"
                    value={formData.departamento}
                    onChange={(e) => setFormData({ ...formData, departamento: e.target.value })}
                    className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.pode_avaliar_tudo}
                    onChange={(e) => setFormData({ ...formData, pode_avaliar_tudo: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm text-gray-700">
                    Pode avaliar todas as vagas (acesso total)
                  </label>
                </div>

                <div className="flex gap-2 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    {editingAvaliador ? 'Atualizar' : 'Criar'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false)
                      setEditingAvaliador(null)
                    }}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
