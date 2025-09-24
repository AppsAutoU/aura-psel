'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { PortalLayout } from '@/components/layout/portal-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { 
  Search,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Calendar,
  User,
  Mail,
  Hash,
  FileText,
  Briefcase
} from 'lucide-react'
import Link from 'next/link'

interface Candidatura {
  id: string
  vaga_titulo: string
  status: string
  fase_atual: string
  data_inscricao: string
  nome_completo: string
  email: string
  score_ia?: number
}

export default function ConsultaPage() {
  const [searchMethod, setSearchMethod] = useState<'token' | 'email'>('token')
  const [token, setToken] = useState('')
  const [email, setEmail] = useState('')
  const [candidatura, setCandidatura] = useState<Candidatura | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searched, setSearched] = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setCandidatura(null)
    setSearched(true)

    try {
      const supabase = createClient()
      
      let query = supabase
        .from('aura_jobs_candidatos')
        .select(`
          id,
          nome_completo,
          email,
          status,
          fase_atual,
          data_inscricao,
          score_ia,
          aura_jobs_vagas!inner(titulo)
        `)

      if (searchMethod === 'token') {
        query = query.eq('consulta_token', token)
      } else {
        query = query.eq('email', email)
      }

      const { data, error: queryError } = await query

      if (queryError) {
        console.error('Erro na consulta:', queryError)
        setError('Erro ao buscar candidatura. Tente novamente.')
        setLoading(false)
        return
      }

      if (!data || data.length === 0) {
        if (searchMethod === 'token') {
          setError('Nenhuma candidatura encontrada com este código.')
        } else {
          setError('Nenhuma candidatura encontrada com este email.')
        }
        setLoading(false)
        return
      }

      // Se buscar por email, pode retornar múltiplas candidaturas
      // Por enquanto, vamos mostrar a mais recente
      const candidaturaData = searchMethod === 'token' ? data[0] : data.sort((a, b) => 
        new Date(b.data_inscricao).getTime() - new Date(a.data_inscricao).getTime()
      )[0]

      setCandidatura({
        id: candidaturaData.id,
        vaga_titulo: (candidaturaData.aura_jobs_vagas as any).titulo,
        status: candidaturaData.status,
        fase_atual: candidaturaData.fase_atual,
        data_inscricao: candidaturaData.data_inscricao,
        nome_completo: candidaturaData.nome_completo,
        email: candidaturaData.email,
        score_ia: candidaturaData.score_ia
      })
    } catch (err) {
      console.error('Erro ao buscar candidatura:', err)
      setError('Erro ao buscar candidatura. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: any, text: string, icon: any }> = {
      'inscrito': { variant: 'info', text: 'Inscrito', icon: CheckCircle },
      'em_avaliacao_ia': { variant: 'warning', text: 'Em Avaliação', icon: Clock },
      'reprovado_ia': { variant: 'error', text: 'Não Aprovado', icon: XCircle },
      'case_enviado': { variant: 'info', text: 'Case Enviado', icon: FileText },
      'em_avaliacao_case': { variant: 'warning', text: 'Case em Análise', icon: Clock },
      'aprovado_case': { variant: 'success', text: 'Case Aprovado', icon: CheckCircle },
      'reprovado_case': { variant: 'error', text: 'Case Reprovado', icon: XCircle },
      'entrevista_tecnica': { variant: 'cosmic', text: 'Entrevista Técnica', icon: Briefcase },
      'entrevista_socios': { variant: 'cosmic', text: 'Entrevista Sócios', icon: Briefcase },
      'aprovado': { variant: 'success', text: 'Aprovado', icon: CheckCircle },
      'reprovado': { variant: 'error', text: 'Não Aprovado', icon: XCircle },
      'contratado': { variant: 'success', text: 'Contratado', icon: CheckCircle }
    }
    const info = statusMap[status] || { variant: 'default', text: status, icon: AlertCircle }
    const Icon = info.icon
    
    return (
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4" />
        <Badge variant={info.variant}>{info.text}</Badge>
      </div>
    )
  }

  const getStatusMessage = (status: string) => {
    const messages: Record<string, string> = {
      'inscrito': 'Sua candidatura foi recebida com sucesso e está aguardando análise.',
      'em_avaliacao_ia': 'Seu perfil está sendo analisado pela nossa inteligência artificial.',
      'reprovado_ia': 'Infelizmente seu perfil não atende aos requisitos da vaga no momento.',
      'case_enviado': 'O case prático foi enviado para você. Verifique seu email.',
      'em_avaliacao_case': 'Seu case está sendo avaliado pela equipe técnica.',
      'aprovado_case': 'Parabéns! Seu case foi aprovado. Aguarde as próximas etapas.',
      'reprovado_case': 'Infelizmente seu case não atendeu aos critérios esperados.',
      'entrevista_tecnica': 'Você foi selecionado para a entrevista técnica. Em breve entraremos em contato.',
      'entrevista_socios': 'Você avançou para a entrevista com os sócios. Parabéns!',
      'aprovado': 'Parabéns! Você foi aprovado no processo seletivo.',
      'reprovado': 'O processo seletivo foi finalizado. Agradecemos sua participação.',
      'contratado': 'Bem-vindo ao time! Sua contratação foi efetivada.'
    }
    return messages[status] || 'Status em atualização.'
  }

  return (
    <PortalLayout user={null} onLogout={() => {}}>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <h1 className="text-display">Consulta de Candidatura</h1>
          <p className="text-body-large text-neutral-600">
            Acompanhe o status da sua candidatura usando seu código ou email
          </p>
        </div>

        {/* Search Form */}
        <Card variant="clean">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Buscar Candidatura
            </CardTitle>
            <CardDescription>
              Escolha como deseja consultar sua candidatura
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="space-y-4">
              {/* Search Method Selector */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSearchMethod('token')}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    searchMethod === 'token'
                      ? 'border-violet-500 bg-violet-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Hash className="h-5 w-5 mx-auto mb-1 text-violet-600" />
                  <span className="text-sm font-medium">Por Código</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSearchMethod('email')}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    searchMethod === 'email'
                      ? 'border-violet-500 bg-violet-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Mail className="h-5 w-5 mx-auto mb-1 text-violet-600" />
                  <span className="text-sm font-medium">Por Email</span>
                </button>
              </div>

              {/* Input Field */}
              {searchMethod === 'token' ? (
                <div className="space-y-2">
                  <Label htmlFor="token">Código de Consulta</Label>
                  <Input
                    id="token"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="Ex: abc12345-def67890"
                    required
                  />
                  <p className="text-xs text-neutral-500">
                    Digite o código que você recebeu ao se candidatar
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    required
                  />
                  <p className="text-xs text-neutral-500">
                    Digite o email usado na candidatura
                  </p>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
                  <AlertCircle className="h-5 w-5" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Buscando...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Buscar Candidatura
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Result */}
        {candidatura && (
          <Card variant="cosmic">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">{candidatura.vaga_titulo}</CardTitle>
                  <CardDescription className="mt-2">
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        {candidatura.nome_completo}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(candidatura.data_inscricao).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                  </CardDescription>
                </div>
                {getStatusBadge(candidatura.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Status Message */}
              <div className="p-4 bg-violet-50 rounded-lg">
                <p className="text-sm font-medium text-violet-900 mb-1">Status Atual</p>
                <p className="text-body text-violet-700">
                  {getStatusMessage(candidatura.status)}
                </p>
              </div>

              {/* Score IA (se disponível) */}
              {candidatura.score_ia && (
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Score IA</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-violet-500 to-violet-600"
                        style={{ width: `${candidatura.score_ia * 10}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{candidatura.score_ia}/10</span>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button variant="outline" asChild className="flex-1">
                  <Link href="/candidato/auth/signup">
                    Criar Conta
                  </Link>
                </Button>
                <Button variant="primary" asChild className="flex-1">
                  <Link href="/candidato/auth/login">
                    Fazer Login
                  </Link>
                </Button>
              </div>

              <p className="text-xs text-center text-neutral-500">
                Crie uma conta para acompanhar todas suas candidaturas em um só lugar
              </p>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {searched && !candidatura && !error && !loading && (
          <Card variant="clean">
            <CardContent className="text-center p-8">
              <AlertCircle className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
              <h3 className="text-heading-3 mb-2">Nenhuma candidatura encontrada</h3>
              <p className="text-body text-neutral-600">
                Verifique se digitou corretamente o código ou email
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </PortalLayout>
  )
}