'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AvaliadorLayout } from '@/components/avaliador/AvaliadorLayout'

interface Candidato {
  id: string
  nome_completo: string
  email: string
  vaga_titulo: string
  status: string
  url_entregavel_1?: string
  url_entregavel_2?: string
  url_video?: string
  comentarios_adicionais?: string
  data_envio_case?: string
  created_at: string
}

export default function CasesPraticosSimple() {
  const [candidatos, setCandidatos] = useState<Candidato[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCandidato, setSelectedCandidato] = useState<Candidato | null>(null)
  const [avaliacao, setAvaliacao] = useState({
    nota_case: '',
    comentarios_case: '',
    comentario_geral: '',
  })

  useEffect(() => {
    loadCandidatos()
  }, [])

  const loadCandidatos = async () => {
    try {
      const supabase = createClient()

      const { data, error } = await supabase
        .from('aura_jobs_candidatos')
        .select(`
          id,
          nome_completo,
          email,
          status,
          url_entregavel_1,
          url_entregavel_2,
          url_video,
          comentarios_adicionais,
          data_envio_case,
          created_at,
          vaga:aura_jobs_vagas!vaga_id(titulo)
        `)
        .in('status', ['case_enviado', 'em_avaliacao_case'])
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Erro:', error)
        return
      }

      if (data) {
        const formatted = data.map(c => ({
          id: c.id,
          nome_completo: c.nome_completo,
          email: c.email,
          vaga_titulo: (c.vaga as any)?.titulo || 'Vaga não encontrada',
          status: c.status,
          url_entregavel_1: c.url_entregavel_1,
          url_entregavel_2: c.url_entregavel_2,
          url_video: c.url_video,
          comentarios_adicionais: c.comentarios_adicionais,
          data_envio_case: c.data_envio_case,
          created_at: c.created_at
        }))

        setCandidatos(formatted)
      }
    } catch (err) {
      console.error('Erro:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAvaliacaoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setAvaliacao(prev => ({ ...prev, [name]: value }))
  }

  const handleCloseModal = () => {
    setSelectedCandidato(null)
    setAvaliacao({
      nota_case: '',
      comentarios_case: '',
      comentario_geral: '',
    })
  }

  const handleAprovarParaEntrevista = async () => {
    if (!selectedCandidato) return

    try {
      const supabase = createClient()

      // Atualizar status para entrevista_tecnica
      const { error } = await supabase
        .from('aura_jobs_candidatos')
        .update({
          status: 'entrevista_tecnica',
          fase_atual: 'entrevista_tecnica'
        })
        .eq('id', selectedCandidato.id)

      if (error) throw error

      // Enviar email de aprovação do case
      try {
        await fetch('/api/emails/send-notification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            candidato_id: selectedCandidato.id,
            tipo_notificacao: 'case_aprovado'
          })
        })
      } catch (emailError) {
        console.error('Erro ao enviar email:', emailError)
      }

      alert('✅ Case aprovado! Candidato avançou para Entrevista Técnica.')
      handleCloseModal()
      loadCandidatos()
    } catch (error) {
      console.error('Erro:', error)
      alert('❌ Erro ao aprovar case')
    }
  }

  const handleReprovar = async () => {
    if (!selectedCandidato) return

    try {
      const supabase = createClient()

      // Atualizar status para reprovado_case
      const { error } = await supabase
        .from('aura_jobs_candidatos')
        .update({
          status: 'reprovado_case',
          fase_atual: 'case_pratico'
        })
        .eq('id', selectedCandidato.id)

      if (error) throw error

      // Enviar email de reprovação
      try {
        await fetch('/api/emails/send-notification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            candidato_id: selectedCandidato.id,
            tipo_notificacao: 'case_reprovado'
          })
        })
      } catch (emailError) {
        console.error('Erro ao enviar email:', emailError)
      }

      alert('❌ Case reprovado.')
      handleCloseModal()
      loadCandidatos()
    } catch (error) {
      console.error('Erro:', error)
      alert('❌ Erro ao reprovar case')
    }
  }

  if (loading) {
    return (
      <AvaliadorLayout>
        <div className="p-6">Carregando...</div>
      </AvaliadorLayout>
    )
  }

  return (
    <AvaliadorLayout>
      <div className="p-6">
        <h2 className="text-2xl font-semibold mb-6">Candidatos para Avaliar</h2>

        {candidatos.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Nenhum candidato encontrado</p>
          </div>
        ) : (
          <div className="space-y-4">
            {candidatos.map((candidato) => (
              <div key={candidato.id} className="bg-white p-6 rounded-lg shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold">{candidato.nome_completo}</h3>
                    <p className="text-gray-600">{candidato.email}</p>
                    <p className="text-sm text-gray-500 mt-1">{candidato.vaga_titulo}</p>

                    {candidato.url_entregavel_1 && (
                      <div className="mt-4 space-y-2">
                        <p className="text-sm font-medium text-green-600">✅ Case Entregue</p>
                        {candidato.url_entregavel_1 && (
                          <a
                            href={candidato.url_entregavel_1}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline text-sm block"
                          >
                            📎 Entregável 1
                          </a>
                        )}
                        {candidato.url_entregavel_2 && (
                          <a
                            href={candidato.url_entregavel_2}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline text-sm block"
                          >
                            📎 Entregável 2
                          </a>
                        )}
                        {candidato.url_video && (
                          <a
                            href={candidato.url_video}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline text-sm block"
                          >
                            🎥 Vídeo
                          </a>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      candidato.url_entregavel_1
                        ? 'bg-green-100 text-green-800'
                        : 'bg-purple-100 text-purple-800'
                    }`}>
                      {candidato.url_entregavel_1 ? 'Case Recebido Para Avaliação' : 'Aguardando Case'}
                    </span>

                    {candidato.url_entregavel_1 && (
                      <button
                        onClick={() => setSelectedCandidato(candidato)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm transition-colors"
                      >
                        📝 Avaliar Case
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal de Avaliação */}
        {selectedCandidato && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
              <h2 className="text-2xl font-bold mb-4">
                Avaliar: {selectedCandidato.nome_completo}
              </h2>

              <div className="mb-6 p-4 bg-gray-50 rounded">
                <h3 className="font-semibold mb-3">Informações do Case</h3>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      ✅ Case Entregue
                    </span>
                    {selectedCandidato.data_envio_case && (
                      <span className="text-gray-600">
                        em {new Date(selectedCandidato.data_envio_case).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    )}
                  </div>

                  {/* Entregáveis */}
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">🔗 Entregáveis:</p>
                    <div className="space-y-2">
                      {selectedCandidato.url_entregavel_1 && (
                        <a
                          href={selectedCandidato.url_entregavel_1}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-sm text-blue-600 hover:underline bg-blue-50 p-2 rounded"
                        >
                          📎 Entregável 1: {selectedCandidato.url_entregavel_1}
                        </a>
                      )}
                      {selectedCandidato.url_entregavel_2 && (
                        <a
                          href={selectedCandidato.url_entregavel_2}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-sm text-blue-600 hover:underline bg-blue-50 p-2 rounded"
                        >
                          📎 Entregável 2: {selectedCandidato.url_entregavel_2}
                        </a>
                      )}
                      {selectedCandidato.url_video && (
                        <a
                          href={selectedCandidato.url_video}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-sm text-blue-600 hover:underline bg-purple-50 p-2 rounded"
                        >
                          🎥 Vídeo: {selectedCandidato.url_video}
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Comentários */}
                  {selectedCandidato.comentarios_adicionais && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">💬 Comentários do candidato:</p>
                      <p className="text-sm text-gray-600 bg-white p-3 rounded border border-gray-200">
                        {selectedCandidato.comentarios_adicionais}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Nota do Case (0-10) *
                  </label>
                  <input
                    type="number"
                    name="nota_case"
                    min="0"
                    max="10"
                    step="0.1"
                    value={avaliacao.nota_case}
                    onChange={handleAvaliacaoChange}
                    className="w-full px-3 py-2 border rounded-md"
                    placeholder="Ex: 8.5"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Comentários sobre o Case
                  </label>
                  <textarea
                    name="comentarios_case"
                    value={avaliacao.comentarios_case}
                    onChange={handleAvaliacaoChange}
                    rows={3}
                    className="w-full px-3 py-2 border rounded-md"
                    placeholder="Feedback sobre o case entregue..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Comentário Geral
                  </label>
                  <textarea
                    name="comentario_geral"
                    value={avaliacao.comentario_geral}
                    onChange={handleAvaliacaoChange}
                    rows={3}
                    className="w-full px-3 py-2 border rounded-md"
                    placeholder="Impressões gerais sobre o candidato..."
                  />
                </div>

                <div className="flex justify-end gap-4 pt-4 border-t">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-6 py-2 border rounded-md hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleReprovar}
                    className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    ❌ Reprovar Case
                  </button>
                  <button
                    type="button"
                    onClick={handleAprovarParaEntrevista}
                    className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    ✅ Aprovar para Entrevista Técnica
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AvaliadorLayout>
  )
}
