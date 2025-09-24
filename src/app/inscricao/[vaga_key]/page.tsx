'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { 
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
  AlertCircle,
  ArrowRight,
  Save,
  Sparkles
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

type FormStep = 'personal' | 'education' | 'experience' | 'documents' | 'motivation'

export default function InscricaoFocadaPage() {
  const router = useRouter()
  const params = useParams()
  const vagaKey = params.vaga_key as string
  
  const [vaga, setVaga] = useState<Vaga | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [currentStep, setCurrentStep] = useState<FormStep>('personal')
  const [completedSteps, setCompletedSteps] = useState<Set<FormStep>>(new Set())
  const [consultaToken, setConsultaToken] = useState<string | null>(null)
  const [cvFile, setCvFile] = useState<File | null>(null)
  const [cartaFile, setCartaFile] = useState<File | null>(null)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
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

  const steps: { key: FormStep; label: string; icon: any }[] = [
    { key: 'personal', label: 'Dados Pessoais', icon: User },
    { key: 'education', label: 'Formação', icon: GraduationCap },
    { key: 'experience', label: 'Experiência', icon: Briefcase },
    { key: 'documents', label: 'Documentos', icon: Upload },
    { key: 'motivation', label: 'Motivação', icon: Sparkles },
  ]

  const stepIndex = steps.findIndex(s => s.key === currentStep)

  useEffect(() => {
    if (vagaKey) {
      loadVaga()
      loadSavedData()
    }
  }, [vagaKey])

  // Auto-save a cada mudança significativa
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.email && formData.nome_completo) {
        saveToLocalStorage()
      }
    }, 2000)
    return () => clearTimeout(timer)
  }, [formData])

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

  const loadSavedData = () => {
    const saved = localStorage.getItem(`inscricao_${vagaKey}`)
    if (saved) {
      try {
        const data = JSON.parse(saved)
        setFormData(data.formData || formData)
        setCompletedSteps(new Set(data.completedSteps || []))
        setLastSaved(data.lastSaved ? new Date(data.lastSaved) : null)
      } catch (e) {
        console.error('Erro ao carregar dados salvos:', e)
      }
    }
  }

  const saveToLocalStorage = () => {
    const dataToSave = {
      formData,
      completedSteps: Array.from(completedSteps),
      lastSaved: new Date().toISOString()
    }
    localStorage.setItem(`inscricao_${vagaKey}`, JSON.stringify(dataToSave))
    setLastSaved(new Date())
  }

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleFileChange = (field: 'cv' | 'carta', file: File | null) => {
    if (file) {
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ]
      
      if (!allowedTypes.includes(file.type)) {
        setError('Por favor, envie apenas arquivos PDF ou Word')
        return
      }
      
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

  const validateStep = (step: FormStep): boolean => {
    switch (step) {
      case 'personal':
        return !!(formData.nome_completo && formData.email && formData.telefone && 
                 formData.data_nascimento && formData.cidade && formData.estado)
      case 'education':
        return !!formData.nivel_escolaridade
      case 'experience':
        return !!formData.experiencia_anos && !!formData.principais_skills
      case 'documents':
        return !!cvFile
      case 'motivation':
        return !!(formData.motivacao && formData.disponibilidade)
      default:
        return false
    }
  }

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCompletedSteps(prev => new Set([...prev, currentStep]))
      saveToLocalStorage()
      const currentIndex = steps.findIndex(s => s.key === currentStep)
      if (currentIndex < steps.length - 1) {
        setCurrentStep(steps[currentIndex + 1].key)
      }
    } else {
      setError('Por favor, preencha todos os campos obrigatórios')
    }
  }

  const handlePreviousStep = () => {
    const currentIndex = steps.findIndex(s => s.key === currentStep)
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1].key)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validar todos os steps
    const allStepsValid = steps.every(step => validateStep(step.key))
    if (!allStepsValid) {
      setError('Por favor, complete todos os campos obrigatórios')
      return
    }
    
    if (!vaga) return
    
    setSubmitting(true)
    setError(null)

    try {
      const supabase = createClient()
      
      // Verificar duplicata
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
      
      // Upload dos arquivos
      let curriculo_url = ''
      let carta_url = ''
      
      if (cvFile) {
        const fileName = `candidatos/${Date.now()}_curriculo_${cvFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('candidatos')
          .upload(fileName, cvFile)
          
        if (uploadError) throw new Error(`Erro ao fazer upload do currículo`)
        curriculo_url = uploadData.path
      }
      
      if (cartaFile) {
        const fileName = `candidatos/${Date.now()}_carta_${cartaFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('candidatos')
          .upload(fileName, cartaFile)
          
        if (uploadError) throw new Error(`Erro ao fazer upload da carta`)
        carta_url = uploadData.path
      }
      
      // Inserir candidatura
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
        curso: formData.curso || null,
        instituicao: formData.instituicao || null,
        ano_conclusao: formData.ano_conclusao ? parseInt(formData.ano_conclusao) : null,
        experiencia_anos: parseInt(formData.experiencia_anos),
        cargo_atual: formData.cargo_atual || null,
        empresa_atual: formData.empresa_atual || null,
        salario_pretendido: formData.salario_pretendido ? parseFloat(formData.salario_pretendido) : null,
        principais_skills: formData.principais_skills,
        linkedin: formData.linkedin || null,
        github: formData.github || null,
        portfolio: formData.portfolio || null,
        motivacao: formData.motivacao,
        disponibilidade: formData.disponibilidade,
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
      
      // Limpar localStorage após sucesso
      localStorage.removeItem(`inscricao_${vagaKey}`)
      
      setSuccess(true)
      
    } catch (err: any) {
      setError(err.message || 'Erro ao enviar candidatura')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin mx-auto"></div>
          <h1 className="text-2xl font-semibold text-gray-900">Carregando formulário...</h1>
        </div>
      </div>
    )
  }

  if (error && !vaga) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 to-indigo-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="text-center p-8">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-semibold mb-2">Erro</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button variant="outline" asChild>
              <Link href="/">Voltar ao início</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 to-indigo-50 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full">
          <CardContent className="text-center p-8">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-6" />
            <h1 className="text-3xl font-bold mb-4">Candidatura enviada com sucesso!</h1>
            <p className="text-lg text-gray-600 mb-8">
              Sua candidatura para <strong className="text-violet-600">{vaga?.titulo}</strong> foi recebida.
            </p>
            
            <div className="bg-violet-50 rounded-lg p-6 mb-8">
              <p className="text-sm text-violet-900 mb-2">Seu código de acompanhamento:</p>
              <p className="text-2xl font-mono font-bold text-violet-600">{consultaToken}</p>
              <p className="text-xs text-violet-700 mt-2">Guarde este código para consultar o status</p>
            </div>

            <div className="space-y-4">
              <p className="text-gray-600">
                Você receberá um email de confirmação em breve com todas as informações.
              </p>
              
              <div className="flex gap-4 justify-center">
                <Button variant="outline" asChild>
                  <Link href="/candidato/consulta">
                    Consultar Status
                  </Link>
                </Button>
                <Button variant="primary" asChild>
                  <Link href="/candidato/auth/signup">
                    Criar Conta
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 to-indigo-50">
      {/* Header Minimalista */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
            AutoU
          </Link>
          {lastSaved && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Save className="h-4 w-4" />
              Salvo automaticamente {lastSaved.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Título da Vaga */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Candidatura para {vaga?.titulo}
          </h1>
          <p className="text-gray-600">
            Preencha o formulário abaixo para se candidatar
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-4">
            {steps.map((step, index) => {
              const Icon = step.icon
              const isActive = step.key === currentStep
              const isCompleted = completedSteps.has(step.key)
              
              return (
                <div key={step.key} className="flex-1">
                  <div className="flex flex-col items-center">
                    <button
                      onClick={() => setCurrentStep(step.key)}
                      disabled={!isCompleted && step.key !== currentStep && index > stepIndex}
                      className={`
                        w-12 h-12 rounded-full flex items-center justify-center transition-all
                        ${isActive ? 'bg-violet-600 text-white scale-110' : 
                          isCompleted ? 'bg-green-500 text-white' : 
                          'bg-gray-200 text-gray-400'}
                        ${(isCompleted || isActive) ? 'cursor-pointer hover:scale-105' : 'cursor-not-allowed'}
                      `}
                    >
                      {isCompleted && !isActive ? (
                        <CheckCircle className="h-6 w-6" />
                      ) : (
                        <Icon className="h-5 w-5" />
                      )}
                    </button>
                    <span className={`text-xs mt-2 ${isActive ? 'font-semibold text-violet-600' : 'text-gray-500'}`}>
                      {step.label}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
          
          {/* Progress Line */}
          <div className="relative h-1 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="absolute h-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all duration-300"
              style={{ width: `${((stepIndex + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Form Content */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit}>
              {/* Personal Step */}
              {currentStep === 'personal' && (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <User className="h-5 w-5 text-violet-600" />
                    Informações Pessoais
                  </h2>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="nome_completo" variant="required">Nome Completo</Label>
                      <Input
                        id="nome_completo"
                        value={formData.nome_completo}
                        onChange={(e) => handleInputChange('nome_completo', e.target.value)}
                        placeholder="Seu nome completo"
                      />
                    </div>
                    
                    <div>
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
                    <div>
                      <Label htmlFor="telefone" variant="required">Telefone</Label>
                      <Input
                        id="telefone"
                        value={formData.telefone}
                        onChange={(e) => handleInputChange('telefone', e.target.value)}
                        placeholder="(11) 99999-9999"
                      />
                    </div>
                    
                    <div>
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
                    <div>
                      <Label htmlFor="cidade" variant="required">Cidade</Label>
                      <Input
                        id="cidade"
                        value={formData.cidade}
                        onChange={(e) => handleInputChange('cidade', e.target.value)}
                        placeholder="São Paulo"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="estado" variant="required">Estado</Label>
                      <Input
                        id="estado"
                        value={formData.estado}
                        onChange={(e) => handleInputChange('estado', e.target.value)}
                        placeholder="SP"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="pais">País</Label>
                      <Input
                        id="pais"
                        value={formData.pais}
                        onChange={(e) => handleInputChange('pais', e.target.value)}
                        placeholder="Brasil"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Education Step */}
              {currentStep === 'education' && (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-violet-600" />
                    Formação Acadêmica
                  </h2>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="nivel_escolaridade" variant="required">Nível de Escolaridade</Label>
                      <select
                        id="nivel_escolaridade"
                        value={formData.nivel_escolaridade}
                        onChange={(e) => handleInputChange('nivel_escolaridade', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
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
                    
                    <div>
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
                    <div>
                      <Label htmlFor="instituicao">Instituição</Label>
                      <Input
                        id="instituicao"
                        value={formData.instituicao}
                        onChange={(e) => handleInputChange('instituicao', e.target.value)}
                        placeholder="Nome da instituição"
                      />
                    </div>
                    
                    <div>
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
                </div>
              )}

              {/* Experience Step */}
              {currentStep === 'experience' && (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-violet-600" />
                    Experiência Profissional
                  </h2>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="experiencia_anos" variant="required">Anos de Experiência</Label>
                      <select
                        id="experiencia_anos"
                        value={formData.experiencia_anos}
                        onChange={(e) => handleInputChange('experiencia_anos', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
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
                    
                    <div>
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
                    <div>
                      <Label htmlFor="cargo_atual">Cargo Atual</Label>
                      <Input
                        id="cargo_atual"
                        value={formData.cargo_atual}
                        onChange={(e) => handleInputChange('cargo_atual', e.target.value)}
                        placeholder="Desenvolvedor Frontend"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="empresa_atual">Empresa Atual</Label>
                      <Input
                        id="empresa_atual"
                        value={formData.empresa_atual}
                        onChange={(e) => handleInputChange('empresa_atual', e.target.value)}
                        placeholder="Nome da empresa"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="principais_skills" variant="required">Principais Skills</Label>
                    <textarea
                      id="principais_skills"
                      value={formData.principais_skills}
                      onChange={(e) => handleInputChange('principais_skills', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 min-h-[100px] resize-y"
                      placeholder="Liste suas principais habilidades técnicas, separadas por vírgula"
                    />
                  </div>
                  
                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <Label htmlFor="linkedin">LinkedIn</Label>
                      <Input
                        id="linkedin"
                        value={formData.linkedin}
                        onChange={(e) => handleInputChange('linkedin', e.target.value)}
                        placeholder="linkedin.com/in/..."
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="github">GitHub</Label>
                      <Input
                        id="github"
                        value={formData.github}
                        onChange={(e) => handleInputChange('github', e.target.value)}
                        placeholder="github.com/..."
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="portfolio">Portfolio</Label>
                      <Input
                        id="portfolio"
                        value={formData.portfolio}
                        onChange={(e) => handleInputChange('portfolio', e.target.value)}
                        placeholder="meusite.com"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Documents Step */}
              {currentStep === 'documents' && (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Upload className="h-5 w-5 text-violet-600" />
                    Documentos
                  </h2>
                  
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="curriculo" variant="required">Currículo</Label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-violet-400 transition-colors">
                        <input
                          id="curriculo"
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={(e) => handleFileChange('cv', e.target.files?.[0] || null)}
                          className="hidden"
                        />
                        <label htmlFor="curriculo" className="cursor-pointer">
                          {cvFile ? (
                            <div className="space-y-2">
                              <FileText className="h-8 w-8 text-green-500 mx-auto" />
                              <p className="text-sm text-green-600 font-medium">{cvFile.name}</p>
                              <p className="text-xs text-gray-500">Clique para trocar</p>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <Upload className="h-8 w-8 text-gray-400 mx-auto" />
                              <p className="text-sm text-gray-600">Clique para enviar</p>
                              <p className="text-xs text-gray-400">PDF ou Word (max. 5MB)</p>
                            </div>
                          )}
                        </label>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="carta_apresentacao">Carta de Apresentação</Label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-violet-400 transition-colors">
                        <input
                          id="carta_apresentacao"
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={(e) => handleFileChange('carta', e.target.files?.[0] || null)}
                          className="hidden"
                        />
                        <label htmlFor="carta_apresentacao" className="cursor-pointer">
                          {cartaFile ? (
                            <div className="space-y-2">
                              <FileText className="h-8 w-8 text-green-500 mx-auto" />
                              <p className="text-sm text-green-600 font-medium">{cartaFile.name}</p>
                              <p className="text-xs text-gray-500">Clique para trocar</p>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <Upload className="h-8 w-8 text-gray-400 mx-auto" />
                              <p className="text-sm text-gray-600">Opcional</p>
                              <p className="text-xs text-gray-400">PDF ou Word (max. 5MB)</p>
                            </div>
                          )}
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Motivation Step */}
              {currentStep === 'motivation' && (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-violet-600" />
                    Motivação e Disponibilidade
                  </h2>
                  
                  <div>
                    <Label htmlFor="motivacao" variant="required">Por que você quer trabalhar conosco?</Label>
                    <textarea
                      id="motivacao"
                      value={formData.motivacao}
                      onChange={(e) => handleInputChange('motivacao', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 min-h-[120px] resize-y"
                      placeholder="Conte-nos o que te motiva a se candidatar para esta vaga..."
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="disponibilidade" variant="required">Disponibilidade para início</Label>
                    <select
                      id="disponibilidade"
                      value={formData.disponibilidade}
                      onChange={(e) => handleInputChange('disponibilidade', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
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
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="mt-4 flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
                  <AlertCircle className="h-5 w-5" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePreviousStep}
                  disabled={stepIndex === 0}
                >
                  Anterior
                </Button>
                
                {stepIndex === steps.length - 1 ? (
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Enviando...
                      </>
                    ) : (
                      'Enviar Candidatura'
                    )}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="primary"
                    onClick={handleNextStep}
                  >
                    Próximo
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Help Text */}
        <div className="text-center text-sm text-gray-500">
          Precisa de ajuda? Entre em contato: <a href="mailto:rh@autou.com.br" className="text-violet-600 hover:underline">rh@autou.com.br</a>
        </div>
      </div>
    </div>
  )
}