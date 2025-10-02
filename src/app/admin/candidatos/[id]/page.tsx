'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAdminAuth } from '@/hooks/useAdminAuth'
import Link from 'next/link'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { LoadingPage } from '@/components/ui/loading'
import { useToast } from '@/components/ui/toast'

interface Candidato {
  id: string
  nome_completo: string
  email: string
  telefone?: string
  whatsapp?: string
  linkedin?: string
  portfolio?: string
  github?: string
  cidade?: string
  estado?: string
  empresa_atual?: string
  cargo_atual?: string
  tempo_experiencia_total?: number
  principais_skills?: string
  linguagens_programacao?: string
  nivel_ingles?: string
  salario_pretendido?: number
  disponibilidade?: string
  score_ia?: number
  status: string
  vaga_id: string
  created_at: string
  updated_at?: string
  experiencia_relevante?: string
  motivacao?: string
  desafios_tecnicos?: string
  comentarios_adicionais?: string
  curriculo_url?: string
  carta_apresentacao_url?: string
}

interface Vaga {
  id: string
  titulo: string
  departamento?: string
  tipo_contrato?: string
  modelo_trabalho?: string
}

export default function CandidatoDetalhesPage() {
  const router = useRouter()
  const params = useParams()
  const candidatoId = params.id as string
  const { user, loading: authLoading, isAdmin } = useAdminAuth()
  const { addToast } = useToast()
  
  const [candidato, setCandidato] = useState<Candidato | null>(null)
  const [vaga, setVaga] = useState<Vaga | null>(null)
  const [loading, setLoading] = useState(true)
  const [notas, setNotas] = useState('')
  const [salvandoNotas, setSalvandoNotas] = useState(false)
  const [curriculoUrl, setCurriculoUrl] = useState<string | null>(null)
  const [cartaUrl, setCartaUrl] = useState<string | null>(null)
  const [avaliandoIA, setAvaliandoIA] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/admin/auth/login')
    } else if (!authLoading && user && candidatoId) {
      loadData()
    }
  }, [authLoading, user, candidatoId, router])

  const loadData = async () => {
    try {
      const supabase = createClient()
      
      const { data: candidatoData, error: candidatoError } = await supabase
        .from('aura_jobs_candidatos')
        .select('*')
        .eq('id', candidatoId)
        .single()

      if (candidatoError) throw candidatoError
      
      if (candidatoData) {
        setCandidato(candidatoData)
        setNotas(candidatoData.comentarios_adicionais || '')

        // Generate signed URLs for documents
        console.log('Curriculo URL from DB:', candidatoData.curriculo_url)
        console.log('Carta URL from DB:', candidatoData.carta_apresentacao_url)

        if (candidatoData.curriculo_url) {
          // Try to get a signed URL for private bucket
          const { data: signedData, error: signedError } = await supabase.storage
            .from('candidatos')
            .createSignedUrl(candidatoData.curriculo_url, 3600)

          if (signedError) {
            console.error('Error creating signed URL for curriculo:', signedError)
            // Fallback to public URL
            const { data } = supabase.storage
              .from('candidatos')
              .getPublicUrl(candidatoData.curriculo_url)
            setCurriculoUrl(data.publicUrl)
            console.log('Using public URL for curriculo:', data.publicUrl)
          } else {
            setCurriculoUrl(signedData.signedUrl)
            console.log('Using signed URL for curriculo:', signedData.signedUrl)
          }
        }

        if (candidatoData.carta_apresentacao_url) {
          // Try to get a signed URL for private bucket
          const { data: signedData, error: signedError } = await supabase.storage
            .from('candidatos')
            .createSignedUrl(candidatoData.carta_apresentacao_url, 3600)

          if (signedError) {
            console.error('Error creating signed URL for carta:', signedError)
            // Fallback to public URL
            const { data } = supabase.storage
              .from('candidatos')
              .getPublicUrl(candidatoData.carta_apresentacao_url)
            setCartaUrl(data.publicUrl)
            console.log('Using public URL for carta:', data.publicUrl)
          } else {
            setCartaUrl(signedData.signedUrl)
            console.log('Using signed URL for carta:', signedData.signedUrl)
          }
        }

        if (candidatoData.vaga_id) {
          const { data: vagaData, error: vagaError } = await supabase
            .from('aura_jobs_vagas')
            .select('id, titulo, departamento, tipo_contrato, modelo_trabalho')
            .eq('id', candidatoData.vaga_id)
            .single()

          if (!vagaError && vagaData) {
            setVaga(vagaData)
          }
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      addToast({
        type: 'error',
        title: 'Erro',
        message: 'Erro ao carregar dados do candidato.'
      })
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (status: string) => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('aura_jobs_candidatos')
        .update({ status })
        .eq('id', candidatoId)
      
      if (error) throw error
      
      addToast({
        type: 'success',
        title: 'Status atualizado',
        message: 'O status do candidato foi atualizado com sucesso.'
      })
      
      loadData()
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
      addToast({
        type: 'error',
        title: 'Erro',
        message: 'Erro ao atualizar status do candidato.'
      })
    }
  }

  const salvarNotas = async () => {
    setSalvandoNotas(true)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('aura_jobs_candidatos')
        .update({ comentarios_adicionais: notas })
        .eq('id', candidatoId)

      if (error) throw error

      addToast({
        type: 'success',
        title: 'Notas salvas',
        message: 'As notas foram salvas com sucesso.'
      })
    } catch (error) {
      console.error('Erro ao salvar notas:', error)
      addToast({
        type: 'error',
        title: 'Erro',
        message: 'Erro ao salvar notas.'
      })
    } finally {
      setSalvandoNotas(false)
    }
  }

  const avaliarComIA = async () => {
    setAvaliandoIA(true)
    try {
      const response = await fetch('/api/ai/avaliar-candidato', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidato_id: candidatoId })
      })

      const data = await response.json()
      console.log('AI Response:', data)

      if (!response.ok) {
        const errorMsg = data.details || data.error || 'Erro ao avaliar candidato'
        console.error('API Error:', data)
        throw new Error(errorMsg)
      }

      addToast({
        type: 'success',
        title: 'Avaliação concluída',
        message: `Score: ${data.score}/10 - Status: ${data.status}`
      })

      // Recarregar dados
      await loadData()
    } catch (error: any) {
      console.error('Erro ao avaliar candidato:', error)
      addToast({
        type: 'error',
        title: 'Erro na Avaliação IA',
        message: error.message || 'Erro ao processar avaliação da IA.'
      })
    } finally {
      setAvaliandoIA(false)
    }
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'pendente': 'bg-gray-100 text-gray-800',
      'em_analise': 'bg-blue-100 text-blue-800',
      'aprovado': 'bg-green-100 text-green-800',
      'reprovado': 'bg-red-100 text-red-800',
      'inscrito': 'bg-blue-100 text-blue-800',
      'em_avaliacao_ia': 'bg-yellow-100 text-yellow-800',
      'reprovado_ia': 'bg-red-100 text-red-800',
      'case_enviado': 'bg-purple-100 text-purple-800',
      'em_avaliacao_case': 'bg-orange-100 text-orange-800',
      'aprovado_case': 'bg-green-100 text-green-800',
      'reprovado_case': 'bg-red-100 text-red-800',
      'entrevista_tecnica': 'bg-indigo-100 text-indigo-800',
      'entrevista_socios': 'bg-pink-100 text-pink-800',
      'contratado': 'bg-emerald-100 text-emerald-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'pendente': 'Pendente',
      'em_analise': 'Em Análise',
      'aprovado': 'Aprovado',
      'reprovado': 'Reprovado',
      'inscrito': 'Inscrito',
      'em_avaliacao_ia': 'Em Avaliação IA',
      'reprovado_ia': 'Reprovado IA',
      'case_enviado': 'Case Enviado',
      'em_avaliacao_case': 'Avaliando Case',
      'aprovado_case': 'Case Aprovado',
      'reprovado_case': 'Case Reprovado',
      'entrevista_tecnica': 'Entrevista Técnica',
      'entrevista_socios': 'Entrevista Sócios',
      'contratado': 'Contratado',
    }
    return labels[status] || status
  }

  if (authLoading || loading) {
    return (
      <LoadingPage 
        text={authLoading ? 'Verificando autenticação...' : 'Carregando candidato...'}
      />
    )
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-red-600">Acesso Negado</h1>
          <p className="text-gray-600">Você não tem permissão de administrador.</p>
          <button 
            onClick={() => router.push('/admin/auth/login')} 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Fazer Login
          </button>
        </div>
      </div>
    )
  }

  if (!candidato) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Candidato não encontrado</h1>
        </div>
      </div>
    )
  }

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              href={vaga ? `/admin/vagas/${vaga.id}/candidatos` : '/admin/candidatos'} 
              className="text-gray-600 hover:text-gray-900"
            >
              ← Voltar
            </Link>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                {candidato.nome_completo}
              </h1>
              {vaga && (
                <p className="text-gray-600 mt-1">
                  Candidato para: {vaga.titulo}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={avaliarComIA}
              disabled={avaliandoIA}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {avaliandoIA ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Avaliando...
                </>
              ) : (
                'Avaliar com IA'
              )}
            </button>
            <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(candidato.status)}`}>
              {getStatusLabel(candidato.status)}
            </span>
            <select
              value={candidato.status}
              onChange={(e) => updateStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="pendente">Pendente</option>
              <option value="em_analise">Em Análise</option>
              <option value="aprovado">Aprovado</option>
              <option value="reprovado">Reprovado</option>
              <option value="inscrito">Inscrito</option>
              <option value="em_avaliacao_ia">Em Avaliação IA</option>
              <option value="reprovado_ia">Reprovado IA</option>
              <option value="case_enviado">Case Enviado</option>
              <option value="em_avaliacao_case">Avaliando Case</option>
              <option value="aprovado_case">Case Aprovado</option>
              <option value="reprovado_case">Case Reprovado</option>
              <option value="entrevista_tecnica">Entrevista Técnica</option>
              <option value="entrevista_socios">Entrevista Sócios</option>
              <option value="contratado">Contratado</option>
            </select>
          </div>
        </div>

        {/* Informações do Candidato */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna Principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Informações Pessoais */}
            <div className="bg-white rounded-xl border border-gray-200/60 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Informações Pessoais</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="text-gray-900">{candidato.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Telefone</label>
                  <p className="text-gray-900">{candidato.telefone || 'Não informado'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">WhatsApp</label>
                  <p className="text-gray-900">{candidato.whatsapp || 'Não informado'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Localização</label>
                  <p className="text-gray-900">
                    {candidato.cidade || 'Cidade não informada'}, {candidato.estado || 'Estado não informado'}
                  </p>
                </div>
              </div>
            </div>

            {/* Experiência Profissional */}
            <div className="bg-white rounded-xl border border-gray-200/60 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Experiência Profissional</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Empresa Atual</label>
                    <p className="text-gray-900">{candidato.empresa_atual || 'Não informado'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Cargo Atual</label>
                    <p className="text-gray-900">{candidato.cargo_atual || 'Não informado'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Tempo de Experiência</label>
                    <p className="text-gray-900">
                      {candidato.tempo_experiencia_total 
                        ? `${Math.floor(candidato.tempo_experiencia_total/12)} anos e ${candidato.tempo_experiencia_total % 12} meses`
                        : 'Não informado'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Nível de Inglês</label>
                    <p className="text-gray-900">{candidato.nivel_ingles || 'Não informado'}</p>
                  </div>
                </div>
                
                {candidato.experiencia_relevante && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Experiência Relevante</label>
                    <p className="text-gray-900 mt-1 whitespace-pre-wrap">{candidato.experiencia_relevante}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Competências */}
            <div className="bg-white rounded-xl border border-gray-200/60 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Competências</h2>
              <div className="space-y-4">
                {candidato.principais_skills && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Principais Skills</label>
                    <p className="text-gray-900 mt-1">{candidato.principais_skills}</p>
                  </div>
                )}
                {candidato.linguagens_programacao && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Linguagens de Programação</label>
                    <p className="text-gray-900 mt-1">{candidato.linguagens_programacao}</p>
                  </div>
                )}
                {candidato.desafios_tecnicos && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Desafios Técnicos Resolvidos</label>
                    <p className="text-gray-900 mt-1 whitespace-pre-wrap">{candidato.desafios_tecnicos}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Motivação */}
            {candidato.motivacao && (
              <div className="bg-white rounded-xl border border-gray-200/60 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Motivação</h2>
                <p className="text-gray-900 whitespace-pre-wrap">{candidato.motivacao}</p>
              </div>
            )}
          </div>

          {/* Coluna Lateral */}
          <div className="space-y-6">
            {/* Links */}
            <div className="bg-white rounded-xl border border-gray-200/60 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Links</h2>
              <div className="space-y-3">
                {candidato.linkedin && (
                  <a 
                    href={candidato.linkedin} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-600 hover:underline"
                  >
                    <span>LinkedIn</span>
                    <span>→</span>
                  </a>
                )}
                {candidato.github && (
                  <a 
                    href={candidato.github} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-600 hover:underline"
                  >
                    <span>GitHub</span>
                    <span>→</span>
                  </a>
                )}
                {candidato.portfolio && (
                  <a 
                    href={candidato.portfolio} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-600 hover:underline"
                  >
                    <span>Portfolio</span>
                    <span>→</span>
                  </a>
                )}
                {!candidato.linkedin && !candidato.github && !candidato.portfolio && (
                  <p className="text-gray-500 text-sm">Nenhum link fornecido</p>
                )}
              </div>
            </div>

            {/* Documentos */}
            <div className="bg-white rounded-xl border border-gray-200/60 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Documentos</h2>
              <div className="space-y-3">
                {curriculoUrl && (
                  <a
                    href={curriculoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-600 hover:underline"
                  >
                    <span>Currículo</span>
                    <span>→</span>
                  </a>
                )}
                {cartaUrl && (
                  <a
                    href={cartaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-600 hover:underline"
                  >
                    <span>Carta de Apresentação</span>
                    <span>→</span>
                  </a>
                )}
                {!curriculoUrl && !cartaUrl && (
                  <p className="text-gray-500 text-sm">Nenhum documento enviado</p>
                )}
              </div>
            </div>

            {/* Informações Salariais */}
            <div className="bg-white rounded-xl border border-gray-200/60 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Informações Salariais</h2>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">Pretensão Salarial</label>
                  <p className="text-gray-900 font-medium">
                    {candidato.salario_pretendido
                      ? `R$ ${candidato.salario_pretendido.toLocaleString('pt-BR')}`
                      : 'Não informado'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Disponibilidade</label>
                  <p className="text-gray-900">
                    {candidato.disponibilidade || 'Não informado'}
                  </p>
                </div>
              </div>
            </div>

            {/* Score IA */}
            {candidato.score_ia !== null && candidato.score_ia !== undefined && (
              <div className="bg-white rounded-xl border border-gray-200/60 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Avaliação IA</h2>
                <div className="flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-blue-600">
                      {Math.round(candidato.score_ia * 10)}%
                    </div>
                    <p className="text-sm text-gray-500 mt-1">Score de Compatibilidade</p>
                    <p className="text-xs text-gray-400 mt-1">{candidato.score_ia}/10</p>
                  </div>
                </div>
              </div>
            )}

            {/* Notas Internas */}
            <div className="bg-white rounded-xl border border-gray-200/60 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Notas Internas</h2>
              <textarea
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                placeholder="Adicione notas sobre este candidato..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none"
                rows={6}
              />
              <button
                onClick={salvarNotas}
                disabled={salvandoNotas}
                className="mt-3 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {salvandoNotas ? 'Salvando...' : 'Salvar Notas'}
              </button>
            </div>

            {/* Datas */}
            <div className="bg-white rounded-xl border border-gray-200/60 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Registro</h2>
              <div className="space-y-3 text-sm">
                <div>
                  <label className="font-medium text-gray-500">Inscrito em</label>
                  <p className="text-gray-900">
                    {new Date(candidato.created_at).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                {candidato.updated_at && (
                  <div>
                    <label className="font-medium text-gray-500">Última atualização</label>
                    <p className="text-gray-900">
                      {new Date(candidato.updated_at).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}