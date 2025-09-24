'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAdminAuth } from '@/hooks/useAdminAuth'
import { useToast } from '@/components/ui/toast'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { LoadingPage } from '@/components/ui/loading'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

function AdminDashboardContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const welcome = searchParams.get('welcome')
  const { user, loading: authLoading, logout, isAdmin } = useAdminAuth()
  const { addToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalVagas: 0,
    vagasAbertas: 0,
    totalCandidatos: 0,
    candidatosEmAvaliacao: 0,
    candidatosAprovados: 0,
    candidatosNovos: 0,
    taxaAprovacao: 0,
    totalUsuarios: 0,
    usuariosAtivos: 0,
  })

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/admin/auth/login')
    } else if (!authLoading && user) {
      loadStats()
      if (welcome) {
        addToast({
          type: 'success',
          title: 'Bem-vindo!',
          message: 'Login realizado com sucesso. Bem-vindo ao Portal AutoU!',
          duration: 6000
        })
      }
    }
  }, [authLoading, user, welcome, addToast, router])

  const loadStats = async () => {
    const supabase = createClient()
    
    try {
      // Carregar estatísticas das vagas
      const { data: vagas, error: vagasError } = await supabase
        .from('aura_jobs_vagas')
        .select('ativa')

      // Carregar estatísticas dos candidatos
      const { data: candidatos, error: candidatosError } = await supabase
        .from('aura_jobs_candidatos')
        .select('status, data_inscricao')

      // Carregar estatísticas dos usuários
      const { data: usuarios, error: usuariosError } = await supabase
        .from('aura_jobs_usuarios')
        .select('ativo')

      const vagasAbertas = vagas?.filter(v => v.ativa).length || 0
      const candidatosEmAvaliacao = candidatos?.filter(c => 
        ['em_avaliacao_ia', 'em_avaliacao_case'].includes(c.status)
      ).length || 0
      const candidatosAprovados = candidatos?.filter(c => 
        c.status === 'aprovado' || c.status === 'contratado'
      ).length || 0
      
      // Candidatos novos (últimos 7 dias)
      const seteDiasAtras = new Date()
      seteDiasAtras.setDate(seteDiasAtras.getDate() - 7)
      const candidatosNovos = candidatos?.filter(c => 
        new Date(c.data_inscricao) >= seteDiasAtras
      ).length || 0
      
      // Taxa de aprovação
      const totalCandidatos = candidatos?.length || 0
      const taxaAprovacao = totalCandidatos > 0 ? Math.round((candidatosAprovados / totalCandidatos) * 100) : 0

      setStats({
        totalVagas: vagas?.length || 0,
        vagasAbertas,
        totalCandidatos,
        candidatosEmAvaliacao,
        candidatosAprovados,
        candidatosNovos,
        taxaAprovacao,
        totalUsuarios: usuarios?.length || 0,
        usuariosAtivos: usuarios?.filter(u => u.ativo).length || 0,
      })
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
      addToast({
        type: 'error',
        title: 'Erro',
        message: 'Erro ao carregar estatísticas do dashboard'
      })
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || loading) {
    return (
      <LoadingPage 
        text={authLoading ? 'Verificando autenticação...' : 'Carregando dashboard...'}
      />
    )
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-red-600">Acesso Negado</h1>
          <p className="text-gray-600">Você não tem permissão de administrador.</p>
          <Button onClick={() => router.push('/admin/auth/login')} variant="primary">
            Fazer Login
          </Button>
        </div>
      </div>
    )
  }

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        {/* Hero Section */}
        <div className="bg-white rounded-xl border border-gray-200/60 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 mb-1">
                Bem-vindo de volta! 👋
              </h1>
              <p className="text-gray-600">
                Aqui está um resumo do que está acontecendo na sua plataforma hoje.
              </p>
            </div>
            <div className="hidden lg:flex items-center space-x-6">
              <div className="text-center">
                <div className="text-sm text-gray-500">Uptime</div>
                <div className="text-lg font-semibold text-green-600">99.9%</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-500">Versão</div>
                <div className="text-lg font-semibold text-gray-900">v1.0</div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Vagas Ativas"
            value={stats.vagasAbertas}
            total={stats.totalVagas}
            icon="💼"
            trend={stats.vagasAbertas > 0 ? 'up' : 'neutral'}
            color="blue"
          />
          <MetricCard
            title="Total Candidatos"
            value={stats.totalCandidatos}
            subtitle={`${stats.candidatosNovos} novos esta semana`}
            icon="👥"
            trend={stats.candidatosNovos > 0 ? 'up' : 'neutral'}
            color="purple"
          />
          <MetricCard
            title="Em Avaliação"
            value={stats.candidatosEmAvaliacao}
            subtitle="Aguardando análise"
            icon="⏳"
            trend="neutral"
            color="orange"
          />
          <MetricCard
            title="Taxa de Sucesso"
            value={`${stats.taxaAprovacao}%`}
            subtitle={`${stats.candidatosAprovados} aprovados`}
            icon="✅"
            trend={stats.taxaAprovacao >= 50 ? 'up' : 'down'}
            color="green"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <QuickAction
            title="Gerenciar Vagas"
            description="Criar e editar vagas abertas"
            href="/admin/vagas"
            icon="💼"
            count={stats.totalVagas}
            countLabel="vagas"
          />
          <QuickAction
            title="Ver Candidatos"
            description="Acompanhar candidaturas"
            href="/admin/candidatos"
            icon="👥"
            count={stats.totalCandidatos}
            countLabel="candidatos"
          />
          <QuickAction
            title="Gerenciar Usuários"
            description="Administrar permissões"
            href="/admin/usuarios"
            icon="👤"
            count={stats.usuariosAtivos}
            countLabel="ativos"
          />
        </div>

        {/* Activity Summary */}
        <div className="bg-white rounded-xl border border-gray-200/60 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumo de Atividades</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{stats.vagasAbertas}</div>
              <div className="text-sm text-gray-600">Vagas abertas</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{stats.candidatosNovos}</div>
              <div className="text-sm text-gray-600">Novos esta semana</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{stats.usuariosAtivos}</div>
              <div className="text-sm text-gray-600">Usuários ativos</div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

