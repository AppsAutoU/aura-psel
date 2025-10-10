'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'

interface Vaga {
  id: string
  titulo: string
  descricao?: string
  vaga_key: string
  case_link_notion?: string
  prazo_case_dias?: number
}

export default function EntregarCasePorVagaPage() {
  const params = useParams()
  const router = useRouter()
  const vagaKey = params.vaga_key as string

  const [vaga, setVaga] = useState<Vaga | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    email: '',
    url_entregavel_1: '',
    url_entregavel_2: '',
    url_video: '',
    comentarios_adicionais: ''
  })

  useEffect(() => {
    loadVaga()
  }, [vagaKey])

  const loadVaga = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('aura_jobs_vagas')
        .select('id, titulo, descricao, vaga_key, case_link_notion, prazo_case_dias')
        .eq('vaga_key', vagaKey)
        .single()

      if (error) throw error

      if (!data) {
        setError('Vaga não encontrada')
        return
      }

      setVaga(data)
    } catch (err: any) {
      console.error('Erro ao carregar vaga:', err)
      setError('Erro ao carregar informações da vaga')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.email) {
      setError('Email é obrigatório')
      return
    }

    if (!formData.url_entregavel_1 && !formData.url_entregavel_2 && !formData.url_video) {
      setError('Você precisa enviar pelo menos um entregável (link ou vídeo)')
      return
    }

    setSubmitting(true)
    setError(null)

    console.log('📤 Enviando case:', {
      vagaKey,
      formData
    })

    try {
      const url = `/api/case/entregar/${vagaKey}`
      console.log('   URL:', url)

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      console.log('   Status:', response.status)

      const data = await response.json()
      console.log('   Resposta:', data)

      if (!response.ok) {
        console.error('❌ Erro na API:', data)
        throw new Error(data.error || data.details || 'Erro ao enviar case')
      }

      console.log('✅ Case enviado com sucesso!')
      setSuccess(true)
      setFormData({
        email: '',
        url_entregavel_1: '',
        url_entregavel_2: '',
        url_video: '',
        comentarios_adicionais: ''
      })
    } catch (err: any) {
      setError(err.message || 'Erro ao enviar case')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 to-indigo-100 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  if (error && !vaga) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 to-indigo-100 flex items-center justify-center p-6">
        <Card className="max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Vaga não encontrada</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => router.push('/')}>
            Voltar para Início
          </Button>
        </Card>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 to-indigo-100 flex items-center justify-center p-6">
        <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-8 text-center space-y-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="text-3xl font-bold text-gray-900">
            Case Enviado com Sucesso! 🎉
          </h1>

          <p className="text-lg text-gray-600">
            Seu case para a vaga <strong>{vaga?.titulo}</strong> foi entregue com sucesso!
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              Nossa equipe de avaliadores irá analisar seu trabalho em breve.
              Você receberá um email com o feedback.
            </p>
          </div>

          <Button onClick={() => router.push('/')} className="mt-6">
            Voltar para Início
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 to-indigo-100 py-12 px-6">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Entrega de Case Prático
          </h1>
          <p className="text-lg text-gray-600">
            Vaga: <span className="font-semibold text-violet-600">{vaga?.titulo}</span>
          </p>

          {vaga?.case_link_notion && (
            <div className="mt-4 p-4 bg-violet-50 border border-violet-200 rounded-lg">
              <p className="text-sm text-violet-800 mb-2">
                📖 <strong>Enunciado do Case:</strong>
              </p>
              <a
                href={vaga.case_link_notion}
                target="_blank"
                rel="noopener noreferrer"
                className="text-violet-600 hover:text-violet-800 underline font-medium"
              >
                Abrir Case no Notion →
              </a>
            </div>
          )}
        </div>

        {/* Formulário */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Email */}
            <div>
              <Label htmlFor="email" className="text-gray-700 font-medium">
                Email *
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="seu@email.com"
                required
                className="mt-2"
              />
              <p className="text-xs text-gray-500 mt-1">
                Use o mesmo email da sua inscrição
              </p>
            </div>

            {/* Entregável 1 */}
            <div>
              <Label htmlFor="url_entregavel_1" className="text-gray-700 font-medium">
                Link do Entregável 1
              </Label>
              <Input
                id="url_entregavel_1"
                type="url"
                value={formData.url_entregavel_1}
                onChange={(e) => handleInputChange('url_entregavel_1', e.target.value)}
                placeholder="https://github.com/seu-usuario/projeto ou https://figma.com/..."
                className="mt-2"
              />
              <p className="text-xs text-gray-500 mt-1">
                Ex: Link do GitHub, Figma, Drive, etc.
              </p>
            </div>

            {/* Entregável 2 */}
            <div>
              <Label htmlFor="url_entregavel_2" className="text-gray-700 font-medium">
                Link do Entregável 2 (opcional)
              </Label>
              <Input
                id="url_entregavel_2"
                type="url"
                value={formData.url_entregavel_2}
                onChange={(e) => handleInputChange('url_entregavel_2', e.target.value)}
                placeholder="https://..."
                className="mt-2"
              />
            </div>

            {/* Vídeo */}
            <div>
              <Label htmlFor="url_video" className="text-gray-700 font-medium">
                Link do Vídeo de Apresentação (opcional)
              </Label>
              <Input
                id="url_video"
                type="url"
                value={formData.url_video}
                onChange={(e) => handleInputChange('url_video', e.target.value)}
                placeholder="https://youtube.com/... ou https://loom.com/..."
                className="mt-2"
              />
              <p className="text-xs text-gray-500 mt-1">
                Ex: YouTube, Loom, Vimeo, etc.
              </p>
            </div>

            {/* Comentários */}
            <div>
              <Label htmlFor="comentarios_adicionais" className="text-gray-700 font-medium">
                Comentários Adicionais (opcional)
              </Label>
              <textarea
                id="comentarios_adicionais"
                value={formData.comentarios_adicionais}
                onChange={(e) => handleInputChange('comentarios_adicionais', e.target.value)}
                placeholder="Descreva brevemente sua solução, desafios enfrentados, decisões tomadas, etc."
                rows={4}
                className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>

            {/* Erro */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {/* Submit */}
            <Button
              type="submit"
              disabled={submitting}
              className="w-full bg-violet-600 hover:bg-violet-700 text-white font-medium py-3 text-lg"
            >
              {submitting ? 'Enviando...' : 'Enviar Case 🚀'}
            </Button>

          </form>
        </div>

        {/* Footer Info */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>
            Prazo de entrega: {vaga?.prazo_case_dias ? `D+${vaga.prazo_case_dias}` : 'Consulte o email'}
          </p>
          <p className="mt-2">
            Dúvidas? Entre em contato: <a href="mailto:contato@autou.com.br" className="text-violet-600 hover:underline">contato@autou.com.br</a>
          </p>
        </div>

      </div>
    </div>
  )
}
