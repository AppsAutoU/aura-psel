'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useCandidatoAuth } from '@/hooks/useCandidatoAuth'
import { PortalLayout } from '@/components/layout/portal-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  MapPin, 
  Clock, 
  DollarSign, 
  Users,
  Calendar,
  Building2,
  Eye,
  CheckCircle
} from 'lucide-react'
import Link from 'next/link'

interface Vaga {
  id: string
  titulo: string
  descricao: string
  requisitos: string[]
  beneficios: string[]
  salario_min?: number
  salario_max?: number
  localizacao: string
  tipo_contrato: string
  nivel_experiencia: string
  data_publicacao: string
  data_expiracao?: string
  ativa: boolean
  vaga_key: string
  ja_inscrito?: boolean
}

export default function VagasPage() {
  const router = useRouter()
  const { user, loading: authLoading, logout } = useCandidatoAuth()
  const [vagas, setVagas] = useState<Vaga[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/candidato/auth/login')
    }
  }, [user, authLoading, router])

  const userData = user ? {
    name: user.nome,
    email: user.email
  } : null

  useEffect(() => {
    if (user) {
      loadVagas()
    }
  }, [user])

  const loadVagas = async () => {
    const supabase = createClient()
    
    // Buscar vagas ativas
    const { data: vagasData, error: vagasError } = await supabase
      .from('aura_jobs_vagas')
      .select('*')
      .eq('ativa', true)
      .order('data_publicacao', { ascending: false })

    if (vagasError) {
      setError('Erro ao carregar vagas')
      setLoading(false)
      return
    }

    // Se usuário estiver logado, verificar candidaturas
    let vagasComStatus = vagasData || []
    
    if (user?.email) {
      // Buscar candidaturas do usuário
      const { data: candidaturas } = await supabase
        .from('aura_jobs_candidatos')
        .select('vaga_id')
        .eq('email', user.email)

      if (candidaturas && candidaturas.length > 0) {
        const vagasCandidatadasIds = candidaturas.map(c => c.vaga_id)
        
        // Marcar vagas já candidatadas
        vagasComStatus = vagasData?.map(vaga => ({
          ...vaga,
          ja_inscrito: vagasCandidatadasIds.includes(vaga.id)
        })) || []
      }
    }

    setVagas(vagasComStatus)
    setLoading(false)
  }

  const formatSalary = (min?: number, max?: number) => {
    if (!min && !max) return 'A combinar'
    if (min && max) return `R$ ${min.toLocaleString()} - R$ ${max.toLocaleString()}`
    if (min) return `A partir de R$ ${min.toLocaleString()}`
    return 'A combinar'
  }

  const getContractTypeBadge = (tipo: string) => {
    const variants: Record<string, any> = {
      'CLT': 'success',
      'PJ': 'info',
      'Estágio': 'warning',
      'Freelance': 'outline'
    }
    return variants[tipo] || 'default'
  }

  const getLevelBadge = (nivel: string) => {
    const variants: Record<string, any> = {
      'Júnior': 'success',
      'Pleno': 'cosmic',
      'Sênior': 'error'
    }
    return variants[nivel] || 'default'
  }

  if (authLoading || loading || !userData) {
    return (
      <PortalLayout user={userData} onLogout={logout}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <div className="w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin mx-auto"></div>
            <h1 className="text-heading-2">Carregando vagas...</h1>
            <p className="text-body-small text-neutral-600">Buscando oportunidades para você</p>
          </div>
        </div>
      </PortalLayout>
    )
  }

  if (error) {
    return (
      <PortalLayout user={userData} onLogout={logout}>
        <Card variant="clean" className="max-w-2xl mx-auto">
          <CardContent className="text-center p-8">
            <h1 className="text-heading-2 mb-4">Erro ao carregar vagas</h1>
            <p className="text-body text-red-600 mb-6">{error}</p>
            <Button variant="primary" onClick={loadVagas}>
              Tentar novamente
            </Button>
          </CardContent>
        </Card>
      </PortalLayout>
    )
  }

  return (
    <PortalLayout user={userData} onLogout={logout}>
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-display">Vagas Disponíveis</h1>
          <p className="text-body-large text-neutral-600">
            Explore as oportunidades disponíveis na AutoU e candidate-se às vagas que combinam com seu perfil.
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card variant="clean">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-body-small text-neutral-600">Vagas Ativas</p>
                  <p className="text-heading-2">{vagas.length}</p>
                </div>
                <Building2 className="h-8 w-8 text-violet-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card variant="clean">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-body-small text-neutral-600">Novas esta semana</p>
                  <p className="text-heading-2">
                    {vagas.filter(v => {
                      const weekAgo = new Date()
                      weekAgo.setDate(weekAgo.getDate() - 7)
                      return new Date(v.data_publicacao) > weekAgo
                    }).length}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card variant="clean">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-body-small text-neutral-600">Níveis disponíveis</p>
                  <p className="text-heading-2">
                    {new Set(vagas.map(v => v.nivel_experiencia)).size}
                  </p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Vagas List */}
        {vagas.length === 0 ? (
          <Card variant="clean">
            <CardContent className="text-center p-12">
              <Building2 className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
              <h3 className="text-heading-3 mb-2">Nenhuma vaga disponível</h3>
              <p className="text-body text-neutral-600">
                No momento não há vagas abertas. Acompanhe regularmente para não perder oportunidades!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {vagas.map((vaga) => (
              <Card key={vaga.id} variant="premium" className="hover-cosmic">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex justify-between items-start">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="text-heading-2">{vaga.titulo}</h3>
                          <Badge variant={getLevelBadge(vaga.nivel_experiencia)}>
                            {vaga.nivel_experiencia}
                          </Badge>
                          {vaga.ja_inscrito && (
                            <Badge variant="success" className="flex items-center gap-1">
                              <CheckCircle className="h-3 w-3" />
                              Já inscrito
                            </Badge>
                          )}
                        </div>
                        <p className="text-body text-neutral-600 line-clamp-2">
                          {vaga.descricao}
                        </p>
                      </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-neutral-400" />
                        <span className="text-body-small">{vaga.localizacao}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-neutral-400" />
                        <Badge variant={getContractTypeBadge(vaga.tipo_contrato)}>
                          {vaga.tipo_contrato}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-neutral-400" />
                        <span className="text-body-small">
                          {formatSalary(vaga.salario_min, vaga.salario_max)}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-neutral-400" />
                        <span className="text-body-small">
                          Publicada em {new Date(vaga.data_publicacao).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>

                    {/* Action */}
                    <div className="flex justify-between items-center pt-4 border-t border-neutral-200">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/candidato/vagas/${vaga.vaga_key}`}>
                          <Eye className="h-4 w-4 mr-2" />
                          Ver detalhes
                        </Link>
                      </Button>
                      
                      {vaga.ja_inscrito ? (
                        <Button variant="outline" size="sm" disabled className="cursor-not-allowed">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Já candidatado
                        </Button>
                      ) : (
                        <Button variant="primary" size="sm" asChild>
                          <Link href={`/candidato/vagas/${vaga.vaga_key}/inscrever`}>
                            Candidatar-se
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PortalLayout>
  )
}