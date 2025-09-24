'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useCandidatoAuth } from '@/hooks/useCandidatoAuth'
import { Candidato } from '@/types/database.types'
import Link from 'next/link'
import { PortalLayout } from '@/components/layout/portal-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckCircle, Clock, FileText, Calendar, AlertCircle, Award } from 'lucide-react'

function StatusPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const candidatoId = searchParams.get('id')
  const { user, loading: authLoading, logout } = useCandidatoAuth()
  
  const [candidato, setCandidato] = useState<Candidato | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/candidato/auth/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (candidatoId) {
      loadCandidato()
    }
  }, [candidatoId])

  const loadCandidato = async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('aura_jobs_candidatos')
      .select('*, aura_jobs_vagas!inner(titulo)')
      .eq('id', candidatoId)
      .single()

    if (error || !data) {
      setError('Candidato não encontrado')
      setLoading(false)
      return
    }

    setCandidato(data)
    setLoading(false)
  }

  const getStatusVariant = (status: string) => {
    const variants: Record<string, any> = {
      inscrito: 'info',
      em_avaliacao_ia: 'warning',
      reprovado_ia: 'error',
      case_enviado: 'info',
      em_avaliacao_case: 'warning',
      aprovado_case: 'success',
      reprovado_case: 'error',
      entrevista_tecnica: 'cosmic',
      entrevista_socios: 'cosmic',
      aprovado: 'success',
      reprovado: 'error',
      contratado: 'success',
    }
    return variants[status] || 'default'
  }

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      inscrito: 'Inscrição Recebida',
      em_avaliacao_ia: 'Em Avaliação (IA)',
      reprovado_ia: 'Não Aprovado - Avaliação Inicial',
      case_enviado: 'Case Enviado',
      em_avaliacao_case: 'Case em Avaliação',
      aprovado_case: 'Case Aprovado',
      reprovado_case: 'Não Aprovado - Case',
      entrevista_tecnica: 'Agendado - Entrevista Técnica',
      entrevista_socios: 'Agendado - Entrevista com Sócios',
      aprovado: 'Aprovado',
      reprovado: 'Não Aprovado',
      contratado: 'Contratado',
    }
    return texts[status] || status
  }

  const userData = user ? {
    name: user.nome,
    email: user.email
  } : null

  if (authLoading || loading || !userData) {
    return (
      <PortalLayout user={userData} onLogout={logout}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <div className="w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin mx-auto"></div>
            <h1 className="text-heading-2">Carregando...</h1>
            <p className="text-body-small text-neutral-600">Verificando status da sua candidatura</p>
          </div>
        </div>
      </PortalLayout>
    )
  }

  if (error || !candidato) {
    return (
      <PortalLayout user={userData} onLogout={logout}>
        <Card variant="clean" className="max-w-2xl mx-auto">
          <CardContent className="text-center p-8">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-heading-2 mb-4">Erro</h1>
            <p className="text-body text-red-600 mb-6">{error}</p>
            <Button variant="primary" asChild>
              <Link href="/">Voltar ao início</Link>
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
        <div className="space-y-2">
          <h1 className="text-display">Status da Candidatura</h1>
          <p className="text-body-large text-neutral-600">
            Acompanhe aqui o andamento da sua candidatura.
          </p>
        </div>

        {/* Status Card */}
        <Card variant="cosmic">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Status Atual
            </CardTitle>
            <CardDescription>
              Informações sobre sua candidatura e próximas etapas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <span className="text-body-small text-neutral-600">Status:</span>
                <div>
                  <Badge variant={getStatusVariant(candidato.status)} className="text-sm">
                    {getStatusText(candidato.status)}
                  </Badge>
                </div>
              </div>
              
              {candidato.score_ia && (
                <div className="space-y-2">
                  <span className="text-body-small text-neutral-600">Score IA:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-heading-3">{candidato.score_ia}/10</span>
                    <Award className="h-4 w-4 text-yellow-500" />
                  </div>
                </div>
              )}
              
              <div className="space-y-2">
                <span className="text-body-small text-neutral-600">Data de Inscrição:</span>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-neutral-400" />
                  <span className="text-body">
                    {new Date(candidato.data_inscricao).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Case Prático - Se aprovado pela IA */}
        {candidato.status === 'case_enviado' && candidato.prazo_case && !candidato.case_enviado && (
          <Card variant="premium">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-700">
                <FileText className="h-5 w-5" />
                Case Prático
              </CardTitle>
              <CardDescription>
                Parabéns! Você foi aprovado para a próxima fase.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-body-small text-blue-800 mb-2">Prazo para envio:</p>
                  <p className="text-heading-3 text-blue-900">
                    {new Date(candidato.prazo_case).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <Button variant="primary" asChild className="w-full">
                  <Link href={`/candidato/case?id=${candidato.id}`}>
                    <FileText className="h-4 w-4 mr-2" />
                    Enviar Case
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Mensagem de Reprovação */}
        {(candidato.status === 'reprovado_ia' || candidato.status === 'reprovado_case' || candidato.status === 'reprovado') && (
          <Card variant="clean">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-700">
                <AlertCircle className="h-5 w-5" />
                Processo Finalizado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <p className="text-body text-red-800">
                  Agradecemos seu interesse na AutoU. Infelizmente, neste momento, seu perfil não atende aos requisitos da vaga. 
                  Manteremos seu currículo em nosso banco de dados para futuras oportunidades.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Mensagem de Aprovação */}
        {candidato.status === 'aprovado' && (
          <Card variant="cosmic">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700">
                <CheckCircle className="h-5 w-5" />
                Parabéns!
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-body text-green-800">
                  Você foi aprovado no processo seletivo! Em breve entraremos em contato para os próximos passos.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Timeline do Processo */}
        <Card variant="premium">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Etapas do Processo
            </CardTitle>
            <CardDescription>
              Acompanhe o progresso da sua candidatura através das etapas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <ProcessStep
                title="Inscrição"
                completed={true}
                active={candidato.fase_atual === 'inscricao'}
              />
              <ProcessStep
                title="Avaliação Inicial (IA)"
                completed={['case_pratico', 'avaliacao_case', 'entrevista_tecnica', 'entrevista_socios', 'contratacao'].includes(candidato.fase_atual) || candidato.status.includes('reprovado')}
                active={candidato.fase_atual === 'avaliacao_ia'}
              />
              <ProcessStep
                title="Case Prático"
                completed={['avaliacao_case', 'entrevista_tecnica', 'entrevista_socios', 'contratacao'].includes(candidato.fase_atual)}
                active={candidato.fase_atual === 'case_pratico'}
              />
              <ProcessStep
                title="Avaliação do Case"
                completed={['entrevista_tecnica', 'entrevista_socios', 'contratacao'].includes(candidato.fase_atual)}
                active={candidato.fase_atual === 'avaliacao_case'}
              />
              <ProcessStep
                title="Entrevista Técnica"
                completed={['entrevista_socios', 'contratacao'].includes(candidato.fase_atual)}
                active={candidato.fase_atual === 'entrevista_tecnica'}
              />
              <ProcessStep
                title="Entrevista com Sócios"
                completed={candidato.fase_atual === 'contratacao'}
                active={candidato.fase_atual === 'entrevista_socios'}
              />
              <ProcessStep
                title="Contratação"
                completed={candidato.status === 'contratado'}
                active={candidato.fase_atual === 'contratacao'}
              />
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-center gap-4">
          <Button variant="outline" asChild>
            <Link href="/candidato">
              Voltar ao Dashboard
            </Link>
          </Button>
          <Button variant="primary" asChild>
            <Link href="/candidato/candidaturas">
              Ver Todas as Candidaturas
            </Link>
          </Button>
        </div>
      </div>
    </PortalLayout>
  )
}

export default function StatusPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Carregando...</h1>
        </div>
      </div>
    }>
      <StatusPageContent />
    </Suspense>
  )
}

function ProcessStep({ title, completed, active }: { title: string; completed: boolean; active: boolean }) {
  return (
    <div className="flex items-center gap-4 p-3 rounded-lg transition-all duration-300 hover:bg-neutral-50">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
        completed 
          ? 'bg-green-500 text-white shadow-md' 
          : active 
          ? 'bg-gradient-cosmic text-white shadow-lg' 
          : 'bg-neutral-200 text-neutral-500'
      }`}>
        {completed ? (
          <CheckCircle className="h-5 w-5" />
        ) : active ? (
          <Clock className="h-5 w-5" />
        ) : (
          <div className="w-2 h-2 bg-current rounded-full" />
        )}
      </div>
      <span className={`text-body ${
        active 
          ? 'font-semibold text-neutral-900' 
          : completed 
          ? 'text-neutral-700' 
          : 'text-neutral-500'
      }`}>
        {title}
      </span>
      {active && (
        <Badge variant="cosmic" className="ml-auto text-xs">
          Atual
        </Badge>
      )}
    </div>
  )
}