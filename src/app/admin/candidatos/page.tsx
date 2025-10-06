'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAdminAuth } from '@/hooks/useAdminAuth'
import { AdminLayout } from '@/components/admin/AdminLayout'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface Vaga {
  id: string
  titulo: string
  departamento?: string
  prazo_case_dias?: number
}

interface Candidato {
  id: string
  nome_completo: string
  email: string
  telefone?: string
  cidade?: string
  estado?: string
  experiencia_anos?: number
  cargo_atual?: string
  principais_skills?: string
  score_ia?: number
  status: string
  vaga_id: string
  data_inscricao: string
  vaga?: Vaga
}

export default function CandidatosPage() {
  const router = useRouter()
  const { user, loading: authLoading, isAdmin } = useAdminAuth()
  const [candidatos, setCandidatos] = useState<Candidato[]>([])
  const [loading, setLoading] = useState(true)
  const [filtroStatus, setFiltroStatus] = useState<string>('')
  const [filtroVaga, setFiltroVaga] = useState<string>('')
  const [vagas, setVagas] = useState<Vaga[]>([])

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/admin/auth/login')
    } else if (!authLoading && user) {
      loadData()
    }
  }, [authLoading, user, router])

  const loadData = async () => {
    const supabase = createClient()
    
    const [candidatosRes, vagasRes] = await Promise.all([
      supabase
        .from('aura_jobs_candidatos')
        .select('*')
        .order('data_inscricao', { ascending: false }),
      supabase
        .from('aura_jobs_vagas')
        .select('*')
        .order('titulo')
    ])

    if (!candidatosRes.error && candidatosRes.data) {
      // Mapear as vagas para os candidatos
      const candidatosComVagas = candidatosRes.data.map(candidato => {
        const vaga = vagasRes.data?.find(v => v.id === candidato.vaga_id)
        return { ...candidato, vaga }
      })
      setCandidatos(candidatosComVagas)
    }
    
    if (!vagasRes.error && vagasRes.data) {
      console.log('📚 Vagas carregadas:', vagasRes.data.map(v => ({
        titulo: v.titulo,
        prazo_case_dias: v.prazo_case_dias
      })))
      setVagas(vagasRes.data)
    }

    setLoading(false)
  }

  const updateCandidatoStatus = async (candidatoId: string, novoStatus: string) => {
    const supabase = createClient()

    // 1. Encontrar candidato nos dados já carregados
    const candidato = candidatos.find(c => c.id === candidatoId)

    if (!candidato) {
      console.error('❌ Candidato não encontrado')
      alert('Erro: candidato não encontrado')
      return
    }

    // 2. Encontrar vaga nos dados já carregados
    const vaga = vagas.find(v => v.id === candidato.vaga_id)

    console.log('📋 Candidato encontrado:', candidato.nome_completo, candidato.email)
    console.log('📋 Vaga encontrada:', vaga?.titulo)
    console.log('📋 Objeto vaga completo:', vaga)
    console.log('📋 Prazo case (vaga?.prazo_case_dias):', vaga?.prazo_case_dias)
    console.log('📋 Status atual:', candidato.status, '→ Novo status:', novoStatus)

    // 3. Atualizar status
    const { error: updateError } = await supabase
      .from('aura_jobs_candidatos')
      .update({ status: novoStatus })
      .eq('id', candidatoId)

    if (updateError) {
      console.error('❌ Erro ao atualizar status:', updateError)
      alert('Erro ao atualizar status do candidato')
      return
    }

    console.log('✅ Status atualizado com sucesso')

    // 3. Enviar e-mail baseado no status
    let emailType = null
    let emailData: any = {}

    const vagaTitulo = vaga?.titulo || 'a vaga'
    const prazoCaseDias = vaga?.prazo_case_dias || 7

    switch(novoStatus) {
      case 'reprovado_ia':
        emailType = 'reprovacaoIA'
        emailData = {
          nome: candidato.nome_completo,
          vagaTitulo,
          score: candidato.score_ia || 0,
          feedback: 'Seu perfil não atendeu os requisitos mínimos para esta vaga.'
        }
        break

      case 'case_enviado':
        emailType = 'aprovacaoIA'
        emailData = {
          nome: candidato.nome_completo,
          vagaTitulo,
          score: candidato.score_ia || 0,
          prazoCase: `${prazoCaseDias} dias`,
          linkCase: `https://autou.com.br/candidato/case/${candidatoId}`
        }
        break

      case 'aprovado_case':
        emailType = 'aprovacaoCase'
        emailData = {
          nome: candidato.nome_completo,
          vagaTitulo
        }
        break

      case 'reprovado_case':
        emailType = 'reprovacaoCase'
        emailData = {
          nome: candidato.nome_completo,
          vagaTitulo
        }
        break

      case 'contratado':
        emailType = 'aprovacaoContratacao'
        emailData = {
          nome: candidato.nome_completo,
          vagaTitulo,
          proximosPassos: 'Em breve nossa equipe de RH entrará em contato com você para discutir os próximos passos da sua contratação.'
        }
        break

      case 'reprovado_socios':
        emailType = 'reprovacaoSocios'
        emailData = {
          nome: candidato.nome_completo,
          vagaTitulo
        }
        break
    }

    // 4. Enviar e-mail se houver tipo definido
    if (emailType) {
      console.log(`📧 Preparando e-mail de ${emailType} para ${candidato.email}`)
      console.log('📧 Dados do e-mail:', emailData)

      try {
        const response = await fetch('/api/emails/send-notification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: candidato.email,
            type: emailType,
            data: emailData
          })
        })

        const result = await response.json()

        if (response.ok) {
          console.log(`✅ E-mail de ${emailType} enviado com sucesso para ${candidato.email}`)
          console.log('✅ Resposta da API:', result)
        } else {
          console.error('❌ Erro na resposta da API:', result)
        }
      } catch (error) {
        console.error('❌ Erro ao enviar e-mail:', error)
        // Não bloqueia o fluxo se e-mail falhar
      }
    } else {
      console.log(`ℹ️ Nenhum e-mail configurado para o status: ${novoStatus}`)
    }

    loadData()
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'inscrito': 'bg-blue-100 text-blue-800',
      'em_avaliacao_ia': 'bg-yellow-100 text-yellow-800',
      'reprovado_ia': 'bg-red-100 text-red-800',
      'case_enviado': 'bg-purple-100 text-purple-800',
      'em_avaliacao_case': 'bg-orange-100 text-orange-800',
      'aprovado_case': 'bg-green-100 text-green-800',
      'reprovado_case': 'bg-red-100 text-red-800',
      'entrevista_tecnica': 'bg-indigo-100 text-indigo-800',
      'entrevista_socios': 'bg-pink-100 text-pink-800',
      'reprovado': 'bg-red-100 text-red-800',
      'reprovado_socios': 'bg-red-100 text-red-800',
      'contratado': 'bg-emerald-100 text-emerald-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'inscrito': 'Inscrição Recebida',
      'em_avaliacao_ia': 'Em Avaliação pela IA',
      'reprovado_ia': 'Reprovado pelo Teste IA',
      'aprovado_ia': 'Aprovado pelo Teste IA',
      'case_enviado': 'Case Prático Enviado',
      'em_avaliacao_case': 'Case em Avaliação',
      'aprovado_case': 'Case Aprovado',
      'reprovado_case': 'Reprovado na Etapa do Case',
      'entrevista_tecnica': 'Entrevista Técnica Agendada',
      'entrevista_socios': 'Marcar Entrevista Com Sócio',
      'reprovado': 'Reprovado',
      'reprovado_socios': 'Reprovado Pelos Sócios',
      'contratado': 'Contratado',
    }
    return labels[status] || status
  }

  const candidatosFiltrados = candidatos.filter(candidato => {
    const statusMatch = !filtroStatus || candidato.status === filtroStatus
    const vagaMatch = !filtroVaga || candidato.vaga_id === filtroVaga
    return statusMatch && vagaMatch
  })

  const estatisticas = {
    total: candidatos.length,
    porStatus: candidatos.reduce((acc, candidato) => {
      acc[candidato.status] = (acc[candidato.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Carregando...</h1>
          <p className="text-sm text-gray-500 mt-2">
            {authLoading ? 'Verificando autenticação...' : 'Carregando candidatos...'}
          </p>
        </div>
      </div>
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

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Candidatos</h1>
          <p className="text-gray-600 mt-1">
            {estatisticas.total} candidato{estatisticas.total !== 1 ? 's' : ''} no total
          </p>
        </div>
        {/* Estatísticas */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
          <Card variant="clean" size="sm">
            <CardContent className="text-center">
              <div className="text-2xl font-bold text-neutral-900">{estatisticas.total}</div>
              <div className="text-xs text-neutral-600">Total</div>
            </CardContent>
          </Card>
          
          {Object.entries(estatisticas.porStatus).map(([status, count]) => (
            <Card key={status} variant="clean" size="sm">
              <CardContent className="text-center">
                <div className="text-2xl font-bold text-neutral-900">{count}</div>
                <div className="text-xs text-neutral-600">{getStatusLabel(status)}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filtros */}
        <div className="mb-6 flex gap-4 flex-wrap">
          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            className="input-clean max-w-xs"
          >
            <option value="">Todos os status</option>
            {Object.keys(estatisticas.porStatus).map(status => (
              <option key={status} value={status}>
                {getStatusLabel(status)} ({estatisticas.porStatus[status]})
              </option>
            ))}
          </select>

          <select
            value={filtroVaga}
            onChange={(e) => setFiltroVaga(e.target.value)}
            className="input-clean max-w-xs"
          >
            <option value="">Todas as vagas</option>
            {vagas.map(vaga => (
              <option key={vaga.id} value={vaga.id}>
                {vaga.titulo}
              </option>
            ))}
          </select>
        </div>

        {/* Lista de Candidatos */}
        <div className="space-y-4">
          {candidatosFiltrados.map((candidato) => (
            <Card key={candidato.id} variant="clean" className={candidato.status === 'entrevista_socios' ? 'border-l-4 border-l-pink-500 bg-pink-50/30' : ''}>
              <CardContent>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-3">
                      <h3 className="text-heading-3">{candidato.nome_completo}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(candidato.status)}`}>
                        {getStatusLabel(candidato.status)}
                      </span>
                    </div>
                    
                    <div className="mb-3">
                      <Link 
                        href={`/admin/vagas/${candidato.vaga_id}/candidatos`}
                        className="text-body-small text-cosmic-purple hover:underline font-medium"
                      >
                        📋 {candidato.vaga?.titulo || 'Vaga não encontrada'}
                      </Link>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-body-small text-neutral-600">
                      <div>
                        <strong>Email:</strong> {candidato.email}
                      </div>
                      <div>
                        <strong>Telefone:</strong> {candidato.telefone || 'N/A'}
                      </div>
                      <div>
                        <strong>Cidade:</strong> {candidato.cidade || 'N/A'}, {candidato.estado || 'N/A'}
                      </div>
                      <div>
                        <strong>Experiência:</strong> {candidato.experiencia_anos || 0} anos
                      </div>
                      <div>
                        <strong>Score IA:</strong> {candidato.score_ia ? `${candidato.score_ia}/10` : 'N/A'}
                      </div>
                      <div>
                        <strong>Inscrição:</strong> {format(new Date(candidato.data_inscricao), 'dd/MM/yyyy', { locale: ptBR })}
                      </div>
                    </div>

                    {candidato.principais_skills && (
                      <div className="mt-3">
                        <strong className="text-body-small">Skills:</strong>
                        <p className="text-body-small text-neutral-600">{candidato.principais_skills}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col gap-2 ml-4">
                    <select
                      value={candidato.status}
                      onChange={(e) => updateCandidatoStatus(candidato.id, e.target.value)}
                      className="text-xs border rounded px-2 py-1"
                    >
                      <option value="inscrito">Inscrito</option>
                      <option value="em_avaliacao_ia">Em Avaliação IA</option>
                      <option value="reprovado_ia">Reprovado IA</option>
                      <option value="case_enviado">Case Enviado</option>
                      <option value="em_avaliacao_case">Avaliando Case</option>
                      <option value="aprovado_case">Case Aprovado</option>
                      <option value="reprovado_case">Case Reprovado</option>
                      <option value="entrevista_tecnica">Entrevista Técnica</option>
                      <option value="entrevista_socios">Entrevista Sócios</option>
                      <option value="aprovado">Aprovado</option>
                      <option value="reprovado">Reprovado</option>
                      <option value="contratado">Contratado</option>
                    </select>
                    
                    <Link
                      href={`/admin/candidatos/${candidato.id}`}
                      className="btn-ghost text-xs py-1 px-2 text-center"
                    >
                      Ver Detalhes
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {candidatosFiltrados.length === 0 && (
            <Card variant="clean">
              <CardContent className="text-center py-12">
                <p className="text-neutral-500">
                  Nenhum candidato encontrado com os filtros selecionados.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}