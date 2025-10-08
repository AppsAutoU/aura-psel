'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAvaliadorAuth } from '@/hooks/useAvaliadorAuth'
import { AvaliadorLayout } from '@/components/avaliador/AvaliadorLayout'

export default function ConfiguracoesPage() {
  const router = useRouter()
  const { user, loading } = useAvaliadorAuth()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/avaliador/auth/login')
    }
  }, [loading, user, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Carregando...</h1>
          <p className="text-sm text-gray-500 mt-2">Verificando autenticação...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <AvaliadorLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-heading-1 text-gradient-cosmic mb-2">Configurações</h1>
          <p className="text-body text-neutral-600">
            Informações e configurações do Portal Avaliador
          </p>
        </div>

        <div className="grid gap-6">
          {/* Informações do Perfil */}
          <div className="bg-white border border-neutral-200 p-6 shadow-sm rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Meu Perfil</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-1">Nome</h4>
                  <p className="text-sm text-gray-900">{user.nome}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-1">Email</h4>
                  <p className="text-sm text-gray-900">{user.email}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-1">Tipo de Usuário</h4>
                  <p className="text-sm text-gray-900">Avaliador</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-1">Status</h4>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-sm text-gray-900">Ativo</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Minhas Responsabilidades */}
          <div className="bg-white border border-neutral-200 p-6 shadow-sm rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Minhas Responsabilidades</h2>
            <div className="space-y-3">
              <div className="flex items-start">
                <div className="w-2 h-2 bg-violet-500 rounded-full mr-3 mt-2"></div>
                <div>
                  <h4 className="font-semibold text-sm">Avaliação de Cases Práticos</h4>
                  <p className="text-sm text-gray-600">Avaliar entregas de cases práticos dos candidatos aprovados pela IA</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-violet-500 rounded-full mr-3 mt-2"></div>
                <div>
                  <h4 className="font-semibold text-sm">Entrevistas Técnicas</h4>
                  <p className="text-sm text-gray-600">Conduzir e avaliar entrevistas técnicas com candidatos aprovados no case</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-violet-500 rounded-full mr-3 mt-2"></div>
                <div>
                  <h4 className="font-semibold text-sm">Feedback aos Candidatos</h4>
                  <p className="text-sm text-gray-600">Fornecer feedback construtivo sobre avaliações e entrevistas</p>
                </div>
              </div>
            </div>
          </div>

          {/* Processo de Avaliação */}
          <div className="bg-white border border-neutral-200 p-6 shadow-sm rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Fluxo de Avaliação</h2>
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-sm mb-2 text-blue-900">1. Cases Práticos</h4>
                <p className="text-sm text-blue-800">
                  Candidatos aprovados pela IA (score ≥ 7/10) recebem um case prático para resolver.
                  Após envio, você avalia a entrega e aprova/reprova para a próxima fase.
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-sm mb-2 text-green-900">2. Entrevista Técnica</h4>
                <p className="text-sm text-green-800">
                  Candidatos aprovados no case avançam para entrevista técnica.
                  Após a entrevista, você decide se o candidato vai para a entrevista com sócios.
                </p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-semibold text-sm mb-2 text-purple-900">3. Resultado Final</h4>
                <p className="text-sm text-purple-800">
                  Candidatos aprovados na entrevista técnica avançam para entrevista com sócios,
                  que tomam a decisão final de contratação.
                </p>
              </div>
            </div>
          </div>

          {/* Critérios de Avaliação */}
          <div className="bg-white border border-neutral-200 p-6 shadow-sm rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Critérios de Avaliação</h2>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Cases Práticos</h4>
                <ul className="text-sm text-gray-600 space-y-1 ml-4 list-disc">
                  <li>Qualidade técnica da solução</li>
                  <li>Criatividade e abordagem do problema</li>
                  <li>Documentação e clareza na apresentação</li>
                  <li>Atendimento aos requisitos especificados</li>
                  <li>Código limpo e boas práticas (para dev)</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Entrevistas Técnicas</h4>
                <ul className="text-sm text-gray-600 space-y-1 ml-4 list-disc">
                  <li>Conhecimento técnico específico da vaga</li>
                  <li>Capacidade de resolver problemas</li>
                  <li>Comunicação e clareza na explicação</li>
                  <li>Fit cultural com o time</li>
                  <li>Potencial de crescimento</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Dicas e Boas Práticas */}
          <div className="bg-white border border-neutral-200 p-6 shadow-sm rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Dicas e Boas Práticas</h2>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-start">
                <span className="text-lg mr-2">💡</span>
                <p><strong>Seja consistente:</strong> Use os mesmos critérios para todos os candidatos</p>
              </div>
              <div className="flex items-start">
                <span className="text-lg mr-2">📝</span>
                <p><strong>Documente:</strong> Anote suas observações durante as avaliações</p>
              </div>
              <div className="flex items-start">
                <span className="text-lg mr-2">🤝</span>
                <p><strong>Seja empático:</strong> Lembre-se que candidatos estão nervosos</p>
              </div>
              <div className="flex items-start">
                <span className="text-lg mr-2">⚡</span>
                <p><strong>Seja ágil:</strong> Tente avaliar cases em até 48h após o envio</p>
              </div>
              <div className="flex items-start">
                <span className="text-lg mr-2">✅</span>
                <p><strong>Dê feedback:</strong> Sempre forneça um retorno construtivo</p>
              </div>
            </div>
          </div>

          {/* Informações do Sistema */}
          <div className="bg-white border border-neutral-200 p-6 shadow-sm rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Informações do Sistema</h2>
            <div className="space-y-2 text-sm text-gray-600">
              <p><strong>Versão:</strong> 1.0.0</p>
              <p><strong>Sistema:</strong> AutoU - Portal de Processos Seletivos</p>
              <p><strong>Suporte:</strong> lucas@autou.com.br</p>
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 text-sm">
                  ✅ Sistema funcionando normalmente
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AvaliadorLayout>
  )
}
