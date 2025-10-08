'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAdminAuth } from '@/hooks/useAdminAuth'
import { AdminLayout } from '@/components/admin/AdminLayout'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useConfirm } from '@/components/ui/confirm-dialog'
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
  const confirm = useConfirm()
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

  // Função para obter transições de status baseado no status atual
  const getStatusTransition = (currentStatus: string) => {
    const transitions: Record<string, { next: string; reject: string; stage: string }> = {
      'inscrito': { next: 'em_avaliacao_ia', reject: 'reprovado_ia', stage: 'Inscrição' },
      'em_avaliacao_ia': { next: 'case_enviado', reject: 'reprovado_ia', stage: 'Avaliação IA' },
      'case_enviado': { next: 'entrevista_tecnica', reject: 'reprovado_case', stage: 'Case Prático' },
      'entrevista_tecnica': { next: 'entrevista_socios', reject: 'reprovado', stage: 'Entrevista Técnica' },
      'entrevista_socios': { next: 'contratado', reject: 'reprovado_socios', stage: 'Entrevista com Sócios' }
    }
    return transitions[currentStatus]
  }

  // Função para aprovar candidato para próxima etapa
  const aprovarParaProximaEtapa = async (candidatoId: string, currentStatus: string) => {
    const transition = getStatusTransition(currentStatus)
    if (!transition) {
      alert('Este candidato não pode ser aprovado (já está em uma etapa final)')
      return
    }

    const candidato = candidatos.find(c => c.id === candidatoId)
    if (!candidato) return

    const confirmar = await confirm({
      type: 'approve',
      title: 'APROVAR CANDIDATO',
      candidato: candidato.nome_completo,
      etapa: transition.stage,
      actions: [
        'Mover para a próxima etapa do processo seletivo',
        'Enviar e-mail de aprovação ao candidato',
        'Atualizar status no sistema'
      ]
    })

    if (confirmar) {
      await updateCandidatoStatus(candidatoId, transition.next)
    }
  }

  // Função para reprovar candidato na etapa atual
  const reprovarCandidatoNaEtapa = async (candidatoId: string, currentStatus: string) => {
    const transition = getStatusTransition(currentStatus)
    if (!transition) {
      alert('Este candidato não pode ser reprovado (já está em uma etapa final)')
      return
    }

    const candidato = candidatos.find(c => c.id === candidatoId)
    if (!candidato) return

    const confirmar = await confirm({
      type: 'reject',
      title: 'ATENÇÃO: REPROVAR CANDIDATO',
      candidato: candidato.nome_completo,
      etapa: transition.stage,
      actions: [
        'Mover o candidato para o Histórico de Candidatos',
        'Enviar um e-mail de reprovação',
        'Remover da lista de candidatos ativos'
      ],
      warning: 'Esta ação não pode ser facilmente revertida'
    })

    if (confirmar) {
      await updateCandidatoStatus(candidatoId, transition.reject)
    }
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

    // 3. Atualizar status via API (para contornar limitação do enum)
    // Mapear 'reprovado_socios' para 'reprovado' no banco (email específico será enviado depois)
    const statusParaBanco = novoStatus === 'reprovado_socios' ? 'reprovado' : novoStatus

    // Salvar no localStorage qual foi o tipo de reprovação (para distinguir depois)
    if (novoStatus === 'reprovado_socios') {
      const reprovacoesSocios = JSON.parse(localStorage.getItem('candidatos_reprovados_socios') || '{}')
      reprovacoesSocios[candidatoId] = true
      localStorage.setItem('candidatos_reprovados_socios', JSON.stringify(reprovacoesSocios))
    } else if (novoStatus === 'reprovado') {
      // Se mudou para "reprovado" genérico, remover do tracking de sócios
      const reprovacoesSocios = JSON.parse(localStorage.getItem('candidatos_reprovados_socios') || '{}')
      delete reprovacoesSocios[candidatoId]
      localStorage.setItem('candidatos_reprovados_socios', JSON.stringify(reprovacoesSocios))
    }

    try {
      const response = await fetch('/api/admin/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidatoId,
          novoStatus: statusParaBanco
        })
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Erro ao atualizar status')
      }

      console.log('✅ Status atualizado via API')
    } catch (error: any) {
      console.error('❌ Erro ao atualizar status:', error)
      alert(`Erro ao atualizar status: ${error.message}`)
      return
    }

    // 3. Enviar e-mail baseado no status
    let emailType = null
    let emailData: any = {}

    const vagaTitulo = vaga?.titulo || 'a vaga'

    // Buscar prazo do case do localStorage (já que não existe na tabela do banco)
    let prazoCaseDias = 7 // Padrão
    if (typeof window !== 'undefined' && vaga?.id) {
      const prazosCase = JSON.parse(localStorage.getItem('vagas_prazos_case') || '{}')
      prazoCaseDias = prazosCase[vaga.id] || 7
    }

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
        // Mapear link do case prático baseado no título da vaga
        // URLs com caracteres especiais devidamente encodados para evitar 404 em clientes de email
        let linkCase = 'https://autou.com.br/candidato/case' // Link padrão (fallback)

        if (vagaTitulo.toLowerCase().includes('consultor')) {
          linkCase = 'https://www.notion.so/autou-digital/Case-Pr%C3%A1tico-AutoU-Consultoria-1ff36ce78e5580f5a410c5393d227bfe?source=copy_link'
        } else if (vagaTitulo.toLowerCase().includes('desenvolvedor') || vagaTitulo.toLowerCase().includes('developer') || vagaTitulo.toLowerCase().includes('full stack')) {
          linkCase = 'https://www.notion.so/autou-digital/Case-Pr%C3%A1tico-AutoU-Desenvolvimento-18836ce78e5580d0b59bcf9610b27769?source=copy_link'
        } else if (vagaTitulo.toLowerCase().includes('product') || vagaTitulo.toLowerCase().includes('designer') || vagaTitulo.toLowerCase().includes('po')) {
          linkCase = 'https://www.notion.so/autou-digital/Case-Pr%C3%A1tico-AutoU-Product-Designer-PO-20d36ce78e5580a5a8f7ce7693d4bfce?source=copy_link'
        }

        emailType = 'aprovacaoIA'
        emailData = {
          nome: candidato.nome_completo,
          vagaTitulo,
          score: candidato.score_ia || 0,
          prazoCase: `${prazoCaseDias} dias`,
          linkCase
        }
        break

      case 'reprovado_case':
        emailType = 'reprovacaoCase'
        emailData = {
          nome: candidato.nome_completo,
          vagaTitulo
        }
        break

      case 'entrevista_tecnica':
        // 6. Aguardando Entrevista Técnica (case aprovado)
        emailType = 'aprovacaoCase'
        emailData = {
          nome: candidato.nome_completo,
          vagaTitulo
        }
        break

      case 'reprovado':
        // 7. Reprovado na Entrevista Técnica
        emailType = 'reprovacaoEntrevistaTecnica'
        emailData = {
          nome: candidato.nome_completo,
          vagaTitulo
        }
        break

      case 'entrevista_socios':
        // 8. Aguardando Entrevista com Sócios (aprovado na técnica)
        emailType = 'aprovacaoEntrevistaTecnica'
        emailData = {
          nome: candidato.nome_completo,
          vagaTitulo
        }
        break

      case 'reprovado_socios':
        // 9. Reprovado na Entrevista com Sócios
        emailType = 'reprovacaoSocios'
        emailData = {
          nome: candidato.nome_completo,
          vagaTitulo
        }
        break

      case 'contratado':
        // 10. Contratado (aprovado pelos sócios)
        emailType = 'aprovacaoContratacao'
        emailData = {
          nome: candidato.nome_completo,
          vagaTitulo,
          proximosPassos: 'Em breve nossa equipe de RH entrará em contato com você para discutir os próximos passos da sua contratação.'
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

  const getStatusVariant = (status: string) => {
    const variants: Record<string, string> = {
      // 🔴 Reprovações (tons de vermelho crescente por etapa)
      'reprovado_ia': 'red-light',           // 3. Reprovado pela IA
      'reprovado_case': 'red-medium',        // 5. Case Reprovado
      'reprovado': 'red-dark',               // 7. Reprovado na Entrevista Técnica
      'reprovado_socios': 'red-intense',     // 9. Reprovado na Entrevista com Sócios

      // 🟢 Contratado (verde intenso - sucesso final)
      'contratado': 'green-intense',         // 10. Contratado

      // 🔵 Processos aguardando (azul)
      'inscrito': 'blue-light',              // 1. Inscrito
      'case_enviado': 'blue-medium',         // 4. Case Enviado
      'entrevista_tecnica': 'violet',        // 6. Aguardando Entrevista Técnica
      'entrevista_socios': 'pink',           // 8. Aguardando Entrevista com Sócios

      // 🟡 Em processamento (amarelo)
      'em_avaliacao_ia': 'yellow-light',     // 2. Em Avaliação IA
    }

    return variants[status] || 'secondary'
  }

  // Obter status real do candidato (considerando localStorage para reprovado_socios)
  const getStatusReal = (candidatoId: string, statusDoBanco: string): string => {
    if (statusDoBanco === 'reprovado') {
      const reprovacoesSocios = JSON.parse(localStorage.getItem('candidatos_reprovados_socios') || '{}')
      if (reprovacoesSocios[candidatoId]) {
        return 'reprovado_socios'
      }
    }
    return statusDoBanco
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'inscrito': 'Inscrito',
      'em_avaliacao_ia': 'Em Avaliação IA',
      'reprovado_ia': 'Reprovado pela IA',
      'case_enviado': 'Case Enviado',
      'reprovado_case': 'Case Reprovado',
      'entrevista_tecnica': 'Aguardando Entrevista Técnica',
      'reprovado': 'Reprovado na Entrevista Técnica',
      'entrevista_socios': 'Aguardando Entrevista com Sócios',
      'reprovado_socios': 'Reprovado na Entrevista com Sócios',
      'contratado': 'Contratado',
    }
    return labels[status] || status
  }

  // Filtrar apenas candidatos ativos (não reprovados e não contratados)
  const candidatosAtivos = candidatos.filter(candidato => {
    const isReprovado = candidato.status.includes('reprovado')
    const isContratado = candidato.status === 'contratado'
    return !isReprovado && !isContratado
  })

  const candidatosFiltrados = candidatosAtivos.filter(candidato => {
    const statusMatch = !filtroStatus || candidato.status === filtroStatus
    const vagaMatch = !filtroVaga || candidato.vaga_id === filtroVaga
    return statusMatch && vagaMatch
  })

  const estatisticas = {
    total: candidatosAtivos.length,
    porStatus: candidatosAtivos.reduce((acc, candidato) => {
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
          <Button
            onClick={() => router.push('/admin/auth/login')}
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
        <div className="mb-8">
          <h1 className="text-heading-1 text-gradient-cosmic mb-2">Candidatos</h1>
          <p className="text-body text-neutral-600">
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
        <div className="mb-6 flex gap-4 flex-wrap items-center">
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
                      <Badge variant={getStatusVariant(getStatusReal(candidato.id, candidato.status))}>
                        {getStatusLabel(getStatusReal(candidato.id, candidato.status))}
                      </Badge>
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
                    {getStatusTransition(candidato.status) ? (
                      <>
                        <Button
                          onClick={() => aprovarParaProximaEtapa(candidato.id, candidato.status)}
                          variant="default"
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          ✓ Aprovar Para Próxima Etapa
                        </Button>
                        <Button
                          onClick={() => reprovarCandidatoNaEtapa(candidato.id, candidato.status)}
                          variant="destructive"
                          size="sm"
                        >
                          ✗ Reprovar Nesta Etapa
                        </Button>
                      </>
                    ) : (
                      <div className="text-xs text-gray-500 italic">
                        {candidato.status === 'contratado' ? 'Contratado' : 'Processo finalizado'}
                      </div>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                    >
                      <Link href={`/admin/candidatos/${candidato.id}`}>
                        Ver Detalhes
                      </Link>
                    </Button>
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