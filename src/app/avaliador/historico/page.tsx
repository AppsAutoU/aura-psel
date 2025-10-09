'use client'

import { useAvaliadorAuth } from '@/hooks/useAvaliadorAuth'
import { AvaliadorLayout } from '@/components/avaliador/AvaliadorLayout'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface Candidato {
  id: string
  nome_completo: string
  email: string
  status: string
  fase_atual: string
  score_ia: number | null
  created_at: string
  updated_at: string
  vaga?: {
    titulo: string
  }
}

type FilterType = 'todos' | 'aprovados' | 'reprovados'

export default function HistoricoPage() {
  const router = useRouter()
  const { user, loading } = useAvaliadorAuth()
  const [candidatos, setCandidatos] = useState<Candidato[]>([])
  const [loadingCandidatos, setLoadingCandidatos] = useState(true)
  const [filter, setFilter] = useState<FilterType>('todos')

  useEffect(() => {
    if (!loading && !user) {
      router.push('/avaliador/auth/login')
    }
  }, [loading, user, router])

  useEffect(() => {
    const fetchCandidatos = async () => {
      try {
        const supabase = createClient()

        // Buscar todos os candidatos que já foram avaliados (não estão em fase inicial)
        const { data, error } = await supabase
          .from('aura_jobs_candidatos')
          .select(`
            id,
            nome_completo,
            email,
            status,
            fase_atual,
            score_ia,
            created_at,
            updated_at,
            vaga:aura_jobs_vagas (
              titulo
            )
          `)
          .not('status', 'in', '("inscrito","em_avaliacao_ia")')
          .order('updated_at', { ascending: false })

        if (error) {
          console.error('Erro ao buscar candidatos:', error)
          return
        }

        setCandidatos(data || [])
      } catch (error) {
        console.error('Erro ao carregar candidatos:', error)
      } finally {
        setLoadingCandidatos(false)
      }
    }

    if (user) {
      fetchCandidatos()
    }
  }, [user])

  const getStatusInfo = (status: string) => {
    const statusMap: Record<string, { label: string; color: string; fase: string }> = {
      'aprovado_ia': { label: 'Aprovado', color: 'bg-green-100 text-green-800 border-green-200', fase: 'Score de Compatibilidade' },
      'reprovado_ia': { label: 'Reprovado', color: 'bg-red-100 text-red-800 border-red-200', fase: 'Score de Compatibilidade' },
      'case_enviado': { label: 'Aguardando Resposta do Case pelo Candidato', color: 'bg-blue-100 text-blue-800 border-blue-200', fase: 'Case Prático' },
      'em_avaliacao_case': { label: 'Em Avaliação', color: 'bg-blue-100 text-blue-800 border-blue-200', fase: 'Case Prático' },
      'aprovado_case': { label: 'Aprovado', color: 'bg-green-100 text-green-800 border-green-200', fase: 'Case Prático' },
      'reprovado_case': { label: 'Reprovado', color: 'bg-red-100 text-red-800 border-red-200', fase: 'Case Prático' },
      'entrevista_tecnica': { label: 'Em Entrevista Técnica', color: 'bg-purple-100 text-purple-800 border-purple-200', fase: 'Entrevista Técnica' },
      'entrevista_socios': { label: 'Marcar Entrevista Com Sócio', color: 'bg-indigo-100 text-indigo-800 border-indigo-200', fase: 'Entrevista com Sócios' },
      'reprovado': { label: 'Reprovado na Entrevista Técnica', color: 'bg-red-100 text-red-800 border-red-200', fase: 'Entrevista Técnica' },
      'reprovado_socios': { label: 'Reprovado Pelos Sócios', color: 'bg-red-100 text-red-800 border-red-200', fase: 'Entrevista com Sócios' },
      'contratado': { label: 'Contratado', color: 'bg-emerald-100 text-emerald-800 border-emerald-200', fase: 'Contratação' }
    }

    return statusMap[status] || { label: status, color: 'bg-gray-100 text-gray-800 border-gray-200', fase: 'Desconhecida' }
  }

  const filteredCandidatos = candidatos.filter(candidato => {
    if (filter === 'todos') return true

    const isAprovado = candidato.status.includes('aprovado')
    const isReprovado = candidato.status.includes('reprovado')

    if (filter === 'aprovados') return isAprovado
    if (filter === 'reprovados') return isReprovado

    return true
  })

  if (loading || loadingCandidatos) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Carregando...</h1>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <AvaliadorLayout>
      <div className="p-6">
        <div className="mb-8">
          <h2 className="text-heading-1 text-gradient-cosmic mb-2">Histórico de Candidatos</h2>
          <p className="text-body text-neutral-600">Acompanhe todos os candidatos que já foram avaliados no processo seletivo</p>
        </div>

        {/* Filter Buttons */}
        <div className="mb-6 flex gap-3">
          <Button
            onClick={() => setFilter('todos')}
            variant={filter === 'todos' ? 'default' : 'outline'}
            className={filter === 'todos' ? 'bg-gradient-cosmic hover-cosmic' : ''}
          >
            Todos ({candidatos.length})
          </Button>
          <Button
            onClick={() => setFilter('aprovados')}
            variant={filter === 'aprovados' ? 'success' : 'outline'}
          >
            Aprovados ({candidatos.filter(c => c.status.includes('aprovado')).length})
          </Button>
          <Button
            onClick={() => setFilter('reprovados')}
            variant={filter === 'reprovados' ? 'destructive' : 'outline'}
          >
            Reprovados ({candidatos.filter(c => c.status.includes('reprovado')).length})
          </Button>
        </div>

        {/* Candidates Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {filteredCandidatos.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-600">Nenhum candidato encontrado.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Candidato
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vaga
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Score IA
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fase
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Última Atualização
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCandidatos.map((candidato) => {
                    const statusInfo = getStatusInfo(candidato.status)
                    return (
                      <tr key={candidato.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-gray-900">{candidato.nome_completo}</p>
                            <p className="text-sm text-gray-500">{candidato.email}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-900">
                            {candidato.vaga && 'titulo' in candidato.vaga
                              ? candidato.vaga.titulo
                              : 'Vaga não especificada'}
                          </p>
                        </td>
                        <td className="px-6 py-4 text-center">
                          {candidato.score_ia !== null ? (
                            <Badge variant={
                              candidato.score_ia >= 7 ? 'success' :
                              candidato.score_ia >= 5 ? 'secondary' :
                              'destructive'
                            }>
                              {candidato.score_ia}/10
                            </Badge>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-medium text-gray-900">{statusInfo.fase}</p>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <Badge variant={
                            candidato.status === 'contratado' ? 'success' :
                            candidato.status.includes('reprovado') ? 'destructive' :
                            candidato.status.includes('aprovado') ? 'success' :
                            'default'
                          }>
                            {statusInfo.label}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-600">
                            {new Date(candidato.updated_at).toLocaleDateString('pt-BR', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AvaliadorLayout>
  )
}
