'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAvaliadorAuth } from '@/hooks/useAvaliadorAuth'
import { AvaliadorLayout } from '@/components/avaliador/AvaliadorLayout'

interface Candidato {
  id: string
  nome_completo: string
  email: string
  vaga_id: string
  vaga_titulo: string
  status: string
  score_ia?: number
  created_at: string
  case_url?: string
  case_descricao?: string
  // Novos campos de entregáveis
  url_entregavel_1?: string
  url_entregavel_2?: string
  url_video?: string
  comentarios_adicionais?: string
  data_envio_case?: string
}

interface CaseEntrega {
  id: string
  candidato_id: string
  vaga_id?: string
  nome_completo: string
  email: string
  tipo_case: string
  link_entregavel_1?: string
  link_entregavel_2?: string
  link_entregavel_3?: string
  comentarios_adicionais?: string
  source?: string
  data_submissao: string
  ip_submissao?: string
}

interface Vaga {
  id: string
  titulo: string
}

export default function CasesPraticosPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAvaliadorAuth()
  const [loading, setLoading] = useState(true)
  const [candidatos, setCandidatos] = useState<Candidato[]>([])
  const [vagas, setVagas] = useState<Vaga[]>([])
  const [vagaSelecionada, setVagaSelecionada] = useState<string>('todas')
  const [selectedCandidato, setSelectedCandidato] = useState<Candidato | null>(null)
  const [caseEntrega, setCaseEntrega] = useState<CaseEntrega | null>(null)
  const [loadingCase, setLoadingCase] = useState(false)
  const [avaliacao, setAvaliacao] = useState({
    nota_tecnica: '',
    nota_soft_skills: '',
    nota_experiencia: '',
    nota_case: '',
    comentarios_tecnicos: '',
    comentarios_soft_skills: '',
    comentarios_experiencia: '',
    comentarios_case: '',
    comentario_geral: '',
  })

  useEffect(() => {
    if (user) {
      loadCandidatos()
      loadVagas()
    }
  }, [user])

  // Carregar entrega do case quando selecionar candidato
  useEffect(() => {
    if (selectedCandidato) {
      loadCaseEntrega(selectedCandidato.id)
    }
  }, [selectedCandidato])

  // Função para buscar entrega do case (tenta banco primeiro, depois JSON)
  const loadCaseEntrega = async (candidatoId: string) => {
    setLoadingCase(true)
    try {
      const supabase = createClient()

      // TENTAR BUSCAR DO BANCO PRIMEIRO
      const { data: dbData, error: dbError } = await supabase
        .from('aura_jobs_case_entregas')
        .select('*')
        .eq('candidato_id', candidatoId)
        .order('data_submissao', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (!dbError && dbData) {
        console.log('✅ Entrega encontrada no BANCO')
        setCaseEntrega(dbData)
        setLoadingCase(false)
        return
      }

      // SE NÃO ENCONTROU NO BANCO, BUSCAR DO JSON
      console.log('⚠️ Não encontrado no banco, buscando em JSON...')

      const jsonResponse = await fetch(`/api/case/listar-json?candidato_id=${candidatoId}`)
      const jsonResult = await jsonResponse.json()

      if (jsonResult.success && jsonResult.data) {
        console.log('✅ Entrega encontrada em JSON')
        setCaseEntrega(jsonResult.data)
      } else {
        console.log('ℹ️ Nenhuma entrega encontrada')
        setCaseEntrega(null)
      }

    } catch (err) {
      console.error('Erro ao buscar entrega do case:', err)
      setCaseEntrega(null)
    } finally {
      setLoadingCase(false)
    }
  }

  // Get case link based on job title
  const getCaseLink = (vagaTitulo: string): string => {
    const titulo = vagaTitulo.toLowerCase()

    if (titulo.includes('product designer') || titulo.includes('designer') || titulo.includes('po')) {
      return 'https://www.notion.so/autou-digital/Case-Pr-tico-AutoU-Product-Designer-PO-20d36ce78e5580a5a8f7ce7693d4bfce'
    }

    if (titulo.includes('desenvolvedor') || titulo.includes('developer') || titulo.includes('frontend') || titulo.includes('backend')) {
      return 'https://www.notion.so/autou-digital/Case-Pr-tico-AutoU-Desenvolvimento-18836ce78e5580d0b59bcf9610b27769'
    }

    if (titulo.includes('consultor') || titulo.includes('negócio') || titulo.includes('business')) {
      return 'https://www.notion.so/autou-digital/Case-Pr-tico-AutoU-Consultoria-1ff36ce78e5580f5a410c5393d227bfe'
    }

    return 'https://www.notion.so/autou-digital/Case-Pr-tico-AutoU-Desenvolvimento-18836ce78e5580d0b59bcf9610b27769'
  }

  const loadVagas = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('aura_jobs_vagas')
        .select('id, titulo')
        .eq('ativa', true)
        .order('titulo', { ascending: true })

      if (error) {
        console.error('Erro ao carregar vagas:', error)
        return
      }

      if (data) {
        setVagas(data)
      }
    } catch (err) {
      console.error('Erro ao carregar vagas:', err)
    }
  }

  const loadCandidatos = async () => {
    try {
      const supabase = createClient()

      // Buscar informações do avaliador logado (apenas para validação)
      const { data: { user: authUser } } = await supabase.auth.getUser()
      console.log('🔐 AUTH USER:', authUser?.email)
      if (!authUser) {
        console.log('❌ Usuário não autenticado - parando')
        return
      }

      console.log('📊 Buscando candidatos...')
      // BUSCAR TODOS OS CANDIDATOS SEM FILTRO DE PERMISSÕES
      const { data, error } = await supabase
        .from('aura_jobs_candidatos')
        .select(`
          *,
          vaga:aura_jobs_vagas!vaga_id(titulo, tipo_vaga, case_link_notion, prazo_case_dias)
        `)
        .in('status', ['case_enviado', 'em_avaliacao_case'])
        .order('created_at', { ascending: false })

      console.log('📊 Candidatos encontrados:', data?.length || 0)
      console.log('❌ Erro:', error)

      if (error) {
        console.error('Erro ao carregar candidatos:', error)
        return
      }

      if (data) {
        console.log('✅ Processando', data.length, 'candidatos')
        // TEMPORÁRIO: Mostrar TODOS os candidatos (sem filtro de permissões)
        const candidatosFiltrados = data

        const candidatosFormatados = candidatosFiltrados.map(c => {
          const vagaTitulo = (c.vaga as any)?.titulo || 'Vaga não encontrada'
          return {
            id: c.id,
            nome_completo: c.nome_completo,
            email: c.email,
            vaga_id: c.vaga_id,
            vaga_titulo: vagaTitulo,
            status: c.status,
            score_ia: c.score_ia,
            created_at: c.created_at,
            case_url: getCaseLink(vagaTitulo),
            case_descricao: 'Aguardando Resposta do Candidato',
            // Novos campos de entregáveis
            url_entregavel_1: c.url_entregavel_1,
            url_entregavel_2: c.url_entregavel_2,
            url_video: c.url_video,
            comentarios_adicionais: c.comentarios_adicionais,
            data_envio_case: c.data_envio_case
          }
        })
        console.log('✅ setCandidatos com', candidatosFormatados.length, 'candidatos')
        setCandidatos(candidatosFormatados)
      } else {
        console.log('⚠️ Data é null/undefined')
      }
    } catch (err) {
      console.error('Erro ao carregar candidatos:', err)
    } finally {
      setLoading(false)
    }
  }

  // Filtrar candidatos por vaga selecionada
  const candidatosFiltrados = vagaSelecionada === 'todas'
    ? candidatos
    : candidatos.filter(c => c.vaga_id === vagaSelecionada)

  const handleAvaliacaoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setAvaliacao(prev => ({ ...prev, [name]: value }))
  }

  const handleCloseModal = () => {
    setSelectedCandidato(null)
    setCaseEntrega(null)
    setAvaliacao({
      nota_tecnica: '',
      nota_soft_skills: '',
      nota_experiencia: '',
      nota_case: '',
      comentarios_tecnicos: '',
      comentarios_soft_skills: '',
      comentarios_experiencia: '',
      comentarios_case: '',
      comentario_geral: '',
    })
  }

  const handleAprovarParaEntrevista = async () => {
    if (!selectedCandidato) return

    try {
      const supabase = createClient()

      const { error } = await supabase
        .from('aura_jobs_candidatos')
        .update({
          status: 'entrevista_tecnica',
          fase_atual: 'entrevista_tecnica'
        })
        .eq('id', selectedCandidato.id)

      if (error) {
        alert('Erro ao atualizar candidato: ' + error.message)
        return
      }

      // Enviar e-mail de aprovação do case
      try {
        await fetch('/api/emails/send-notification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: selectedCandidato.email,
            type: 'aprovacaoCase',
            data: {
              nome: selectedCandidato.nome_completo,
              vagaTitulo: selectedCandidato.vaga_titulo
            }
          })
        })
      } catch (emailError) {
        console.error('Erro ao enviar e-mail:', emailError)
        // Não bloqueia o fluxo se o e-mail falhar
      }

      alert('Candidato aprovado para entrevista técnica!')
      handleCloseModal()
      loadCandidatos()
    } catch (error: any) {
      alert('Erro: ' + error.message)
    }
  }

  const handleReprovar = async () => {
    if (!selectedCandidato) return

    try {
      const supabase = createClient()

      const { error } = await supabase
        .from('aura_jobs_candidatos')
        .update({
          status: 'reprovado_case',
          fase_atual: 'avaliacao_case'
        })
        .eq('id', selectedCandidato.id)

      if (error) {
        alert('Erro ao atualizar candidato: ' + error.message)
        return
      }

      // Enviar e-mail de reprovação do case
      try {
        await fetch('/api/emails/send-notification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: selectedCandidato.email,
            type: 'reprovacaoCase',
            data: {
              nome: selectedCandidato.nome_completo,
              vagaTitulo: selectedCandidato.vaga_titulo
            }
          })
        })
      } catch (emailError) {
        console.error('Erro ao enviar e-mail:', emailError)
        // Não bloqueia o fluxo se o e-mail falhar
      }

      alert('Candidato reprovado no case.')
      handleCloseModal()
      loadCandidatos()
    } catch (error: any) {
      alert('Erro: ' + error.message)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Carregando...</h1>
        </div>
      </div>
    )
  }

  if (!user) {
    router.push('/avaliador/auth/login')
    return null
  }

  if (loading) {
    return (
      <AvaliadorLayout>
        <div className="p-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Carregando candidatos...</h1>
          </div>
        </div>
      </AvaliadorLayout>
    )
  }

  return (
    <AvaliadorLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Candidatos para Avaliar</h2>

          {/* Filtro por Vaga */}
          <div className="flex items-center gap-2">
            <label htmlFor="filtro-vaga" className="text-sm font-medium text-gray-700">
              Filtrar por vaga:
            </label>
            <select
              id="filtro-vaga"
              value={vagaSelecionada}
              onChange={(e) => setVagaSelecionada(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="todas">Todas as vagas</option>
              {vagas.map((vaga) => (
                <option key={vaga.id} value={vaga.id}>
                  {vaga.titulo}
                </option>
              ))}
            </select>
          </div>
        </div>

        {candidatosFiltrados.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600">
              {vagaSelecionada === 'todas'
                ? 'Não há candidatos para avaliar no momento.'
                : 'Não há candidatos para esta vaga.'}
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {candidatosFiltrados.map((candidato) => (
              <div key={candidato.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-1">{candidato.nome_completo}</h3>
                    <p className="text-gray-600 mb-2">{candidato.email}</p>
                    <p className="text-sm text-gray-500 mb-3">Vaga: {candidato.vaga_titulo}</p>

                    <div className="flex gap-4 text-sm">
                      {candidato.score_ia && (
                        <span className="text-gray-600">
                          Score IA: <strong>{candidato.score_ia}/10</strong>
                        </span>
                      )}
                      <span className="text-gray-600">
                        Avaliações: <strong>0</strong>
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedCandidato(candidato)}
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Avaliar
                  </button>
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

                {loadingCase ? (
                  <div className="text-sm text-gray-600 py-4">
                    Carregando informações do case...
                  </div>
                ) : caseEntrega ? (
                  <div className="space-y-4">
                    {/* Status: Case Submetido */}
                    <div className="flex items-center gap-2 text-sm">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        ✅ Case Submetido
                      </span>
                      <span className="text-gray-600">
                        em {new Date(caseEntrega.data_submissao).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>

                    {/* Origem (Source) */}
                    {caseEntrega.source && (
                      <div className="text-sm text-gray-700">
                        <span className="font-medium">📍 Origem:</span>{' '}
                        {caseEntrega.source === 'notion-dev' && 'Case de Desenvolvimento'}
                        {caseEntrega.source === 'notion-design' && 'Case de Design/PO'}
                        {caseEntrega.source === 'notion-consultoria' && 'Case de Consultoria'}
                        {caseEntrega.source === 'direto' && 'Acesso Direto'}
                      </div>
                    )}

                    {/* Links dos Entregáveis */}
                    {(caseEntrega.link_entregavel_1 || caseEntrega.link_entregavel_2 || caseEntrega.link_entregavel_3) && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">🔗 Entregáveis:</p>
                        <div className="space-y-1">
                          {caseEntrega.link_entregavel_1 && (
                            <a
                              href={caseEntrega.link_entregavel_1}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block text-sm text-blue-600 hover:underline"
                            >
                              • Link 1: {caseEntrega.link_entregavel_1.substring(0, 60)}...
                            </a>
                          )}
                          {caseEntrega.link_entregavel_2 && (
                            <a
                              href={caseEntrega.link_entregavel_2}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block text-sm text-blue-600 hover:underline"
                            >
                              • Link 2: {caseEntrega.link_entregavel_2.substring(0, 60)}...
                            </a>
                          )}
                          {caseEntrega.link_entregavel_3 && (
                            <a
                              href={caseEntrega.link_entregavel_3}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block text-sm text-blue-600 hover:underline"
                            >
                              • Link 3: {caseEntrega.link_entregavel_3.substring(0, 60)}...
                            </a>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Comentários Adicionais do Candidato */}
                    {caseEntrega.comentarios_adicionais && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">💬 Comentários do candidato:</p>
                        <p className="text-sm text-gray-600 bg-white p-3 rounded border border-gray-200">
                          {caseEntrega.comentarios_adicionais}
                        </p>
                      </div>
                    )}

                    {/* Link do case prático original */}
                    {selectedCandidato.case_url && (
                      <div className="pt-3 border-t border-gray-200">
                        <a
                          href={selectedCandidato.case_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm"
                        >
                          📄 Ver arquivo do case original →
                        </a>
                      </div>
                    )}
                  </div>
                ) : selectedCandidato.url_entregavel_1 || selectedCandidato.url_entregavel_2 || selectedCandidato.url_video ? (
                  // Entregáveis do novo sistema (direto no candidato)
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
                ) : (
                  <div className="space-y-3">
                    {/* Status: Aguardando Resposta */}
                    <div className="flex items-center gap-2 text-sm">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        ⏳ Aguardando Resposta do Candidato
                      </span>
                    </div>

                    <p className="text-sm text-gray-600">
                      O candidato ainda não submeteu a resposta do case prático.
                    </p>

                    {/* Link do case prático original */}
                    {selectedCandidato.case_url && (
                      <div className="pt-3 border-t border-gray-200">
                        <a
                          href={selectedCandidato.case_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm"
                        >
                          📄 Ver arquivo do case original →
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Nota Técnica (0-10)
                    </label>
                    <input
                      type="number"
                      name="nota_tecnica"
                      min="0"
                      max="10"
                      step="0.1"
                      value={avaliacao.nota_tecnica}
                      onChange={handleAvaliacaoChange}
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Nota Soft Skills (0-10)
                    </label>
                    <input
                      type="number"
                      name="nota_soft_skills"
                      min="0"
                      max="10"
                      step="0.1"
                      value={avaliacao.nota_soft_skills}
                      onChange={handleAvaliacaoChange}
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Nota Experiência (0-10)
                    </label>
                    <input
                      type="number"
                      name="nota_experiencia"
                      min="0"
                      max="10"
                      step="0.1"
                      value={avaliacao.nota_experiencia}
                      onChange={handleAvaliacaoChange}
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Nota Case (0-10) *
                    </label>
                    <input
                      type="number"
                      name="nota_case"
                      min="0"
                      max="10"
                      step="0.1"
                      required
                      value={avaliacao.nota_case}
                      onChange={handleAvaliacaoChange}
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>
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
                    Reprovar Case
                  </button>
                  <button
                    type="button"
                    onClick={handleAprovarParaEntrevista}
                    className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Aprovar para Entrevista Técnica
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
