'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAdminAuth } from '@/hooks/useAdminAuth'
import { useToast } from '@/components/ui/toast'
import { useConfirm } from '@/components/ui/confirm-dialog'
import Link from 'next/link'
import { generateVagaKey } from '@/lib/utils'
import { LoadingPage, LoadingButton } from '@/components/ui/loading'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface Vaga {
  id: string
  titulo: string
  cargo?: string
  descricao?: string
  departamento?: string
  tipo_contrato?: string
  modelo_trabalho?: string
  salario_min?: number
  salario_max?: number
  requisitos?: string
  beneficios?: string
  vagas_disponiveis: number
  vaga_key: string
  ativa: boolean
  prazo_case_dias?: number // Prazo do case em dias após aprovação (D+N)
  created_at: string
  created_by?: string
}

interface JobTitle {
  id: string
  name: string
}

export default function VagasPage() {
  const router = useRouter()
  const { user, loading: authLoading, isAdmin } = useAdminAuth()
  const { addToast } = useToast()
  const { confirm } = useConfirm()
  const [vagas, setVagas] = useState<Vaga[]>([])
  const [jobTitles, setJobTitles] = useState<JobTitle[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editingVaga, setEditingVaga] = useState<Vaga | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'ativa' | 'inativa'>('all')
  const [formData, setFormData] = useState({
    titulo: '',
    cargo: '',
    descricao: '',
    departamento: '',
    tipo_contrato: '',
    modelo_trabalho: '',
    salario_min: '',
    salario_max: '',
    requisitos: '',
    beneficios: '',
    vagas_disponiveis: '1',
    prazo_case_dias: '5', // Padrão: 5 dias (D+5)
    case_link_notion: '', // Link do Notion com o case
  })

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/admin/auth/login')
    } else if (!authLoading && user) {
      loadVagas()
      loadJobTitles()
    }
  }, [authLoading, user, router])

  const loadVagas = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('aura_jobs_vagas')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      // Carregar prazos do localStorage e mesclar com as vagas
      const prazosCase = JSON.parse(localStorage.getItem('vagas_prazos_case') || '{}')
      const vagasComPrazo = (data || []).map(vaga => ({
        ...vaga,
        prazo_case_dias: prazosCase[vaga.id] || 5 // Padrão 5 dias
      }))

      setVagas(vagasComPrazo)
    } catch (error) {
      console.error('Erro ao carregar vagas:', error)
      addToast({
        type: 'error',
        title: 'Erro',
        message: 'Erro ao carregar vagas. Tente novamente.'
      })
    } finally {
      setLoading(false)
    }
  }

  const loadJobTitles = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('job_titles')
        .select('id, name')
        .order('name')

      if (error) throw error

      setJobTitles(data || [])
    } catch (error) {
      console.error('Erro ao carregar cargos:', error)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const openEditModal = (vaga: Vaga) => {
    setEditingVaga(vaga)
    setFormData({
      titulo: vaga.titulo,
      cargo: vaga.cargo || '',
      descricao: vaga.descricao || '',
      departamento: vaga.departamento || '',
      tipo_contrato: vaga.tipo_contrato || '',
      modelo_trabalho: vaga.modelo_trabalho || '',
      salario_min: vaga.salario_min?.toString() || '',
      salario_max: vaga.salario_max?.toString() || '',
      requisitos: Array.isArray(vaga.requisitos) ? vaga.requisitos.join('\n') : (vaga.requisitos || ''),
      beneficios: Array.isArray(vaga.beneficios) ? vaga.beneficios.join('\n') : (vaga.beneficios || ''),
      vagas_disponiveis: vaga.vagas_disponiveis.toString(),
      prazo_case_dias: vaga.prazo_case_dias?.toString() || '5',
      case_link_notion: (vaga as any).case_link_notion || '',
    })
    setShowModal(true)
  }

  const openCreateModal = () => {
    setEditingVaga(null)
    setFormData({
      titulo: '',
      cargo: '',
      descricao: '',
      departamento: '',
      tipo_contrato: '',
      modelo_trabalho: '',
      salario_min: '',
      salario_max: '',
      requisitos: '',
      beneficios: '',
      vagas_disponiveis: '1',
      prazo_case_dias: '5',
      case_link_notion: '',
    })
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    
    try {
      const supabase = createClient()
      
      if (!user) throw new Error('Usuário não autenticado')

      // Validações básicas
      if (!formData.titulo.trim()) {
        throw new Error('Título é obrigatório')
      }

      // Separar prazo_case_dias do formData pois ele não existe na tabela do banco
      // Será gerenciado via localStorage
      const { prazo_case_dias, ...restFormData } = formData

      // Converter requisitos e benefícios de string para array (PostgreSQL espera text[])
      // Cada linha do textarea se torna um item do array
      let requisitosArray = null
      if (restFormData.requisitos && restFormData.requisitos.trim()) {
        requisitosArray = restFormData.requisitos
          .split('\n')
          .map(r => r.trim())
          .filter(r => r.length > 0)
      }

      let beneficiosArray = null
      if (restFormData.beneficios && restFormData.beneficios.trim()) {
        beneficiosArray = restFormData.beneficios
          .split('\n')
          .map(b => b.trim())
          .filter(b => b.length > 0)
      }

      const vagaData = {
        titulo: restFormData.titulo.trim(),
        cargo: restFormData.cargo || null,
        descricao: restFormData.descricao.trim() || null,
        departamento: restFormData.departamento.trim() || null,
        tipo_contrato: restFormData.tipo_contrato || null,
        modelo_trabalho: restFormData.modelo_trabalho || null,
        requisitos: requisitosArray,
        beneficios: beneficiosArray,
        salario_min: restFormData.salario_min ? parseFloat(restFormData.salario_min) : null,
        salario_max: restFormData.salario_max ? parseFloat(restFormData.salario_max) : null,
        vagas_disponiveis: parseInt(restFormData.vagas_disponiveis) || 1,
      }

      let result
      let vagaId: string

      if (editingVaga) {
        vagaId = editingVaga.id
        result = await supabase
          .from('aura_jobs_vagas')
          .update(vagaData)
          .eq('id', vagaId)
      } else {
        vagaId = crypto.randomUUID()
        result = await supabase
          .from('aura_jobs_vagas')
          .insert([{
            ...vagaData,
            id: vagaId,
            vaga_key: generateVagaKey(),
            ativa: true,
            created_by: user.id,
          }])
      }

      if (result.error) throw result.error

      // Salvar prazo_case_dias no localStorage
      const prazosCase = JSON.parse(localStorage.getItem('vagas_prazos_case') || '{}')
      prazosCase[vagaId] = parseInt(prazo_case_dias) || 5
      localStorage.setItem('vagas_prazos_case', JSON.stringify(prazosCase))

      addToast({
        type: 'success',
        title: 'Sucesso!',
        message: editingVaga ? 'Vaga atualizada com sucesso!' : 'Nova vaga criada com sucesso!'
      })

      setShowModal(false)
      setEditingVaga(null)
      loadVagas()
      setFormData({
        titulo: '',
        descricao: '',
        departamento: '',
        tipo_contrato: '',
        modelo_trabalho: '',
        salario_min: '',
        salario_max: '',
        requisitos: '',
        beneficios: '',
        vagas_disponiveis: '1',
        prazo_case_dias: '5',
      })
    } catch (error: any) {
      console.error('Erro ao salvar vaga:', error)
      addToast({
        type: 'error',
        title: 'Erro',
        message: error.message || 'Erro ao salvar vaga. Tente novamente.'
      })
    } finally {
      setSaving(false)
    }
  }

  const updateStatus = async (vagaId: string, ativa: boolean) => {
    const confirmed = await confirm({
      title: ativa ? 'Ativar vaga?' : 'Desativar vaga?',
      message: ativa 
        ? 'Esta vaga ficará disponível para receber candidaturas.'
        : 'Esta vaga não receberá mais candidaturas. Os candidatos já inscritos permanecerão no sistema.',
      variant: ativa ? 'info' : 'warning',
      confirmText: ativa ? 'Ativar' : 'Desativar'
    })

    if (!confirmed) return

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('aura_jobs_vagas')
        .update({ ativa })
        .eq('id', vagaId)

      if (error) throw error

      addToast({
        type: 'success',
        title: 'Status atualizado!',
        message: `Vaga ${ativa ? 'ativada' : 'desativada'} com sucesso.`
      })
      
      loadVagas()
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
      addToast({
        type: 'error',
        title: 'Erro',
        message: 'Erro ao atualizar status da vaga.'
      })
    }
  }

  const copyLink = async (vagaKey: string) => {
    try {
      const url = `${window.location.origin}/candidato/inscricao/${vagaKey}`
      await navigator.clipboard.writeText(url)
      addToast({
        type: 'success',
        title: 'Link copiado!',
        message: 'Link da vaga foi copiado para a área de transferência.'
      })
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Erro',
        message: 'Erro ao copiar link. Tente novamente.'
      })
    }
  }

  // Filtrar vagas
  const filteredVagas = vagas.filter(vaga => {
    const matchesSearch = vaga.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vaga.departamento?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vaga.descricao?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'ativa' && vaga.ativa) ||
                         (statusFilter === 'inativa' && !vaga.ativa)
    
    return matchesSearch && matchesStatus
  })

  if (authLoading || loading) {
    return (
      <LoadingPage 
        text={authLoading ? 'Verificando autenticação...' : 'Carregando vagas...'}
      />
    )
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-red-600">Acesso Negado</h1>
          <p className="text-gray-600">Você não tem permissão de administrador.</p>
          <Button
            onClick={() => router.push('/auth/login')}
            className="bg-gradient-cosmic hover-cosmic"
          >
            Fazer Login
          </Button>
        </div>
      </div>
    )
  }

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-heading-1 text-gradient-cosmic mb-2">Gerenciar Vagas</h1>
            <p className="text-body text-neutral-600">
              {filteredVagas.length} de {vagas.length} vagas encontradas
            </p>
          </div>
          <Button
            onClick={openCreateModal}
            className="bg-gradient-cosmic hover-cosmic"
            size="lg"
          >
            <span className="mr-2">+</span>
            Nova Vaga
          </Button>
        </div>
        {/* Filtros e Busca */}
        <div className="bg-white rounded-xl border border-gray-200/60 p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Buscar vagas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'ativa' | 'inativa')}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm min-w-[120px]"
            >
              <option value="all">Todas</option>
              <option value="ativa">Ativas</option>
              <option value="inativa">Inativas</option>
            </select>
          </div>
        </div>

        {/* Lista de Vagas */}
        <div className="space-y-3">
          {filteredVagas.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200/60 p-8 text-center">
              <div className="text-4xl mb-3">💼</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm || statusFilter !== 'all' ? 'Nenhuma vaga encontrada' : 'Nenhuma vaga cadastrada'}
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Tente ajustar os filtros de busca.' 
                  : 'Comece criando sua primeira vaga de emprego.'}
              </p>
              {(!searchTerm && statusFilter === 'all') && (
                <Button
                  onClick={openCreateModal}
                  className="bg-gradient-cosmic hover-cosmic"
                >
                  Criar Primeira Vaga
                </Button>
              )}
            </div>
          ) : (
            filteredVagas.map((vaga) => (
              <div key={vaga.id} className="bg-white rounded-xl border border-gray-200/60 p-4 hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-medium text-gray-900 truncate">
                        {vaga.titulo}
                      </h3>
                      <Badge variant={vaga.ativa ? 'success' : 'secondary'}>
                        {vaga.ativa ? 'Ativa' : 'Inativa'}
                      </Badge>
                    </div>
                    
                    {vaga.descricao && (
                      <p className="text-gray-600 text-sm mb-3 line-clamp-1">{vaga.descricao}</p>
                    )}
                    
                    <div className="flex flex-wrap gap-2 text-xs">
                      {vaga.departamento && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded">
                          {vaga.departamento}
                        </span>
                      )}
                      {vaga.tipo_contrato && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded">
                          {vaga.tipo_contrato}
                        </span>
                      )}
                      {vaga.modelo_trabalho && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded">
                          {vaga.modelo_trabalho}
                        </span>
                      )}
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded">
                        {vaga.vagas_disponiveis} vaga{vaga.vagas_disponiveis !== 1 ? 's' : ''}
                      </span>
                    </div>
                    
                    <div className="mt-2 text-xs text-gray-500">
                      Criada em: {new Date(vaga.created_at).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => updateStatus(vaga.id, !vaga.ativa)}
                      className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                      title={vaga.ativa ? 'Pausar vaga' : 'Ativar vaga'}
                    >
                      {vaga.ativa ? '⏸️' : '▶️'}
                    </button>
                    
                    <button
                      onClick={() => copyLink(vaga.vaga_key)}
                      className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Copiar link"
                    >
                      🔗
                    </button>
                    
                    <button
                      onClick={() => openEditModal(vaga)}
                      className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Editar vaga"
                    >
                      ✏️
                    </button>
                    
                    <Link
                      href={`/admin/vagas/${vaga.id}/candidatos`}
                      className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Ver candidatos"
                    >
                      👥
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        
        {/* Modal Nova Vaga */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-2xl font-bold mb-4">
              {editingVaga ? 'Editar Vaga' : 'Nova Vaga'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Título *</label>
                <input
                  type="text"
                  name="titulo"
                  required
                  value={formData.titulo}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Cargo</label>
                <select
                  name="cargo"
                  value={formData.cargo}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="">Selecione um cargo</option>
                  {jobTitles.map(job => (
                    <option key={job.id} value={job.name}>
                      {job.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Descrição</label>
                <textarea
                  name="descricao"
                  value={formData.descricao}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Departamento</label>
                  <input
                    type="text"
                    name="departamento"
                    value={formData.departamento}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Tipo de Contrato</label>
                  <select
                    name="tipo_contrato"
                    value={formData.tipo_contrato}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="">Selecione</option>
                    <option value="CLT">CLT</option>
                    <option value="PJ">PJ</option>
                    <option value="Estágio">Estágio</option>
                    <option value="Freelance">Freelance</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Modelo de Trabalho</label>
                  <select
                    name="modelo_trabalho"
                    value={formData.modelo_trabalho}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="">Selecione</option>
                    <option value="Remoto">Remoto</option>
                    <option value="Presencial">Presencial</option>
                    <option value="Híbrido">Híbrido</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Vagas Disponíveis</label>
                  <input
                    type="number"
                    name="vagas_disponiveis"
                    min="1"
                    value={formData.vagas_disponiveis}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Prazo do Case Prático (dias)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      name="prazo_case_dias"
                      min="1"
                      max="30"
                      value={formData.prazo_case_dias}
                      onChange={handleChange}
                      className="w-24 px-3 py-2 border rounded-md focus:ring-2 focus:ring-violet-500"
                    />
                    <span className="text-sm text-gray-600">
                      dias após aprovação
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    ℹ️ Candidatos terão este prazo para completar o case após serem aprovados pela IA. Padrão: 5 dias (D+5)
                  </p>
                </div>

                {/* Link do Case no Notion */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Link do Case Prático (Notion)
                  </label>
                  <input
                    type="url"
                    name="case_link_notion"
                    value={formData.case_link_notion}
                    onChange={handleChange}
                    placeholder="https://notion.so/autou-digital/..."
                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-violet-500"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    📖 Link do Notion com o enunciado do case. Será enviado por email aos candidatos aprovados pela IA.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Salário Mínimo</label>
                  <input
                    type="number"
                    name="salario_min"
                    value={formData.salario_min}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Salário Máximo</label>
                  <input
                    type="number"
                    name="salario_max"
                    value={formData.salario_max}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Requisitos</label>
                <textarea
                  name="requisitos"
                  value={formData.requisitos}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Digite cada requisito em uma linha separada&#10;Exemplo:&#10;Experiência com React&#10;Conhecimento em TypeScript&#10;Inglês intermediário"
                  className="w-full px-3 py-2 border rounded-md"
                />
                <p className="text-xs text-gray-500 mt-1">Digite cada requisito em uma linha separada</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Benefícios</label>
                <textarea
                  name="beneficios"
                  value={formData.beneficios}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Digite cada benefício em uma linha separada&#10;Exemplo:&#10;Vale Alimentação&#10;Plano de Saúde&#10;Home Office"
                  className="w-full px-3 py-2 border rounded-md"
                />
                <p className="text-xs text-gray-500 mt-1">Digite cada benefício em uma linha separada</p>
              </div>
              
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2 border rounded-md hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <LoadingButton
                  type="submit"
                  loading={saving}
                  className="btn-primary"
                >
                  {editingVaga ? 'Salvar Alterações' : 'Criar Vaga'}
                </LoadingButton>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </AdminLayout>
  )
}