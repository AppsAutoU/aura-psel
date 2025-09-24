'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useCandidatoAuth } from '@/hooks/useCandidatoAuth'
import { PortalLayout } from '@/components/layout/portal-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  FileText,
  Calendar,
  Eye,
  ArrowLeft,
  Search
} from 'lucide-react'
import Link from 'next/link'

interface Candidatura {
  id: string
  vaga_id: string
  vaga_titulo: string
  status: string
  data_inscricao: string
  vaga_key: string
  score_ia?: number
  fase_atual: string
}

export default function CandidaturasPage() {
  const router = useRouter()
  const { user, loading: authLoading, logout } = useCandidatoAuth()
  const [candidaturas, setCandidaturas] = useState<Candidatura[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/candidato/auth/login')
    }
  }, [user, authLoading, router])

  const userData = user ? {
    name: user.nome,
    email: user.email
  } : null

  useEffect(() => {
    if (user) {
      loadCandidaturas()
    }
  }, [user])

  const loadCandidaturas = async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('aura_jobs_candidatos')
      .select(`
        id,
        vaga_id,
        status,
        data_inscricao,
        score_ia,
        fase_atual,
        aura_jobs_vagas!inner(titulo, vaga_key)
      `)
      .eq('email', user?.email || '')
      .order('data_inscricao', { ascending: false })

    if (error) {
      setError('Erro ao carregar candidaturas')
      setLoading(false)
      return
    }

    if (data) {
      const candidaturasFormatadas = data.map(item => ({
        id: item.id,
        vaga_id: item.vaga_id,
        vaga_titulo: (item.aura_jobs_vagas as any).titulo,
        vaga_key: (item.aura_jobs_vagas as any).vaga_key,
        status: item.status,
        data_inscricao: item.data_inscricao,
        score_ia: item.score_ia,
        fase_atual: item.fase_atual
      }))
      setCandidaturas(candidaturasFormatadas)
    }
    setLoading(false)
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: any, text: string }> = {
      'inscrito': { variant: 'info', text: 'Inscrito' },
      'em_avaliacao_ia': { variant: 'warning', text: 'Em Avaliação' },
      'reprovado_ia': { variant: 'error', text: 'Não Aprovado' },
      'case_enviado': { variant: 'info', text: 'Case Enviado' },
      'em_avaliacao_case': { variant: 'warning', text: 'Case em Análise' },
      'aprovado_case': { variant: 'success', text: 'Case Aprovado' },
      'reprovado_case': { variant: 'error', text: 'Case Reprovado' },
      'entrevista_tecnica': { variant: 'cosmic', text: 'Entrevista Técnica' },
      'entrevista_socios': { variant: 'cosmic', text: 'Entrevista Sócios' },
      'aprovado': { variant: 'success', text: 'Aprovado' },
      'reprovado': { variant: 'error', text: 'Não Aprovado' },
      'contratado': { variant: 'success', text: 'Contratado' }
    }
    const statusInfo = statusMap[status] || { variant: 'default', text: status }
    return <Badge variant={statusInfo.variant}>{statusInfo.text}</Badge>
  }

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      'inscrito': 'Inscrição enviada com sucesso',
      'em_avaliacao_ia': 'Perfil sendo analisado pela nossa IA',
      'reprovado_ia': 'Perfil não atende aos requisitos da vaga',
      'case_enviado': 'Case prático disponível para resolução',
      'em_avaliacao_case': 'Case sendo avaliado pela equipe técnica',
      'aprovado_case': 'Case aprovado! Aguarde próximas etapas',
      'reprovado_case': 'Case não atendeu aos critérios',
      'entrevista_tecnica': 'Entrevista técnica agendada',
      'entrevista_socios': 'Entrevista com sócios agendada',
      'aprovado': 'Parabéns! Você foi aprovado',
      'reprovado': 'Processo finalizado',
      'contratado': 'Bem-vindo ao time!'
    }
    return texts[status] || 'Status em atualização'
  }

  if (authLoading || loading || !userData) {
    return (
      <PortalLayout user={userData} onLogout={logout}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <div className="w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin mx-auto"></div>
            <h1 className="text-heading-2">Carregando candidaturas...</h1>
            <p className="text-body-small text-neutral-600">Buscando seus processos seletivos</p>
          </div>
        </div>
      </PortalLayout>
    )
  }

  if (error) {
    return (
      <PortalLayout user={userData} onLogout={logout}>
        <Card variant="clean" className="max-w-2xl mx-auto">
          <CardContent className="text-center p-8">
            <h1 className="text-heading-2 mb-4">Erro ao carregar candidaturas</h1>
            <p className="text-body text-red-600 mb-6">{error}</p>
            <Button variant="primary" onClick={loadCandidaturas}>
              Tentar novamente
            </Button>
          </CardContent>
        </Card>
      </PortalLayout>
    )
  }

  return (
    <PortalLayout user={userData} onLogout={logout}>
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/candidato">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar ao Dashboard
              </Link>
            </Button>
          </div>
          
          <div>
            <h1 className="text-display">Minhas Candidaturas</h1>
            <p className="text-body-large text-neutral-600">
              Acompanhe o status de todas as suas candidaturas em um só lugar.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card variant="clean">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-body-small text-neutral-600">Total de Candidaturas</p>
                  <p className="text-heading-2">{candidaturas.length}</p>
                </div>
                <FileText className="h-8 w-8 text-violet-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card variant="clean">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-body-small text-neutral-600">Em Andamento</p>
                  <p className="text-heading-2">
                    {candidaturas.filter(c => !['aprovado', 'reprovado', 'reprovado_ia', 'reprovado_case', 'contratado'].includes(c.status)).length}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card variant="clean">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-body-small text-neutral-600">Aprovações</p>
                  <p className="text-heading-2">
                    {candidaturas.filter(c => ['aprovado', 'contratado'].includes(c.status)).length}
                  </p>
                </div>
                <Search className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Candidaturas List */}
        {candidaturas.length === 0 ? (
          <Card variant="clean">
            <CardContent className="text-center p-12">
              <FileText className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
              <h3 className="text-heading-3 mb-2">Nenhuma candidatura encontrada</h3>
              <p className="text-body text-neutral-600 mb-6">
                Você ainda não se candidatou a nenhuma vaga. Que tal explorar as oportunidades disponíveis?
              </p>
              <Button variant="primary" asChild>
                <Link href="/candidato/vagas">
                  Explorar Vagas
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {candidaturas.map((candidatura) => (
              <Card key={candidatura.id} variant="premium" className="hover-cosmic">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-heading-3">{candidatura.vaga_titulo}</h3>
                        {getStatusBadge(candidatura.status)}
                      </div>
                      
                      <p className="text-body-small text-neutral-600">
                        {getStatusText(candidatura.status)}
                      </p>
                      
                      <div className="flex items-center gap-4 text-xs text-neutral-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Inscrito em {new Date(candidatura.data_inscricao).toLocaleDateString('pt-BR')}
                        </div>
                        {candidatura.score_ia && (
                          <div>
                            Score IA: {candidatura.score_ia}/10
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/candidato/vagas/${candidatura.vaga_key}`}>
                          Ver Vaga
                        </Link>
                      </Button>
                      <Button variant="primary" size="sm" asChild>
                        <Link href={`/candidato/status?id=${candidatura.id}`}>
                          <Eye className="h-4 w-4 mr-2" />
                          Ver Status
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PortalLayout>
  )
}