'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useCandidatoAuth } from '@/hooks/useCandidatoAuth'

interface Inscricao {
  id: string
  vaga_id: string
  status: string
  created_at: string
  vaga: {
    titulo: string
    departamento: string
    modelo_trabalho: string
  }
}

export default function CandidatoDashboard() {
  const router = useRouter()
  const { user, loading: authLoading, logout } = useCandidatoAuth('/candidato/auth/login')
  const [inscricoes, setInscricoes] = useState<Inscricao[]>([])
  const [vagasAbertas, setVagasAbertas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && user) {
      loadData()
    }
  }, [authLoading, user])

  const loadData = async () => {
    try {
      const supabase = createClient()

      // Buscar inscrições do candidato
      const { data: inscricoesData } = await supabase
        .from('aura_jobs_candidatos')
        .select(`
          id,
          vaga_id,
          status,
          created_at,
          vaga:aura_jobs_vagas (
            titulo,
            departamento,
            modelo_trabalho
          )
        `)
        .eq('email', user?.email)
        .order('created_at', { ascending: false })

      if (inscricoesData) {
        setInscricoes(inscricoesData as any)
      }

      // Buscar vagas abertas
      const { data: vagasData } = await supabase
        .from('aura_jobs_vagas')
        .select('*')
        .eq('ativa', true)
        .order('created_at', { ascending: false })
        .limit(5)

      if (vagasData) {
        setVagasAbertas(vagasData)
      }

    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'inscrito': 'bg-blue-100 text-blue-800',
      'em_analise': 'bg-yellow-100 text-yellow-800',
      'aprovado': 'bg-green-100 text-green-800',
      'reprovado': 'bg-red-100 text-red-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'inscrito': 'Inscrito',
      'em_analise': 'Em Análise',
      'aprovado': 'Aprovado',
      'reprovado': 'Reprovado'
    }
    return labels[status] || status
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-900">
                Portal do Candidato
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Olá, {user?.nome.split(' ')[0]}!
              </span>
              <button
                onClick={logout}
                className="text-sm text-red-600 hover:text-red-700 font-medium"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Minhas Inscrições */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Minhas Inscrições
              </h2>

              {inscricoes.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">
                    Você ainda não se inscreveu em nenhuma vaga
                  </p>
                  <Link
                    href="/candidato/vagas"
                    className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Ver Vagas Disponíveis
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {inscricoes.map((inscricao) => (
                    <div
                      key={inscricao.id}
                      className="border rounded-lg p-4 hover:shadow-sm transition-shadow"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {inscricao.vaga?.titulo}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">
                            {inscricao.vaga?.departamento} • {inscricao.vaga?.modelo_trabalho}
                          </p>
                          <p className="text-xs text-gray-400 mt-2">
                            Inscrito em: {new Date(inscricao.created_at).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(inscricao.status)}`}>
                          {getStatusLabel(inscricao.status)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Perfil Rápido */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Meu Perfil
              </h3>
              <div className="space-y-2 text-sm">
                <p className="text-gray-600">
                  <span className="font-medium">Nome:</span> {user?.nome}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Email:</span> {user?.email}
                </p>
              </div>
              <Link
                href="/candidato/perfil"
                className="mt-4 block text-center px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
              >
                Editar Perfil
              </Link>
            </div>

            {/* Vagas Recomendadas */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Vagas Abertas
              </h3>
              {vagasAbertas.length === 0 ? (
                <p className="text-sm text-gray-500">
                  Nenhuma vaga disponível no momento
                </p>
              ) : (
                <div className="space-y-3">
                  {vagasAbertas.map((vaga) => (
                    <div key={vaga.id} className="border-b pb-3 last:border-0">
                      <Link
                        href={`/candidato/inscricao/${vaga.vaga_key}`}
                        className="group"
                      >
                        <h4 className="text-sm font-medium text-gray-900 group-hover:text-blue-600">
                          {vaga.titulo}
                        </h4>
                        <p className="text-xs text-gray-500 mt-1">
                          {vaga.departamento} • {vaga.modelo_trabalho}
                        </p>
                      </Link>
                    </div>
                  ))}
                  <Link
                    href="/candidato/vagas"
                    className="block text-center text-sm text-blue-600 hover:text-blue-700 mt-3"
                  >
                    Ver todas as vagas →
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}