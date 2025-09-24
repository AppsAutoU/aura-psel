'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
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
  ArrowLeft,
  CheckCircle,
  Target,
  Gift
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
}

export default function VagaDetailPage() {
  const params = useParams()
  const vaga_key = params.vaga_key as string
  
  const [vaga, setVaga] = useState<Vaga | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Mock user for layout
  const user = {
    name: "Maria Silva",
    email: "maria.silva@email.com"
  }

  useEffect(() => {
    if (vaga_key) {
      loadVaga()
    }
  }, [vaga_key])

  const loadVaga = async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('aura_jobs_vagas')
      .select('*')
      .eq('vaga_key', vaga_key)
      .eq('ativa', true)
      .single()

    if (error || !data) {
      setError('Vaga não encontrada ou não está mais disponível')
      setLoading(false)
      return
    }

    setVaga(data)
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

  if (loading) {
    return (
      <PortalLayout user={user}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <div className="w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin mx-auto"></div>
            <h1 className="text-heading-2">Carregando vaga...</h1>
            <p className="text-body-small text-neutral-600">Obtendo detalhes da oportunidade</p>
          </div>
        </div>
      </PortalLayout>
    )
  }

  if (error || !vaga) {
    return (
      <PortalLayout user={user}>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/candidato/vagas">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar para vagas
              </Link>
            </Button>
          </div>
          
          <Card variant="clean" className="max-w-2xl mx-auto">
            <CardContent className="text-center p-8">
              <Building2 className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
              <h1 className="text-heading-2 mb-4">Vaga não encontrada</h1>
              <p className="text-body text-neutral-600 mb-6">{error}</p>
              <Button variant="primary" asChild>
                <Link href="/candidato/vagas">Ver outras vagas</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </PortalLayout>
    )
  }

  return (
    <PortalLayout user={user}>
      <div className="space-y-8">
        {/* Navigation */}
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/candidato/vagas">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para vagas
            </Link>
          </Button>
        </div>

        {/* Header */}
        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-3">
                <h1 className="text-display">{vaga.titulo}</h1>
                <Badge variant={getLevelBadge(vaga.nivel_experiencia)} className="text-sm">
                  {vaga.nivel_experiencia}
                </Badge>
              </div>
              <p className="text-body-large text-neutral-600">
                Uma oportunidade única para fazer parte do time AutoU
              </p>
            </div>
            
            <Button variant="primary" size="lg" asChild>
              <Link href={`/candidato/vagas/${vaga.vaga_key}/inscrever`}>
                Candidatar-se agora
              </Link>
            </Button>
          </div>

          {/* Quick Info */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card variant="clean">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-neutral-400" />
                  <div>
                    <p className="text-xs text-neutral-500">Localização</p>
                    <p className="text-body-small font-medium">{vaga.localizacao}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card variant="clean">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-neutral-400" />
                  <div>
                    <p className="text-xs text-neutral-500">Contrato</p>
                    <Badge variant={getContractTypeBadge(vaga.tipo_contrato)} className="text-xs">
                      {vaga.tipo_contrato}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card variant="clean">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-neutral-400" />
                  <div>
                    <p className="text-xs text-neutral-500">Salário</p>
                    <p className="text-body-small font-medium">
                      {formatSalary(vaga.salario_min, vaga.salario_max)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card variant="clean">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-neutral-400" />
                  <div>
                    <p className="text-xs text-neutral-500">Publicada</p>
                    <p className="text-body-small font-medium">
                      {new Date(vaga.data_publicacao).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-8">
          {/* Description */}
          <Card variant="clean">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Sobre a Vaga
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-neutral max-w-none">
                <p className="text-body whitespace-pre-line">{vaga.descricao}</p>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Requirements */}
            <Card variant="clean">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Requisitos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {vaga.requisitos.map((requisito, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                      <span className="text-body-small">{requisito}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Benefits */}
            <Card variant="clean">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="h-5 w-5" />
                  Benefícios
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {vaga.beneficios.map((beneficio, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-violet-600 mt-1 flex-shrink-0" />
                      <span className="text-body-small">{beneficio}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* CTA Section */}
          <Card variant="cosmic">
            <CardContent className="p-8">
              <div className="text-center space-y-4">
                <h3 className="text-heading-2">Pronto para se candidatar?</h3>
                <p className="text-body text-neutral-600">
                  Processo seletivo 100% digital com 4 etapas simples
                </p>
                
                <div className="flex justify-center">
                  <Button variant="primary" size="lg" asChild>
                    <Link href={`/candidato/vagas/${vaga.vaga_key}/inscrever`}>
                      Candidatar-se agora
                    </Link>
                  </Button>
                </div>
                
                <div className="grid grid-cols-4 gap-4 pt-6">
                  <div className="text-center">
                    <div className="w-8 h-8 bg-gradient-cosmic text-white rounded-full flex items-center justify-center text-sm font-semibold mx-auto mb-1">
                      1
                    </div>
                    <p className="text-xs text-neutral-600">Formulário</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-8 h-8 bg-neutral-200 text-neutral-600 rounded-full flex items-center justify-center text-sm font-semibold mx-auto mb-1">
                      2
                    </div>
                    <p className="text-xs text-neutral-600">Análise IA</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-8 h-8 bg-neutral-200 text-neutral-600 rounded-full flex items-center justify-center text-sm font-semibold mx-auto mb-1">
                      3
                    </div>
                    <p className="text-xs text-neutral-600">Case Prático</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-8 h-8 bg-neutral-200 text-neutral-600 rounded-full flex items-center justify-center text-sm font-semibold mx-auto mb-1">
                      4
                    </div>
                    <p className="text-xs text-neutral-600">Entrevistas</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PortalLayout>
  )
}