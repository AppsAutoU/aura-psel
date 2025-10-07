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
}

export default function CasesPraticosPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAvaliadorAuth()
  const [loading, setLoading] = useState(true)
  const [candidatos, setCandidatos] = useState<Candidato[]>([])
  const [selectedCandidato, setSelectedCandidato] = useState<Candidato | null>(null)
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
  const [caseSubmetido, setCaseSubmetido] = useState(false)
  const [linkRespostaCase, setLinkRespostaCase] = useState('')

  useEffect(() => {
    if (user) {
      loadCandidatos()
    }
  }, [user])

  // Carregar estado do case quando selecionar candidato
  useEffect(() => {
    if (selectedCandidato) {
      const casesSubmetidos = JSON.parse(localStorage.getItem('cases_submetidos') || '{}')
      const caseInfo = casesSubmetidos[selectedCandidato.id]

      if (caseInfo) {
        setCaseSubmetido(caseInfo.submetido)
        setLinkRespostaCase(caseInfo.link || '')
      } else {
        setCaseSubmetido(false)
        setLinkRespostaCase('')
      }
    }
  }, [selectedCandidato])

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

  const loadCandidatos = async () => {
    try {
      const supabase = createClient()

      const { data, error } = await supabase
        .from('aura_jobs_candidatos')
        .select(`
          *,
          vaga:aura_jobs_vagas!vaga_id(titulo)
        `)
        .in('status', ['case_enviado', 'em_avaliacao_case'])
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Erro ao carregar candidatos:', error)
        return
      }

      if (data) {
        const candidatosFormatados = data.map(c => {
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
            case_descricao: 'Aguardando Resposta do Candidato'
          }
        })
        setCandidatos(candidatosFormatados)
      }
    } catch (err) {
      console.error('Erro ao carregar candidatos:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAvaliacaoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setAvaliacao(prev => ({ ...prev, [name]: value }))
  }

  const handleCaseSubmetidoChange = (submetido: boolean) => {
    if (!selectedCandidato) return

    setCaseSubmetido(submetido)

    // Salvar no localStorage
    const casesSubmetidos = JSON.parse(localStorage.getItem('cases_submetidos') || '{}')
    casesSubmetidos[selectedCandidato.id] = {
      submetido,
      link: submetido ? linkRespostaCase : ''
    }
    localStorage.setItem('cases_submetidos', JSON.stringify(casesSubmetidos))

    // Se desmarcar "submetido", limpar o link
    if (!submetido) {
      setLinkRespostaCase('')
    }
  }

  const handleLinkRespostaCaseChange = (link: string) => {
    if (!selectedCandidato) return

    setLinkRespostaCase(link)

    // Salvar no localStorage
    const casesSubmetidos = JSON.parse(localStorage.getItem('cases_submetidos') || '{}')
    casesSubmetidos[selectedCandidato.id] = {
      submetido: caseSubmetido,
      link
    }
    localStorage.setItem('cases_submetidos', JSON.stringify(casesSubmetidos))
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
      setSelectedCandidato(null)
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
      setSelectedCandidato(null)
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
        <h2 className="text-2xl font-semibold mb-6">Candidatos para Avaliar</h2>

        {candidatos.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600">Não há candidatos para avaliar no momento.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {candidatos.map((candidato) => (
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

                {/* Checkboxes para status do case */}
                <div className="space-y-2 mb-4">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!caseSubmetido}
                      onChange={(e) => handleCaseSubmetidoChange(!e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Aguardando Resposta do Candidato</span>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={caseSubmetido}
                      onChange={(e) => handleCaseSubmetidoChange(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Case Submetido pelo Candidato</span>
                  </label>
                </div>

                {/* Campo para link da resposta (aparece quando marca "Case Submetido") */}
                {caseSubmetido && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1 text-gray-700">
                      Link da Resposta do Candidato
                    </label>
                    <input
                      type="url"
                      placeholder="Cole aqui o link da resposta submetida pelo candidato"
                      value={linkRespostaCase}
                      onChange={(e) => handleLinkRespostaCaseChange(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md text-sm"
                    />
                    {linkRespostaCase && (
                      <a
                        href={linkRespostaCase}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm inline-block mt-2"
                      >
                        Ver a resposta enviada →
                      </a>
                    )}
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
                      Ver arquivo do case →
                    </a>
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
                    onClick={() => setSelectedCandidato(null)}
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
