'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAdminAuth } from '@/hooks/useAdminAuth'
import Link from 'next/link'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { LoadingPage } from '@/components/ui/loading'
import { useToast } from '@/components/ui/toast'

interface Vaga {
  id: string
  titulo: string
  descricao?: string
  departamento?: string
  ativa: boolean
}

interface Candidato {
  id: string
  nome_completo: string
  email: string
  telefone?: string
  whatsapp?: string
  linkedin?: string
  portfolio?: string
  github?: string
  cidade?: string
  estado?: string
  empresa_atual?: string
  cargo_atual?: string
  tempo_experiencia_total?: number
  competencias_tecnicas?: string
  linguagens_programacao?: string
  nivel_ingles?: string
  pretensao_salarial?: number
  disponibilidade_inicio?: string
  score_ia?: number
  status: string
  vaga_id: string
  created_at: string
}

export default function CandidatosVagaPage() {
  const router = useRouter()
  const params = useParams()
  const vagaId = params.id as string
  const { user, loading: authLoading, isAdmin } = useAdminAuth()
  const { addToast } = useToast()
  
  const [vaga, setVaga] = useState<Vaga | null>(null)
  const [candidatos, setCandidatos] = useState<Candidato[]>([])
  const [loading, setLoading] = useState(true)
  const [filtroStatus, setFiltroStatus] = useState<string>('')

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/admin/auth/login')
    } else if (!authLoading && user && vagaId) {
      loadData()
    }
  }, [authLoading, user, vagaId, router])

  const loadData = async () => {
    try {
      const supabase = createClient()
      
      const [vagaRes, candidatosRes] = await Promise.all([
        supabase.from('aura_jobs_vagas').select('*').eq('id', vagaId).single(),
        supabase.from('aura_jobs_candidatos').select('*').eq('vaga_id', vagaId).order('created_at', { ascending: false })
      ])

      if (!vagaRes.error && vagaRes.data) {
        setVaga(vagaRes.data)
      }
      
      if (!candidatosRes.error && candidatosRes.data) {
        setCandidatos(candidatosRes.data)
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      addToast({
        type: 'error',
        title: 'Erro',
        message: 'Erro ao carregar dados. Tente novamente.'
      })
    } finally {
      setLoading(false)
    }
  }

  const updateCandidatoStatus = async (candidatoId: string, status: string) => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('aura_jobs_candidatos')
        .update({ status })
        .eq('id', candidatoId)
      
      if (error) throw error
      
      addToast({
        type: 'success',
        title: 'Status atualizado',
        message: 'O status do candidato foi atualizado com sucesso.'
      })
      
      loadData()
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
      addToast({
        type: 'error',
        title: 'Erro',
        message: 'Erro ao atualizar status do candidato.'
      })
    }
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'pendente': 'bg-gray-100 text-gray-800',
      'em_analise': 'bg-blue-100 text-blue-800',
      'aprovado': 'bg-green-100 text-green-800',
      'reprovado': 'bg-red-100 text-red-800',
      'inscrito': 'bg-blue-100 text-blue-800',
      'em_avaliacao_ia': 'bg-yellow-100 text-yellow-800',
      'reprovado_ia': 'bg-red-100 text-red-800',
      'case_enviado': 'bg-purple-100 text-purple-800',
      'em_avaliacao_case': 'bg-orange-100 text-orange-800',
      'aprovado_case': 'bg-green-100 text-green-800',
      'reprovado_case': 'bg-red-100 text-red-800',
      'entrevista_tecnica': 'bg-indigo-100 text-indigo-800',
      'entrevista_socios': 'bg-pink-100 text-pink-800',
      'contratado': 'bg-emerald-100 text-emerald-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'pendente': 'Pendente',
      'em_analise': 'Em Análise',
      'aprovado': 'Aprovado',
      'reprovado': 'Reprovado',
      'inscrito': 'Inscrito',
      'em_avaliacao_ia': 'Em Avaliação IA',
      'reprovado_ia': 'Reprovado IA',
      'case_enviado': 'Case Enviado',
      'em_avaliacao_case': 'Avaliando Case',
      'aprovado_case': 'Case Aprovado',
      'reprovado_case': 'Case Reprovado',
      'entrevista_tecnica': 'Entrevista Técnica',
      'entrevista_socios': 'Entrevista Sócios',
      'contratado': 'Contratado',
    }
    return labels[status] || status
  }

  const candidatosFiltrados = filtroStatus 
    ? candidatos.filter(c => c.status === filtroStatus)
    : candidatos

  const estatisticas = {
    total: candidatos.length,
    porStatus: candidatos.reduce((acc, candidato) => {
      acc[candidato.status] = (acc[candidato.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  }

  if (authLoading || loading) {
    return (
      <LoadingPage 
        text={authLoading ? 'Verificando autenticação...' : 'Carregando candidatos...'}
      />
    )
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-red-600">Acesso Negado</h1>
          <p className="text-gray-600">Você não tem permissão de administrador.</p>
          <button 
            onClick={() => router.push('/admin/auth/login')} 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Fazer Login
          </button>
        </div>
      </div>
    )
  }

  if (!vaga) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Vaga não encontrada</h1>
        </div>
      </div>
    )
  }

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/vagas" className="text-gray-600 hover:text-gray-900">
              ← Voltar
            </Link>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Candidatos - {vaga.titulo}
              </h1>
              <p className="text-gray-600 mt-1">
                {vaga.departamento} • {estatisticas.total} candidato{estatisticas.total !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{estatisticas.total}</div>
              <div className="text-xs text-gray-600">Total</div>
            </div>
          </div>
          
          {Object.entries(estatisticas.porStatus).map(([status, count]) => (
            <div key={status} className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{count}</div>
                <div className="text-xs text-gray-600">{getStatusLabel(status)}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-xl border border-gray-200/60 p-4">
          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          >
            <option value="">Todos os status</option>
            {Object.keys(estatisticas.porStatus).map(status => (
              <option key={status} value={status}>
                {getStatusLabel(status)} ({estatisticas.porStatus[status]})
              </option>
            ))}
          </select>
        </div>

        {/* Lista de Candidatos */}
        <div className="space-y-3">
          {candidatosFiltrados.map((candidato) => (
            <div key={candidato.id} className="bg-white rounded-xl border border-gray-200/60 p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-3">
                    <h3 className="text-lg font-medium text-gray-900">{candidato.nome_completo}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(candidato.status)}`}>
                      {getStatusLabel(candidato.status)}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                    <div>
                      <strong>Email:</strong> {candidato.email}
                    </div>
                    <div>
                      <strong>WhatsApp:</strong> {candidato.whatsapp || candidato.telefone || 'N/A'}
                    </div>
                    <div>
                      <strong>Cidade:</strong> {candidato.cidade || 'N/A'}, {candidato.estado || 'N/A'}
                    </div>
                    <div>
                      <strong>Empresa:</strong> {candidato.empresa_atual || 'N/A'}
                    </div>
                    <div>
                      <strong>Cargo:</strong> {candidato.cargo_atual || 'N/A'}
                    </div>
                    <div>
                      <strong>Experiência:</strong> {candidato.tempo_experiencia_total ? `${Math.floor(candidato.tempo_experiencia_total/12)} anos` : 'N/A'}
                    </div>
                    {candidato.nivel_ingles && (
                      <div>
                        <strong>Inglês:</strong> {candidato.nivel_ingles}
                      </div>
                    )}
                    {candidato.pretensao_salarial && (
                      <div>
                        <strong>Pretensão:</strong> R$ {candidato.pretensao_salarial.toLocaleString('pt-BR')}
                      </div>
                    )}
                    {candidato.disponibilidade_inicio && (
                      <div>
                        <strong>Disponibilidade:</strong> {candidato.disponibilidade_inicio}
                      </div>
                    )}
                  </div>

                  {candidato.competencias_tecnicas && (
                    <div className="mt-3">
                      <strong className="text-sm">Competências Técnicas:</strong>
                      <p className="text-sm text-gray-600">{candidato.competencias_tecnicas}</p>
                    </div>
                  )}
                  {candidato.linguagens_programacao && (
                    <div className="mt-2">
                      <strong className="text-sm">Linguagens:</strong>
                      <p className="text-sm text-gray-600">{candidato.linguagens_programacao}</p>
                    </div>
                  )}
                  {candidato.linkedin && (
                    <div className="mt-2">
                      <a href={candidato.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                        LinkedIn →
                      </a>
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col gap-2 ml-4">
                  <select
                    value={candidato.status}
                    onChange={(e) => updateCandidatoStatus(candidato.id, e.target.value)}
                    className="text-xs border rounded px-2 py-1"
                  >
                    <option value="pendente">Pendente</option>
                    <option value="em_analise">Em Análise</option>
                    <option value="aprovado">Aprovado</option>
                    <option value="reprovado">Reprovado</option>
                    <option value="inscrito">Inscrito</option>
                    <option value="em_avaliacao_ia">Em Avaliação IA</option>
                    <option value="reprovado_ia">Reprovado IA</option>
                    <option value="case_enviado">Case Enviado</option>
                    <option value="em_avaliacao_case">Avaliando Case</option>
                    <option value="aprovado_case">Case Aprovado</option>
                    <option value="reprovado_case">Case Reprovado</option>
                    <option value="entrevista_tecnica">Entrevista Técnica</option>
                    <option value="entrevista_socios">Entrevista Sócios</option>
                    <option value="contratado">Contratado</option>
                  </select>
                  
                  <Link
                    href={`/admin/candidatos/${candidato.id}`}
                    className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors text-center"
                  >
                    Ver Detalhes
                  </Link>
                </div>
              </div>
            </div>
          ))}
          
          {candidatosFiltrados.length === 0 && (
            <div className="bg-white rounded-xl border border-gray-200/60 p-12 text-center">
              <p className="text-gray-500">
                {filtroStatus ? 'Nenhum candidato encontrado com este status.' : 'Nenhum candidato inscrito nesta vaga ainda.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}