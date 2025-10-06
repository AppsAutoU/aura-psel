'use client'

import { useAvaliadorAuth } from '@/hooks/useAvaliadorAuth'
import { AvaliadorLayout } from '@/components/avaliador/AvaliadorLayout'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Candidato {
  id: string
  nome_completo: string
  email: string
  telefone?: string
  status: string
  fase_atual: string
  score_ia: number | null
  created_at: string
  updated_at: string
  vaga?: {
    titulo: string
  }
}

export default function EntrevistasPage() {
  const router = useRouter()
  const { user, loading } = useAvaliadorAuth()
  const [candidatos, setCandidatos] = useState<Candidato[]>([])
  const [loadingCandidatos, setLoadingCandidatos] = useState(true)
  const [selectedCandidato, setSelectedCandidato] = useState<Candidato | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [observacoes, setObservacoes] = useState('')
  const [dataEntrevista, setDataEntrevista] = useState('')
  const [responsavelEntrevista, setResponsavelEntrevista] = useState('')

  useEffect(() => {
    if (!loading && !user) {
      router.push('/avaliador/auth/login')
    }
  }, [loading, user, router])

  useEffect(() => {
    const fetchCandidatos = async () => {
      try {
        const supabase = createClient()

        const { data, error } = await supabase
          .from('aura_jobs_candidatos')
          .select(`
            id,
            nome_completo,
            email,
            telefone,
            status,
            fase_atual,
            score_ia,
            created_at,
            updated_at,
            vaga:aura_jobs_vagas (
              titulo
            )
          `)
          .eq('status', 'entrevista_tecnica')
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

  const handleAprovar = async () => {
    if (!selectedCandidato) return

    try {
      const supabase = createClient()

      const { error } = await supabase
        .from('aura_jobs_candidatos')
        .update({
          status: 'entrevista_socios',
          fase_atual: 'entrevista_socios'
        })
        .eq('id', selectedCandidato.id)

      if (error) {
        alert('Erro ao atualizar candidato: ' + error.message)
        return
      }

      // Enviar e-mail de aprovação da entrevista técnica
      try {
        await fetch('/api/emails/send-notification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: selectedCandidato.email,
            type: 'aprovacaoEntrevistaTecnica',
            data: {
              nome: selectedCandidato.nome_completo,
              vagaTitulo: selectedCandidato.vaga && typeof selectedCandidato.vaga === 'object' && 'titulo' in selectedCandidato.vaga
                ? selectedCandidato.vaga.titulo
                : 'a vaga'
            }
          })
        })
        console.log(`✅ E-mail de aprovação enviado para ${selectedCandidato.email}`)
      } catch (emailError) {
        console.error('❌ Erro ao enviar e-mail:', emailError)
        // Não bloqueia o fluxo se e-mail falhar
      }

      alert('Candidato aprovado na entrevista técnica! Agora aguarda entrevista com sócios.')
      setShowModal(false)
      setSelectedCandidato(null)
      setObservacoes('')
      setDataEntrevista('')
      setResponsavelEntrevista('')

      // Recarregar lista
      setCandidatos(prev => prev.filter(c => c.id !== selectedCandidato.id))
    } catch (error) {
      console.error('Erro ao aprovar candidato:', error)
      alert('Erro ao aprovar candidato')
    }
  }

  const handleReprovar = async () => {
    if (!selectedCandidato) return

    try {
      const supabase = createClient()

      const { error } = await supabase
        .from('aura_jobs_candidatos')
        .update({
          status: 'reprovado',
          fase_atual: 'entrevista_tecnica'
        })
        .eq('id', selectedCandidato.id)

      if (error) {
        alert('Erro ao atualizar candidato: ' + error.message)
        return
      }

      // Enviar e-mail de reprovação da entrevista técnica
      try {
        await fetch('/api/emails/send-notification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: selectedCandidato.email,
            type: 'reprovacaoEntrevistaTecnica',
            data: {
              nome: selectedCandidato.nome_completo,
              vagaTitulo: selectedCandidato.vaga && typeof selectedCandidato.vaga === 'object' && 'titulo' in selectedCandidato.vaga
                ? selectedCandidato.vaga.titulo
                : 'a vaga'
            }
          })
        })
        console.log(`✅ E-mail de reprovação enviado para ${selectedCandidato.email}`)
      } catch (emailError) {
        console.error('❌ Erro ao enviar e-mail:', emailError)
        // Não bloqueia o fluxo se e-mail falhar
      }

      alert('Candidato reprovado na entrevista técnica!')
      setShowModal(false)
      setSelectedCandidato(null)
      setObservacoes('')
      setDataEntrevista('')
      setResponsavelEntrevista('')

      // Recarregar lista
      setCandidatos(prev => prev.filter(c => c.id !== selectedCandidato.id))
    } catch (error) {
      console.error('Erro ao reprovar candidato:', error)
      alert('Erro ao reprovar candidato')
    }
  }

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
        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">Candidatos Na Entrevista Técnica</h2>
          <p className="text-gray-600">Candidatos aprovados no case prático aguardando entrevista técnica</p>
        </div>

        {candidatos.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600">Nenhum candidato aguardando entrevista técnica no momento.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {candidatos.map((candidato) => (
              <div
                key={candidato.id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-200"
              >
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{candidato.nome_completo}</h3>
                  <p className="text-sm text-gray-600">{candidato.email}</p>
                  {candidato.telefone && (
                    <p className="text-sm text-gray-600">{candidato.telefone}</p>
                  )}
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-700 mb-2">
                    <strong>Vaga:</strong>{' '}
                    {candidato.vaga && 'titulo' in candidato.vaga
                      ? candidato.vaga.titulo
                      : 'Não especificada'}
                  </p>
                  {candidato.score_ia && (
                    <p className="text-sm text-gray-700">
                      <strong>Score IA:</strong> {candidato.score_ia}/10
                    </p>
                  )}
                </div>

                <div className="mb-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
                    Aguardando Entrevista
                  </span>
                </div>

                <button
                  onClick={() => {
                    setSelectedCandidato(candidato)
                    setShowModal(true)
                  }}
                  className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-colors font-medium"
                >
                  Avaliar Entrevista
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Modal de Avaliação */}
        {showModal && selectedCandidato && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900">
                  Avaliação de Entrevista Técnica
                </h3>
                <p className="text-sm text-gray-600 mt-1">{selectedCandidato.nome_completo}</p>
              </div>

              <div className="p-6">
                <div className="mb-4">
                  <p className="text-sm text-gray-700 mb-1">
                    <strong>Email:</strong> {selectedCandidato.email}
                  </p>
                  {selectedCandidato.telefone && (
                    <p className="text-sm text-gray-700 mb-1">
                      <strong>Telefone:</strong> {selectedCandidato.telefone}
                    </p>
                  )}
                  <p className="text-sm text-gray-700 mb-1">
                    <strong>Vaga:</strong>{' '}
                    {selectedCandidato.vaga && 'titulo' in selectedCandidato.vaga
                      ? selectedCandidato.vaga.titulo
                      : 'Não especificada'}
                  </p>
                  {selectedCandidato.score_ia && (
                    <p className="text-sm text-gray-700">
                      <strong>Score IA:</strong> {selectedCandidato.score_ia}/10
                    </p>
                  )}
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data da Entrevista
                  </label>
                  <input
                    type="datetime-local"
                    value={dataEntrevista}
                    onChange={(e) => setDataEntrevista(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Responsável pela Entrevista
                  </label>
                  <input
                    type="text"
                    value={responsavelEntrevista}
                    onChange={(e) => setResponsavelEntrevista(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Nome do responsável..."
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Observações da Entrevista (opcional)
                  </label>
                  <textarea
                    value={observacoes}
                    onChange={(e) => setObservacoes(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    rows={4}
                    placeholder="Adicione observações sobre a entrevista técnica..."
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleAprovar}
                    className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    Aprovar na Entrevista Técnica
                  </button>
                  <button
                    onClick={handleReprovar}
                    className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                  >
                    Reprovar na Entrevista Técnica
                  </button>
                </div>

                <button
                  onClick={() => {
                    setShowModal(false)
                    setSelectedCandidato(null)
                    setObservacoes('')
                    setDataEntrevista('')
                    setResponsavelEntrevista('')
                  }}
                  className="w-full mt-3 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AvaliadorLayout>
  )
}
