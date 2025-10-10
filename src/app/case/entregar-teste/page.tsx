'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function EntregarCaseTestePage() {
  const searchParams = useSearchParams()
  const sourceParam = searchParams.get('source')

  const [formData, setFormData] = useState({
    nome_completo: '',
    email: '',
    link_entregavel_1: '',
    link_entregavel_2: '',
    link_entregavel_3: '',
    comentarios_adicionais: ''
  })

  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.nome_completo || !formData.email) {
      setError('Nome completo e email são obrigatórios')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      let tipo_case = 'desenvolvimento'
      if (sourceParam === 'notion-design') {
        tipo_case = 'designer-po'
      } else if (sourceParam === 'notion-consultoria') {
        tipo_case = 'consultoria'
      } else if (sourceParam === 'notion-dev') {
        tipo_case = 'desenvolvimento'
      }

      const response = await fetch('/api/case/submeter-teste', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          tipo_case,
          source: sourceParam || 'teste-direto'
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao enviar case')
      }

      setSuccess(true)
      setFormData({
        nome_completo: '',
        email: '',
        link_entregavel_1: '',
        link_entregavel_2: '',
        link_entregavel_3: '',
        comentarios_adicionais: ''
      })
    } catch (err: any) {
      setError(err.message || 'Erro ao enviar case')
    } finally {
      setSubmitting(false)
    }
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
            Case de Teste Enviado!
          </h1>

          <p className="text-lg text-gray-600">
            ✅ Salvo em arquivo JSON<br />
            Agora vá no Portal Avaliador e veja se aparece!
          </p>

          <div className="pt-6">
            <Button
              onClick={() => setSuccess(false)}
              className="bg-violet-600 hover:bg-violet-700 text-white px-8 py-3"
            >
              Enviar Outro Case de Teste
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 to-indigo-100 flex items-center justify-center p-6">
      <div className="max-w-3xl w-full bg-white rounded-2xl shadow-2xl p-8 md:p-12">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block px-4 py-2 bg-yellow-100 border-2 border-yellow-400 rounded-full mb-4">
            <span className="text-yellow-800 font-bold">🧪 MODO TESTE</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Formulário de Teste
          </h1>
          <p className="text-gray-600">
            Este formulário aceita QUALQUER email (não precisa ser candidato cadastrado)
          </p>
        </div>

        {/* Instructional Text Block */}
        <div className="mb-8 bg-violet-50 border border-violet-200 rounded-lg p-6">
          <h2 className="text-base font-bold text-violet-900 mb-3">
            📝 Entrega do Desafio - AutoU (TESTE)
          </h2>

          <div className="space-y-3 text-sm text-gray-700">
            <p>
              <strong>Bem-vindo(a) à versão de TESTE!</strong>
            </p>

            <p>
              Use qualquer email para testar. Os dados serão salvos em JSON.
            </p>

            <div>
              <p className="font-semibold mb-2">📌 Após enviar:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Vá em http://localhost:3000/avaliador</li>
                <li>Procure por um candidato com status "case_enviado"</li>
                <li>Clique em "Avaliar"</li>
                <li>Veja se a entrega aparece automaticamente!</li>
              </ul>
            </div>

            <p className="text-violet-700">
              💡 <strong>Dica:</strong> Use o email de um candidato real para ver a entrega vinculada a ele.
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nome Completo */}
          <div>
            <Label htmlFor="nome_completo">
              Nome Completo <span className="text-red-500">*</span>
            </Label>
            <Input
              id="nome_completo"
              value={formData.nome_completo}
              onChange={(e) => handleInputChange('nome_completo', e.target.value)}
              placeholder="Qualquer nome para teste"
              required
              className="mt-2"
            />
          </div>

          {/* Email */}
          <div>
            <Label htmlFor="email">
              Email <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="teste@exemplo.com (pode ser qualquer um)"
              required
              className="mt-2"
            />
          </div>

          {/* Divisor */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Links dos Entregáveis
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Insira até 3 links dos seus entregáveis
            </p>
          </div>

          {/* Link Entregável 1 */}
          <div>
            <Label htmlFor="link_entregavel_1">
              Link do Entregável 1
            </Label>
            <Input
              id="link_entregavel_1"
              type="url"
              value={formData.link_entregavel_1}
              onChange={(e) => handleInputChange('link_entregavel_1', e.target.value)}
              placeholder="https://github.com/..."
              className="mt-2"
            />
          </div>

          {/* Link Entregável 2 */}
          <div>
            <Label htmlFor="link_entregavel_2">
              Link do Entregável 2
            </Label>
            <Input
              id="link_entregavel_2"
              type="url"
              value={formData.link_entregavel_2}
              onChange={(e) => handleInputChange('link_entregavel_2', e.target.value)}
              placeholder="https://docs.google.com/..."
              className="mt-2"
            />
          </div>

          {/* Link Entregável 3 */}
          <div>
            <Label htmlFor="link_entregavel_3">
              Link do Entregável 3
            </Label>
            <Input
              id="link_entregavel_3"
              type="url"
              value={formData.link_entregavel_3}
              onChange={(e) => handleInputChange('link_entregavel_3', e.target.value)}
              placeholder="https://figma.com/..."
              className="mt-2"
            />
          </div>

          {/* Comentários Adicionais */}
          <div>
            <Label htmlFor="comentarios_adicionais">
              Comentários Adicionais
            </Label>
            <textarea
              id="comentarios_adicionais"
              value={formData.comentarios_adicionais}
              onChange={(e) => handleInputChange('comentarios_adicionais', e.target.value)}
              placeholder="Este é um teste do sistema de cases práticos..."
              rows={6}
              className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-y"
            />
          </div>

          {/* Botão Submit */}
          <div className="pt-6">
            <Button
              type="submit"
              disabled={submitting}
              className="w-full bg-violet-600 hover:bg-violet-700 text-white py-3 text-lg font-semibold"
            >
              {submitting ? 'Enviando...' : '🧪 Enviar Case de Teste'}
            </Button>
          </div>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            ⚠️ Esta é uma versão de TESTE. Após testar, delete esta página.
          </p>
        </div>
      </div>
    </div>
  )
}