export default function AdminDashboard() {
  return (
    <Suspense fallback={<LoadingPage />}>
      <AdminDashboardContent />
    </Suspense>
  )
}

function MetricCard({ 
  title, 
  value, 
  total,
  subtitle, 
  icon,
  trend,
  color
}: { 
  title: string
  value: string | number
  total?: number
  subtitle?: string
  icon: string
  trend: 'up' | 'down' | 'neutral'
  color: 'blue' | 'purple' | 'orange' | 'green'
}) {
  const colorClasses = {
    blue: 'text-blue-600',
    purple: 'text-purple-600',
    orange: 'text-orange-600',
    green: 'text-green-600'
  }

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <span className="text-green-500 text-sm">↗</span>
      case 'down':
        return <span className="text-red-500 text-sm">↘</span>
      default:
        return null
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200/60 p-4 hover:shadow-sm transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <span className="text-2xl">{icon}</span>
        {getTrendIcon()}
      </div>
      
      <div className="mb-1">
        <div className="flex items-baseline space-x-1">
          <span className={cn("text-2xl font-bold", colorClasses[color])}>
            {value}
          </span>
          {total && (
            <span className="text-lg text-gray-400">/{total}</span>
          )}
        </div>
      </div>
      
      <div className="text-sm text-gray-600 font-medium mb-1">{title}</div>
      {subtitle && (
        <div className="text-xs text-gray-500">{subtitle}</div>
      )}
    </div>
  )
}

function QuickAction({ 
  title, 
  description, 
  href, 
  icon,
  count,
  countLabel
}: { 
  title: string
  description: string
  href: string
  icon: string
  count: number
  countLabel: string
}) {
  return (
    <a
      href={href}
      className="block bg-white rounded-xl border border-gray-200/60 p-4 hover:shadow-sm hover:border-gray-300/60 transition-all group"
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-2xl">{icon}</span>
        <span className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-full">
          {count} {countLabel}
        </span>
      </div>
      
      <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
        {title}
      </h3>
      <p className="text-sm text-gray-600">
        {description}
      </p>
      
      <div className="mt-3 flex items-center text-sm text-blue-600 group-hover:translate-x-1 transition-transform">
        <span>Acessar</span>
        <span className="ml-1">→</span>
      </div>
    </a>
  )
}