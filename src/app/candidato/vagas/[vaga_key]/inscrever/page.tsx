'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { PortalLayout } from '@/components/layout/portal-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  ArrowLeft,
  Upload,
  User,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Briefcase,
  FileText,
  Link as LinkIcon,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import Link from 'next/link'

interface Vaga {
  id: string
  titulo: string
  vaga_key: string
}

interface FormData {
  nome_completo: string
  email: string
  telefone: string
  data_nascimento: string
  cidade: string
  estado: string
  pais: string
  
  // Educação
  nivel_escolaridade: string
  curso: string
  instituicao: string
  ano_conclusao: string
  
  // Experiência
  experiencia_anos: string
  cargo_atual: string
  empresa_atual: string
  salario_pretendido: string
  
  // Skills e Links
  principais_skills: string
  linkedin: string
  github: string
  portfolio: string
  
  // Motivação
  motivacao: string
  disponibilidade: string
  
  // Arquivos
  curriculo: File | null
  carta_apresentacao: File | null
}

export default function InscricaoPage() {
  const params = useParams()
  const router = useRouter()
  const vaga_key = params.vaga_key as string
  
  const [vaga, setVaga] = useState<Vaga | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState<FormData>({
    nome_completo: '',
    email: '',
    telefone: '',
    data_nascimento: '',
    cidade: '',
    estado: '',
    pais: 'Brasil',
    
    nivel_escolaridade: '',
    curso: '',
    instituicao: '',
    ano_conclusao: '',
    
    experiencia_anos: '',
    cargo_atual: '',
    empresa_atual: '',
    salario_pretendido: '',
    
    principais_skills: '',
    linkedin: '',
    github: '',
    portfolio: '',
    
    motivacao: '',
    disponibilidade: '',
    
    curriculo: null,
    carta_apresentacao: null
  })

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
      .select('id, titulo, vaga_key')
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

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleFileChange = (field: 'curriculo' | 'carta_apresentacao', file: File | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: file
    }))
  }

  const validateForm = () => {
    const required = [
      'nome_completo', 'email', 'telefone', 'data_nascimento', 'cidade', 'estado',
      'nivel_escolaridade', 'experiencia_anos', 'principais_skills', 'motivacao', 'disponibilidade'
    ]
    
    for (const field of required) {
      if (!formData[field as keyof FormData]) {
        setError(`Campo obrigatório: ${field.replace('_', ' ')}`)
        return false
      }
    }
    
    if (!formData.curriculo) {
      setError('Currículo é obrigatório')
      return false
    }
    
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    if (!vaga) return
    
    setSubmitting(true)
    setError(null)
    
    try {
      const supabase = createClient()
      
      // Upload files to storage
      let curriculo_url = ''
      let carta_url = ''
      
      if (formData.curriculo) {
        const fileName = `candidatos/${Date.now()}_curriculo_${formData.curriculo.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('candidatos')
          .upload(fileName, formData.curriculo, {
            cacheControl: '3600',
            upsert: false
          })
          
        if (uploadError) {
          console.error('Erro no upload do currículo:', uploadError)
          throw new Error(`Erro ao fazer upload do currículo: ${uploadError.message}`)
        }
        curriculo_url = uploadData.path
      }
      
      if (formData.carta_apresentacao) {
        const fileName = `candidatos/${Date.now()}_carta_${formData.carta_apresentacao.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('candidatos')
          .upload(fileName, formData.carta_apresentacao, {
            cacheControl: '3600',
            upsert: false
          })
          
        if (uploadError) {
          console.error('Erro no upload da carta:', uploadError)
          throw new Error(`Erro ao fazer upload da carta de apresentação: ${uploadError.message}`)
        }
        carta_url = uploadData.path
      }
      
      // Insert candidate data
      const candidatoData = {
        vaga_id: vaga.id,
        nome_completo: formData.nome_completo,
        email: formData.email,
        telefone: formData.telefone,
        data_nascimento: formData.data_nascimento,
        cidade: formData.cidade,
        estado: formData.estado,
        pais: formData.pais,
        
        nivel_escolaridade: formData.nivel_escolaridade,
        curso: formData.curso,
        instituicao: formData.instituicao,
        ano_conclusao: formData.ano_conclusao ? parseInt(formData.ano_conclusao) : null,
        
        experiencia_anos: parseInt(formData.experiencia_anos),
        cargo_atual: formData.cargo_atual,
        empresa_atual: formData.empresa_atual,
        salario_pretendido: formData.salario_pretendido ? parseFloat(formData.salario_pretendido) : null,
        
        principais_skills: formData.principais_skills,
        linkedin: formData.linkedin,
        github: formData.github,
        portfolio: formData.portfolio,
        
        motivacao: formData.motivacao,
        disponibilidade: formData.disponibilidade,
        
        curriculo_url,
        carta_apresentacao_url: carta_url,
        
        status: 'inscrito',
        fase_atual: 'inscricao',
        data_inscricao: new Date().toISOString()
      }
      
      const { error: insertError } = await supabase
        .from('aura_jobs_candidatos')
        .insert([candidatoData])
      
      if (insertError) throw insertError
      
      setSuccess(true)
      
    } catch (err: any) {
      setError(err.message || 'Erro ao enviar candidatura')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <PortalLayout user={user}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <div className="w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin mx-auto"></div>
            <h1 className="text-heading-2">Carregando formulário...</h1>
          </div>
        </div>
      </PortalLayout>
    )
  }

  if (error && !vaga) {
    return (
      <PortalLayout user={user}>
        <div className="space-y-6">
          <Button variant="outline" size="sm" asChild>
            <Link href="/candidato/vagas">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para vagas
            </Link>
          </Button>
          
          <Card variant="clean" className="max-w-2xl mx-auto">
            <CardContent className="text-center p-8">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h1 className="text-heading-2 mb-4">Erro</h1>
              <p className="text-body text-red-600">{error}</p>
            </CardContent>
          </Card>
        </div>
      </PortalLayout>
    )
  }

  if (success) {
    return (
      <PortalLayout user={user}>
        <div className="space-y-6">
          <Card variant="cosmic" className="max-w-2xl mx-auto">
            <CardContent className="text-center p-8">
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-6" />
              <h1 className="text-display mb-4">Candidatura enviada!</h1>
              <p className="text-body-large text-neutral-600 mb-6">
                Sua candidatura para <strong>{vaga?.titulo}</strong> foi recebida com sucesso. 
                Acompanhe o status no seu portal.
              </p>
              <div className="flex gap-4 justify-center">
                <Button variant="outline" asChild>
                  <Link href="/candidato/vagas">Ver outras vagas</Link>
                </Button>
                <Button variant="primary" asChild>
                  <Link href="/candidato">Ir para dashboard</Link>
                </Button>
              </div>
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
            <Link href={`/candidato/vagas/${vaga_key}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para vaga
            </Link>
          </Button>
        </div>

        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-display">Candidatura</h1>
          <p className="text-body-large text-neutral-600">
            Complete os dados abaixo para se candidatar à vaga de <span className="text-gradient-cosmic font-semibold">{vaga?.titulo}</span>
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Personal Info */}
          <Card variant="clean">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informações Pessoais
              </CardTitle>
              <CardDescription>
                Dados básicos para contato e identificação
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="nome_completo" variant="required">Nome Completo</Label>
                  <Input
                    id="nome_completo"
                    value={formData.nome_completo}
                    onChange={(e) => handleInputChange('nome_completo', e.target.value)}
                    placeholder="Seu nome completo"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email" variant="required">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="seu@email.com"
                  />
                </div>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="telefone" variant="required">Telefone</Label>
                  <Input
                    id="telefone"
                    value={formData.telefone}
                    onChange={(e) => handleInputChange('telefone', e.target.value)}
                    placeholder="(11) 99999-9999"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="data_nascimento" variant="required">Data de Nascimento</Label>
                  <Input
                    id="data_nascimento"
                    type="date"
                    value={formData.data_nascimento}
                    onChange={(e) => handleInputChange('data_nascimento', e.target.value)}
                  />
                </div>
              </div>
              
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="cidade" variant="required">Cidade</Label>
                  <Input
                    id="cidade"
                    value={formData.cidade}
                    onChange={(e) => handleInputChange('cidade', e.target.value)}
                    placeholder="São Paulo"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="estado" variant="required">Estado</Label>
                  <Input
                    id="estado"
                    value={formData.estado}
                    onChange={(e) => handleInputChange('estado', e.target.value)}
                    placeholder="SP"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="pais">País</Label>
                  <Input
                    id="pais"
                    value={formData.pais}
                    onChange={(e) => handleInputChange('pais', e.target.value)}
                    placeholder="Brasil"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Education */}
          <Card variant="clean">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Formação Acadêmica
              </CardTitle>
              <CardDescription>
                Informações sobre sua educação e qualificações
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="nivel_escolaridade" variant="required">Nível de Escolaridade</Label>
                  <select
                    id="nivel_escolaridade"
                    value={formData.nivel_escolaridade}
                    onChange={(e) => handleInputChange('nivel_escolaridade', e.target.value)}
                    className="input-clean"
                  >
                    <option value="">Selecione</option>
                    <option value="Ensino Médio">Ensino Médio</option>
                    <option value="Ensino Técnico">Ensino Técnico</option>
                    <option value="Ensino Superior Incompleto">Ensino Superior Incompleto</option>
                    <option value="Ensino Superior Completo">Ensino Superior Completo</option>
                    <option value="Pós-graduação">Pós-graduação</option>
                    <option value="Mestrado">Mestrado</option>
                    <option value="Doutorado">Doutorado</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="curso">Curso</Label>
                  <Input
                    id="curso"
                    value={formData.curso}
                    onChange={(e) => handleInputChange('curso', e.target.value)}
                    placeholder="Nome do curso"
                  />
                </div>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="instituicao">Instituição</Label>
                  <Input
                    id="instituicao"
                    value={formData.instituicao}
                    onChange={(e) => handleInputChange('instituicao', e.target.value)}
                    placeholder="Nome da instituição"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="ano_conclusao">Ano de Conclusão</Label>
                  <Input
                    id="ano_conclusao"
                    type="number"
                    value={formData.ano_conclusao}
                    onChange={(e) => handleInputChange('ano_conclusao', e.target.value)}
                    placeholder="2024"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Experience */}
          <Card variant="clean">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Experiência Profissional
              </CardTitle>
              <CardDescription>
                Sua trajetória e experiência no mercado
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="experiencia_anos" variant="required">Anos de Experiência</Label>
                  <select
                    id="experiencia_anos"
                    value={formData.experiencia_anos}
                    onChange={(e) => handleInputChange('experiencia_anos', e.target.value)}
                    className="input-clean"
                  >
                    <option value="">Selecione</option>
                    <option value="0">Sem experiência</option>
                    <option value="1">1 ano</option>
                    <option value="2">2 anos</option>
                    <option value="3">3 anos</option>
                    <option value="4">4 anos</option>
                    <option value="5">5+ anos</option>
                    <option value="10">10+ anos</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="salario_pretendido">Salário Pretendido (R$)</Label>
                  <Input
                    id="salario_pretendido"
                    type="number"
                    value={formData.salario_pretendido}
                    onChange={(e) => handleInputChange('salario_pretendido', e.target.value)}
                    placeholder="5000"
                  />
                </div>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="cargo_atual">Cargo Atual</Label>
                  <Input
                    id="cargo_atual"
                    value={formData.cargo_atual}
                    onChange={(e) => handleInputChange('cargo_atual', e.target.value)}
                    placeholder="Desenvolvedor Frontend"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="empresa_atual">Empresa Atual</Label>
                  <Input
                    id="empresa_atual"
                    value={formData.empresa_atual}
                    onChange={(e) => handleInputChange('empresa_atual', e.target.value)}
                    placeholder="Nome da empresa"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Skills & Links */}
          <Card variant="clean">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LinkIcon className="h-5 w-5" />
                Skills e Portfolio
              </CardTitle>
              <CardDescription>
                Suas habilidades e links para portfolio/redes profissionais
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="principais_skills" variant="required">Principais Skills</Label>
                <textarea
                  id="principais_skills"
                  value={formData.principais_skills}
                  onChange={(e) => handleInputChange('principais_skills', e.target.value)}
                  className="input-clean min-h-[100px] resize-y"
                  placeholder="Liste suas principais habilidades técnicas, separadas por vírgula"
                />
              </div>
              
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="linkedin">LinkedIn</Label>
                  <Input
                    id="linkedin"
                    value={formData.linkedin}
                    onChange={(e) => handleInputChange('linkedin', e.target.value)}
                    placeholder="https://linkedin.com/in/..."
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="github">GitHub</Label>
                  <Input
                    id="github"
                    value={formData.github}
                    onChange={(e) => handleInputChange('github', e.target.value)}
                    placeholder="https://github.com/..."
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="portfolio">Portfolio/Site</Label>
                  <Input
                    id="portfolio"
                    value={formData.portfolio}
                    onChange={(e) => handleInputChange('portfolio', e.target.value)}
                    placeholder="https://meusite.com"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Files */}
          <Card variant="clean">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Documentos
              </CardTitle>
              <CardDescription>
                Faça upload do seu currículo e carta de apresentação
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="curriculo" variant="required">Currículo (PDF)</Label>
                  <input
                    id="curriculo"
                    type="file"
                    accept=".pdf"
                    onChange={(e) => handleFileChange('curriculo', e.target.files?.[0] || null)}
                    className="input-clean file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="carta_apresentacao">Carta de Apresentação (PDF)</Label>
                  <input
                    id="carta_apresentacao"
                    type="file"
                    accept=".pdf"
                    onChange={(e) => handleFileChange('carta_apresentacao', e.target.files?.[0] || null)}
                    className="input-clean file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Motivation */}
          <Card variant="clean">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Motivação e Disponibilidade
              </CardTitle>
              <CardDescription>
                Conte-nos mais sobre você e sua disponibilidade
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="motivacao" variant="required">Por que você quer trabalhar na AutoU?</Label>
                <textarea
                  id="motivacao"
                  value={formData.motivacao}
                  onChange={(e) => handleInputChange('motivacao', e.target.value)}
                  className="input-clean min-h-[120px] resize-y"
                  placeholder="Conte-nos o que te motiva a se candidatar para esta vaga e para trabalhar na AutoU..."
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="disponibilidade" variant="required">Disponibilidade para início</Label>
                <select
                  id="disponibilidade"
                  value={formData.disponibilidade}
                  onChange={(e) => handleInputChange('disponibilidade', e.target.value)}
                  className="input-clean"
                >
                  <option value="">Selecione</option>
                  <option value="Imediata">Imediata</option>
                  <option value="15 dias">15 dias</option>
                  <option value="30 dias">30 dias</option>
                  <option value="45 dias">45 dias</option>
                  <option value="60 dias">60 dias</option>
                  <option value="A combinar">A combinar</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Error Message */}
          {error && (
            <Card variant="clean">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="h-5 w-5" />
                  <span className="text-body">{error}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Submit */}
          <div className="flex justify-center">
            <Button 
              type="submit" 
              variant="primary" 
              size="lg" 
              disabled={submitting}
              className="min-w-[200px]"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Enviando...
                </>
              ) : (
                'Enviar Candidatura'
              )}
            </Button>
          </div>
        </form>
      </div>
    </PortalLayout>
  )
}