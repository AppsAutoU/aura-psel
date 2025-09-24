'use client'

import * as React from "react"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Search,
  FileText,
  Eye,
  ArrowRight
} from "lucide-react"
import Link from "next/link"

interface DashboardProps {
  user: {
    name: string
    email: string
  }
}

interface Candidatura {
  id: string
  vaga_id: string
  vaga_titulo: string
  status: string
  data_inscricao: string
  vaga_key: string
}

export function CandidatoDashboard({ user }: DashboardProps) {
  const [candidaturas, setCandidaturas] = useState<Candidatura[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCandidaturas()
  }, [])

  const loadCandidaturas = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('aura_jobs_candidatos')
      .select(`
        id,
        vaga_id,
        status,
        data_inscricao,
        aura_jobs_vagas!inner(titulo, vaga_key)
      `)
      .eq('email', user.email)
      .order('data_inscricao', { ascending: false })
      .limit(5)

    if (data) {
      const candidaturasFormatadas = data.map(item => ({
        id: item.id,
        vaga_id: item.vaga_id,
        vaga_titulo: (item.aura_jobs_vagas as any).titulo,
        vaga_key: (item.aura_jobs_vagas as any).vaga_key,
        status: item.status,
        data_inscricao: item.data_inscricao
      }))
      setCandidaturas(candidaturasFormatadas)
    }
    setLoading(false)
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: any, text: string }> = {
      'inscrito': { variant: 'info', text: 'Inscrito' },
      'em_avaliacao_ia': { variant: 'warning', text: 'Em Avaliação' },
      'case_enviado': { variant: 'info', text: 'Case Enviado' },
      'em_avaliacao_case': { variant: 'warning', text: 'Case em Análise' },
      'entrevista_tecnica': { variant: 'cosmic', text: 'Entrevista Técnica' },
      'entrevista_socios': { variant: 'cosmic', text: 'Entrevista Sócios' },
      'aprovado': { variant: 'success', text: 'Aprovado' },
      'reprovado': { variant: 'error', text: 'Não Aprovado' },
      'contratado': { variant: 'success', text: 'Contratado' }
    }
    const statusInfo = statusMap[status] || { variant: 'default', text: status }
    return <Badge variant={statusInfo.variant}>{statusInfo.text}</Badge>
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="space-y-2">
        <h1 className="text-display">
          Olá, <span className="text-gradient-cosmic">{user.name.split(' ')[0]}</span>! 👋
        </h1>
        <p className="text-body-large text-neutral-600">
          Encontre oportunidades incríveis e acompanhe suas candidaturas.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card variant="cosmic" className="hover-cosmic">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <h3 className="text-heading-3">Explorar Vagas</h3>
                <p className="text-body-small text-neutral-600">
                  Descubra novas oportunidades
                </p>
              </div>
              <Search className="h-8 w-8 text-violet-600" />
            </div>
            <div className="mt-4">
              <Button variant="primary" className="w-full" asChild>
                <Link href="/candidato/vagas">
                  Ver Vagas Disponíveis
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card variant="clean" className="hover-cosmic">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <h3 className="text-heading-3">Minhas Candidaturas</h3>
                <p className="text-body-small text-neutral-600">
                  {candidaturas.length} {candidaturas.length === 1 ? 'processo ativo' : 'processos ativos'}
                </p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
            <div className="mt-4">
              <Button variant="outline" className="w-full" asChild>
                <Link href="/candidato/candidaturas">
                  Ver Candidaturas
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Applications */}
      {candidaturas.length > 0 && (
        <Card variant="premium">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Candidaturas Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-2 border-violet-200 border-t-violet-600 rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {candidaturas.map((candidatura) => (
                  <div
                    key={candidatura.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-neutral-200 hover:bg-neutral-50 transition-colors"
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-3">
                        <h4 className="text-body font-semibold">{candidatura.vaga_titulo}</h4>
                        {getStatusBadge(candidatura.status)}
                      </div>
                      <p className="text-xs text-neutral-500">
                        Inscrito em {new Date(candidatura.data_inscricao).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/candidato/status?id=${candidatura.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
                {candidaturas.length >= 5 && (
                  <div className="mt-4 text-center">
                    <Button variant="outline" asChild>
                      <Link href="/candidato/candidaturas">
                        Ver Todas as Candidaturas
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}