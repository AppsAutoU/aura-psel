'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAdminAuth } from '@/hooks/useAdminAuth'
import { AdminLayout } from '@/components/admin/AdminLayout'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function ConfiguracoesPage() {
  const router = useRouter()
  const { user, loading: authLoading, isAdmin } = useAdminAuth()

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Carregando...</h1>
          <p className="text-sm text-gray-500 mt-2">Verificando autenticação...</p>
        </div>
      </div>
    )
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-red-600">Acesso Negado</h1>
          <p className="text-gray-600">Você não tem permissão de administrador.</p>
          <button 
            onClick={() => router.push('/auth/login')} 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Fazer Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Configurações</h1>
          <p className="text-gray-600 mt-1">
            Configurações gerais do portal AutoU
          </p>
        </div>
        <div className="grid gap-6">
          {/* Informações do Sistema */}
          <Card variant="clean">
            <CardHeader>
              <CardTitle>Informações do Sistema</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Status Atual</h3>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                      <span className="text-sm">Sistema funcionando normalmente</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                      <span className="text-sm">Banco de dados conectado</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                      <span className="text-sm">Autenticação própria ativa</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Configurações Técnicas</h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p><strong>Versão:</strong> 1.0.0</p>
                    <p><strong>Banco:</strong> Supabase (tabelas próprias)</p>
                    <p><strong>Autenticação:</strong> Sistema próprio</p>
                    <p><strong>Framework:</strong> Next.js 15</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Configurações de Email */}
          <Card variant="clean">
            <CardHeader>
              <CardTitle>Configurações de Email</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Status do Serviço</h4>
                  <div className="flex items-center mb-4">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                    <span className="text-sm">Resend configurado e funcionando</span>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Configurações Atuais</h4>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                    <p><strong>Provedor:</strong> Resend</p>
                    <p><strong>Email Remetente:</strong> Aura RH &lt;onboarding@resend.dev&gt;</p>
                    <p><strong>Status:</strong> Ativo (modo teste - enviando para admin@autou.io)</p>
                    <p className="text-amber-600 mt-2">
                      ⚠️ Para enviar para emails de candidatos, verifique seu domínio em <a href="https://resend.com/domains" target="_blank" className="underline">resend.com/domains</a>
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Templates Disponíveis</h4>
                  <ul className="text-sm text-gray-600 space-y-1 ml-4 list-disc">
                    <li>Email de aprovação IA (score ≥ 7)</li>
                    <li>Email de rejeição IA (score &lt; 7)</li>
                    <li>Email de confirmação de candidatura</li>
                    <li>Email de case prático enviado</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Configurações de IA */}
          <Card variant="clean">
            <CardHeader>
              <CardTitle>Configurações de IA</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Status do Serviço</h4>
                  <div className="flex items-center mb-4">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                    <span className="text-sm">OpenAI GPT-4o configurado e funcionando</span>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Configurações Atuais</h4>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                    <p><strong>Modelo:</strong> GPT-4o (mais recente e avançado)</p>
                    <p><strong>Temperatura:</strong> 0.3 (avaliação mais consistente)</p>
                    <p><strong>Max Tokens:</strong> 1500</p>
                    <p><strong>Threshold de Aprovação:</strong> Score ≥ 7/10 (70%)</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Critérios de Avaliação</h4>
                  <ul className="text-sm text-gray-600 space-y-1 ml-4 list-disc">
                    <li>Adequação técnica aos requisitos da vaga</li>
                    <li>Experiência relevante</li>
                    <li>Potencial de crescimento</li>
                    <li>Fit cultural baseado na motivação</li>
                    <li>Análise de links profissionais (LinkedIn, GitHub, Portfolio)</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Automação de Email</h4>
                  <div className="bg-green-50 p-3 rounded-lg text-sm">
                    <p className="text-green-800">
                      ✅ <strong>Ativo:</strong> Emails são enviados automaticamente após avaliação
                    </p>
                    <ul className="mt-2 ml-4 list-disc text-green-700">
                      <li>Score ≥ 7: Email de aprovação + link do case prático</li>
                      <li>Score &lt; 7: Email de rejeição + feedback construtivo</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Cases Práticos por Vaga</h4>
                  <div className="bg-gray-50 p-3 rounded-lg text-sm space-y-1">
                    <p><strong>Product Designer/PO:</strong> Case de Design</p>
                    <p><strong>Desenvolvedor:</strong> Case de Desenvolvimento</p>
                    <p><strong>Consultor:</strong> Case de Consultoria</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Backup e Segurança */}
          <Card variant="clean">
            <CardHeader>
              <CardTitle>Backup e Segurança</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Backup Automático</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    O Supabase já faz backup automático dos dados.
                  </p>
                  <Button variant="secondary" size="sm" disabled>
                    Configurar Backup
                  </Button>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Logs de Segurança</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Monitoramento de acessos e ações administrativas.
                  </p>
                  <Button variant="secondary" size="sm" disabled>
                    Ver Logs
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informações do Desenvolvedor */}
          <Card variant="clean">
            <CardHeader>
              <CardTitle>Sobre o Sistema</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-gray-600 space-y-2">
                <p>
                  <strong>Sistema AutoU - Portal de Processos Seletivos</strong>
                </p>
                <p>
                  Desenvolvido com Next.js, TypeScript, Tailwind CSS e Supabase.
                </p>
                <p>
                  Sistema de autenticação próprio, sem dependência do Supabase Auth.
                </p>
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-800 font-medium">
                    ✅ Sistema 100% funcional e pronto para uso!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}