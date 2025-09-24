'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function InscricaoSucessoPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const vagaTitulo = searchParams.get('vaga')

  useEffect(() => {
    // Limpar o formulário do histórico do navegador
    window.history.replaceState(null, '', '/candidato/inscricao/sucesso')
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Inscrição Enviada com Sucesso!
        </h1>

        <p className="text-gray-600 mb-4">
          Sua inscrição para a vaga{' '}
          {vagaTitulo && (
            <span className="font-semibold text-gray-900">
              "{vagaTitulo}"
            </span>
          )}{' '}
          foi recebida.
        </p>

        <p className="text-sm text-gray-500 mb-6">
          Você receberá um e-mail de confirmação em breve. 
          Nossa equipe entrará em contato caso seu perfil seja selecionado para as próximas etapas.
        </p>

        <div className="space-y-3">
          <Link
            href="/"
            className="block w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Voltar ao Início
          </Link>
        </div>

        <p className="text-xs text-gray-400 mt-6">
          ID da inscrição: {searchParams.get('id')}
        </p>
      </div>
    </div>
  )
}