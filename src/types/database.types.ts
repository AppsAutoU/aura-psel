export type UserRole = 'admin' | 'avaliador';

export type CandidatoStatus = 
  | 'inscrito'
  | 'em_avaliacao_ia'
  | 'reprovado_ia'
  | 'case_enviado'
  | 'em_avaliacao_case'
  | 'aprovado_case'
  | 'reprovado_case'
  | 'entrevista_tecnica'
  | 'entrevista_socios'
  | 'aprovado'
  | 'reprovado'
  | 'contratado';

export type VagaStatus = 'aberta' | 'pausada' | 'fechada';

export type FaseProcesso = 
  | 'inscricao'
  | 'avaliacao_ia'
  | 'case_pratico'
  | 'avaliacao_case'
  | 'entrevista_tecnica'
  | 'entrevista_socios'
  | 'contratacao';

export interface Usuario {
  id: string;
  email: string;
  nome_completo: string;
  role: UserRole;
  departamento?: string;
  cargo?: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface Vaga {
  id: string;
  titulo: string;
  descricao?: string;
  departamento?: string;
  tipo_contrato?: string;
  modelo_trabalho?: string;
  localizacao?: string;
  nivel_experiencia?: string;
  salario_min?: number;
  salario_max?: number;
  requisitos?: string;
  beneficios?: string;
  vaga_key: string;
  status: VagaStatus;
  ativa: boolean;
  vagas_disponiveis: number;
  data_publicacao: string;
  data_expiracao?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface Candidato {
  id: string;
  vaga_id: string;
  
  // Dados Pessoais
  nome_completo: string;
  email: string;
  telefone?: string;
  data_nascimento?: string;
  cidade?: string;
  estado?: string;
  pais: string;
  
  // Formação Acadêmica
  nivel_escolaridade?: string;
  curso?: string;
  instituicao?: string;
  ano_conclusao?: number;
  
  // Experiência Profissional
  experiencia_anos?: number;
  cargo_atual?: string;
  empresa_atual?: string;
  salario_pretendido?: number;
  
  // Skills e Portfolio
  principais_skills?: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
  
  // Motivação e Disponibilidade
  motivacao?: string;
  disponibilidade?: string;
  
  // Documentos
  curriculo_url?: string;
  carta_apresentacao_url?: string;
  
  // Avaliação e Status
  score_ia?: number;
  analise_ia_completa?: any;
  status: CandidatoStatus;
  fase_atual: FaseProcesso;
  
  // Case Prático
  case_enviado: boolean;
  case_url?: string;
  case_descricao?: string;
  data_envio_case?: string;
  prazo_case?: string;
  
  // Avaliações
  nota_media_case?: number;
  total_avaliacoes: number;
  aprovado_case?: boolean;
  
  // Entrevistas
  data_entrevista_tecnica?: string;
  feedback_entrevista_tecnica?: string;
  aprovado_entrevista_tecnica?: boolean;
  data_entrevista_socios?: string;
  feedback_entrevista_socios?: string;
  aprovado_entrevista_socios?: boolean;
  
  // Metadados
  observacoes_internas?: string;
  tags?: string[];
  data_inscricao: string;
  created_at: string;
  updated_at: string;
}

export interface Avaliacao {
  id: string;
  candidato_id: string;
  avaliador_id: string;
  vaga_id: string;
  
  // Notas
  nota_tecnica?: number;
  nota_soft_skills?: number;
  nota_experiencia?: number;
  nota_case?: number;
  nota_final?: number;
  
  // Feedback
  comentarios_tecnicos?: string;
  comentarios_soft_skills?: string;
  comentarios_experiencia?: string;
  comentarios_case?: string;
  comentario_geral?: string;
  
  // Recomendação
  recomenda_aprovar?: boolean;
  recomenda_entrevista?: boolean;
  nivel_senioridade_sugerido?: string;
  
  // Metadados
  fase_avaliada?: FaseProcesso;
  tempo_avaliacao?: number;
  created_at: string;
  updated_at: string;
}

export interface HistoricoStatus {
  id: string;
  candidato_id: string;
  status_anterior?: CandidatoStatus;
  status_novo: CandidatoStatus;
  fase_anterior?: FaseProcesso;
  fase_nova?: FaseProcesso;
  motivo?: string;
  usuario_responsavel?: string;
  created_at: string;
}

export interface Notificacao {
  id: string;
  candidato_id: string;
  tipo: string;
  assunto?: string;
  conteudo?: string;
  email_destinatario?: string;
  enviado: boolean;
  data_envio?: string;
  erro_envio?: string;
  created_at: string;
}