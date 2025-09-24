'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useCandidatoAuth } from '@/hooks/useCandidatoAuth'
import { PortalLayout } from '@/components/layout/portal-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AuthModal } from '@/components/ui/auth-modal'
import { PostSubmitAuthModal } from '@/components/ui/post-submit-auth-modal'
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
  descricao?: string
  departamento?: string
  tipo_contrato?: string
  modelo_trabalho?: string
  salario_min?: number
  salario_max?: number
  requisitos?: string
  beneficios?: string
  vagas_disponiveis: number
  vaga_key: string
  ativa: boolean
  created_at: string
  created_by?: string
}

export default function InscricaoPage() {
  const router = useRouter()
  const params = useParams()
  const vagaKey = params.vaga_key as string
  const { user: candidato, loading: authLoading, logout } = useCandidatoAuth()
  
  const [vaga, setVaga] = useState<Vaga | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showPostSubmitAuth, setShowPostSubmitAuth] = useState(false)
  const [submittedCandidaturaId, setSubmittedCandidaturaId] = useState<string | null>(null)
  const [consultaToken, setConsultaToken] = useState<string | null>(null)
  const [cvFile, setCvFile] = useState<File | null>(null)
  const [cartaFile, setCartaFile] = useState<File | null>(null)
  const [formData, setFormData] = useState({
    // Dados Pessoais
    nome_completo: '',
    email: '',
    telefone: '',
    data_nascimento: '',
    cidade: '',
    estado: '',
    pais: 'Brasil',
    
    // Formação Acadêmica
    nivel_escolaridade: '',
    curso: '',
    instituicao: '',
    ano_conclusao: '',
    
    // Experiência Profissional
    experiencia_anos: '',
    cargo_atual: '',
    empresa_atual: '',
    salario_pretendido: '',
    
    // Skills e Portfolio
    principais_skills: '',
    linkedin: '',
    github: '',
    portfolio: '',
    
    // Motivação e Disponibilidade
    motivacao: '',
    disponibilidade: '',
  })

  useEffect(() => {
    if (vagaKey) {
      loadVaga()
    }
  }, [vagaKey])

  // Preencher dados se usuário estiver logado
  useEffect(() => {
    if (!authLoading && candidato) {
      // Preencher dados do usuário logado
      setFormData(prev => ({
        ...prev,
        nome_completo: candidato.nome || '',
        email: candidato.email || '',
        telefone: candidato.telefone || ''
      }))
    }
  }, [candidato, authLoading])

  const loadVaga = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('aura_jobs_vagas')
        .select('*')
        .eq('vaga_key', vagaKey)
        .eq('ativa', true)
        .single()

      if (error || !data) {
        setError('Vaga não encontrada ou fechada')
        setLoading(false)
        return
      }

      setVaga(data)
    } catch (err) {
      console.error('Erro ao carregar vaga:', err)
      setError('Erro ao carregar informações da vaga')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleFileChange = (field: 'cv' | 'carta', file: File | null) => {
    if (file) {
      // Validar tipo de arquivo
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ]
      
      if (!allowedTypes.includes(file.type)) {
        setError('Por favor, envie apenas arquivos PDF ou Word')
        return
      }
      
      // Validar tamanho (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('O arquivo deve ter no máximo 5MB')
        return
      }
      
      if (field === 'cv') {
        setCvFile(file)
      } else {
        setCartaFile(file)
      }
      setError(null)
    }
  }

  const validateForm = () => {
    const required = [
      'nome_completo', 'email', 'telefone', 'data_nascimento', 'cidade', 'estado',
      'nivel_escolaridade', 'experiencia_anos', 'principais_skills', 'motivacao', 'disponibilidade'
    ]
    
    for (const field of required) {
      if (!formData[field as keyof typeof formData]) {
        setError(`Campo obrigatório: ${field.replace('_', ' ')}`)
        return false
      }
    }
    
    if (!cvFile) {
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
      
      // Verificar se já existe inscrição
      const { data: existing } = await supabase
        .from('aura_jobs_candidatos')
        .select('id')
        .eq('email', formData.email)
        .eq('vaga_id', vaga.id)
        .single()

      if (existing) {
        setError('Você já está inscrito nesta vaga')
        setSubmitting(false)
        return
      }
      
      // Upload files to storage
      let curriculo_url = ''
      let carta_url = ''
      
      if (cvFile) {
        const fileName = `candidatos/${Date.now()}_curriculo_${cvFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('candidatos')
          .upload(fileName, cvFile, {
            cacheControl: '3600',
            upsert: false
          })
          
        if (uploadError) {
          console.error('Erro no upload do currículo:', uploadError)
          throw new Error(`Erro ao fazer upload do currículo: ${uploadError.message}`)
        }
        curriculo_url = uploadData.path
      }
      
      if (cartaFile) {
        const fileName = `candidatos/${Date.now()}_carta_${cartaFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('candidatos')
          .upload(fileName, cartaFile, {
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
        user_id: candidato?.id || null, // Vincular ao usuário se estiver logado
        
        // Dados Pessoais
        nome_completo: formData.nome_completo,
        email: formData.email,
        telefone: formData.telefone || null,
        data_nascimento: formData.data_nascimento || null,
        cidade: formData.cidade,
        estado: formData.estado,
        pais: formData.pais || 'Brasil',
        
        // Formação Acadêmica
        nivel_escolaridade: formData.nivel_escolaridade || null,
        curso: formData.curso || null,
        instituicao: formData.instituicao || null,
        ano_conclusao: formData.ano_conclusao ? parseInt(formData.ano_conclusao) : null,
        
        // Experiência Profissional
        experiencia_anos: formData.experiencia_anos ? parseInt(formData.experiencia_anos) : null,
        cargo_atual: formData.cargo_atual || null,
        empresa_atual: formData.empresa_atual || null,
        salario_pretendido: formData.salario_pretendido ? parseFloat(formData.salario_pretendido) : null,
        
        // Skills e Portfolio
        principais_skills: formData.principais_skills || null,
        linkedin: formData.linkedin || null,
        github: formData.github || null,
        portfolio: formData.portfolio || null,
        
        // Motivação e Disponibilidade
        motivacao: formData.motivacao || null,
        disponibilidade: formData.disponibilidade || null,
        
        curriculo_url,
        carta_apresentacao_url: carta_url,
        
        status: 'inscrito',
        fase_atual: 'inscricao',
        data_inscricao: new Date().toISOString()
      }

      const { data: newCandidatura, error: insertError } = await supabase
        .from('aura_jobs_candidatos')
        .insert([candidatoData])
        .select('id, consulta_token')
        .single()
      
      if (insertError) throw insertError
      
      // Guardar informações da candidatura
      setSubmittedCandidaturaId(newCandidatura.id)
      setConsultaToken(newCandidatura.consulta_token)
      
      // Enviar email de confirmação (sem aguardar resposta para não bloquear o usuário)
      fetch('/api/emails/send-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidaturaId: newCandidatura.id,
          tipo: 'confirmacao'
        })
      }).catch(err => console.error('Erro ao enviar email:', err))
      
      // Se não estiver logado, mostrar modal para criar conta
      if (!candidato) {
        setShowPostSubmitAuth(true)
      } else {
        setSuccess(true)
      }
      
    } catch (err: any) {
      setError(err.message || 'Erro ao enviar candidatura')
    } finally {
      setSubmitting(false)
    }
  }

  const handleAuthSuccess = async (user: any) => {
    setShowAuthModal(false)
    setShowPostSubmitAuth(false)
    
    // Se foi após submissão, vincular candidatura ao usuário
    if (submittedCandidaturaId && user) {
      const supabase = createClient()
      await supabase
        .from('aura_jobs_candidatos')
        .update({ user_id: user.id })
        .eq('id', submittedCandidaturaId)
    }
    
    setSuccess(true)
  }

  const handleSkipAuth = () => {
    setShowPostSubmitAuth(false)
    setSuccess(true)
  }

  const userData = candidato ? {
    name: candidato.nome,
    email: candidato.email
  } : null

  if (loading || authLoading) {
    return (
      <PortalLayout user={userData} onLogout={logout}>
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
      <PortalLayout user={userData} onLogout={logout}>
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
      <PortalLayout user={userData} onLogout={logout}>
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
                  <Link href="/candidato/candidaturas">Minhas Candidaturas</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </PortalLayout>
    )
  }


  return (
    <PortalLayout user={userData} onLogout={logout}>
      <div className="space-y-8">
        {/* Navigation */}
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/candidato/vagas/${vagaKey}`}>
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
                    disabled={!!candidato}
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
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => handleFileChange('cv', e.target.files?.[0] || null)}
                    className="input-clean file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="carta_apresentacao">Carta de Apresentação (PDF)</Label>
                  <input
                    id="carta_apresentacao"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => handleFileChange('carta', e.target.files?.[0] || null)}
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
                <Label htmlFor="motivacao" variant="required">Por que você quer trabalhar conosco?</Label>
                <textarea
                  id="motivacao"
                  value={formData.motivacao}
                  onChange={(e) => handleInputChange('motivacao', e.target.value)}
                  className="input-clean min-h-[120px] resize-y"
                  placeholder="Conte-nos o que te motiva a se candidatar para esta vaga..."
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

      {/* Auth Modal - Antes da inscrição (caso o usuário clique em login) */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
        vagaTitulo={vaga?.titulo}
      />
      
      {/* Post Submit Auth Modal - Após inscrição bem-sucedida */}
      {showPostSubmitAuth && (
        <PostSubmitAuthModal
          isOpen={showPostSubmitAuth}
          onClose={handleSkipAuth}
          onSuccess={handleAuthSuccess}
          vagaTitulo={vaga?.titulo}
          consultaToken={consultaToken}
          email={formData.email}
        />
      )}
    </PortalLayout>
  )
}