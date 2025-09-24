'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

interface CandidatoParaAvaliar {
  id: string
  nome_completo: string
  email: string
  vaga_id: string
  vaga_titulo: string
  status: string
  case_enviado: boolean
  case_url?: string
  case_descricao?: string
  nota_media_case?: number
  total_avaliacoes: number
  score_ia?: number
}

export default function AvaliadorDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [candidatos, setCandidatos] = useState<CandidatoParaAvaliar[]>([])
  const [selectedCandidato, setSelectedCandidato] = useState<CandidatoParaAvaliar | null>(null)
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
    recomenda_aprovar: false,
    recomenda_entrevista: false,
  })

  useEffect(() => {
    checkAuth()
    loadCandidatos()
  }, [])

  const checkAuth = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push('/auth/login')
      return
    }
  }

  const loadCandidatos = async () => {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('candidatos')
      .select(`
        *,
        vagas!inner(titulo)
      `)
      .in('status', ['case_enviado', 'em_avaliacao_case'])
      .eq('case_enviado', true)
      .order('data_envio_case', { ascending: true })

    if (!error && data) {
      const candidatosFormatados = data.map(c => ({
        id: c.id,
        nome_completo: c.nome_completo,
        email: c.email,
        vaga_id: c.vaga_id,
        vaga_titulo: (c.vagas as any).titulo,
        status: c.status,
        case_enviado: c.case_enviado,
        case_url: c.case_url,
        case_descricao: c.case_descricao,
        nota_media_case: c.nota_media_case,
        total_avaliacoes: c.total_avaliacoes,
        score_ia: c.score_ia,
      }))
      setCandidatos(candidatosFormatados)
    }
    
    setLoading(false)
  }

  const handleAvaliacaoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setAvaliacao(prev => ({ ...prev, [name]: checked }))
    } else {
      setAvaliacao(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmitAvaliacao = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedCandidato) return
    
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return

    const avaliacaoData = {
      candidato_id: selectedCandidato.id,
      avaliador_id: user.id,
      vaga_id: selectedCandidato.vaga_id,
      nota_tecnica: avaliacao.nota_tecnica ? parseFloat(avaliacao.nota_tecnica) : null,
      nota_soft_skills: avaliacao.nota_soft_skills ? parseFloat(avaliacao.nota_soft_skills) : null,
      nota_experiencia: avaliacao.nota_experiencia ? parseFloat(avaliacao.nota_experiencia) : null,
      nota_case: avaliacao.nota_case ? parseFloat(avaliacao.nota_case) : null,
      comentarios_tecnicos: avaliacao.comentarios_tecnicos,
      comentarios_soft_skills: avaliacao.comentarios_soft_skills,
      comentarios_experiencia: avaliacao.comentarios_experiencia,
      comentarios_case: avaliacao.comentarios_case,
      comentario_geral: avaliacao.comentario_geral,
      recomenda_aprovar: avaliacao.recomenda_aprovar,
      recomenda_entrevista: avaliacao.recomenda_entrevista,
      fase_avaliada: 'avaliacao_case' as const,
    }

    const { error } = await supabase
      .from('avaliacoes')
      .insert([avaliacaoData])

    if (!error) {
      // Atualizar status do candidato se necessário
      if (avaliacao.recomenda_aprovar) {
        await supabase
          .from('candidatos')
          .update({ 
            status: 'aprovado_case',
            fase_atual: 'entrevista_tecnica',
            aprovado_case: true
          })
          .eq('id', selectedCandidato.id)
      }
      
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
        recomenda_aprovar: false,
        recomenda_entrevista: false,
      })
      loadCandidatos()
    }
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Carregando...</h1>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Portal Avaliador
            </h1>
            <div className="flex gap-4">
              <Link href="/" className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md">
                Início
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                      <span>Score IA: {candidato.score_ia}/10</span>
                      <span>Avaliações: {candidato.total_avaliacoes}</span>
                      {candidato.nota_media_case && (
                        <span>Nota Média: {candidato.nota_media_case.toFixed(1)}/10</span>
                      )}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => setSelectedCandidato(candidato)}
                    className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
                  >
                    Avaliar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal de Avaliação */}
      {selectedCandidato && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-2xl font-bold mb-4">
              Avaliar: {selectedCandidato.nome_completo}
            </h2>
            
            <div className="mb-6 p-4 bg-gray-50 rounded">
              <h3 className="font-semibold mb-2">Informações do Case</h3>
              <p className="text-sm text-gray-600 mb-2">
                {selectedCandidato.case_descricao}
              </p>
              {selectedCandidato.case_url && (
                <a
                  href={selectedCandidato.case_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-sm"
                >
                  Ver arquivo do case →
                </a>
              )}
            </div>
            
            <form onSubmit={handleSubmitAvaliacao} className="space-y-6">
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
              
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="recomenda_aprovar"
                    checked={avaliacao.recomenda_aprovar}
                    onChange={handleAvaliacaoChange}
                    className="mr-2"
                  />
                  <span>Recomendo aprovar este candidato</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="recomenda_entrevista"
                    checked={avaliacao.recomenda_entrevista}
                    onChange={handleAvaliacaoChange}
                    className="mr-2"
                  />
                  <span>Recomendo entrevista técnica</span>
                </label>
              </div>
              
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setSelectedCandidato(null)}
                  className="px-6 py-2 border rounded-md hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
                >
                  Enviar Avaliação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}