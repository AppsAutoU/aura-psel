-- Tabela para armazenar entregas de cases práticos
CREATE TABLE IF NOT EXISTS aura_jobs_case_entregas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidato_id UUID REFERENCES aura_jobs_candidatos(id) ON DELETE CASCADE,

  -- Identificação do candidato
  nome_completo VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,

  -- Tipo de case
  tipo_case VARCHAR(50) NOT NULL, -- 'desenvolvimento', 'consultoria', 'designer-po'

  -- Links dos entregáveis (até 3)
  link_entregavel_1 TEXT,
  link_entregavel_2 TEXT,
  link_entregavel_3 TEXT,

  -- Comentários adicionais
  comentarios_adicionais TEXT,

  -- Metadados
  data_submissao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  ip_submissao VARCHAR(45),

  CONSTRAINT fk_candidato FOREIGN KEY (candidato_id) REFERENCES aura_jobs_candidatos(id) ON DELETE CASCADE
);

-- Criar índices para performance
CREATE INDEX idx_case_entregas_candidato ON aura_jobs_case_entregas(candidato_id);
CREATE INDEX idx_case_entregas_email ON aura_jobs_case_entregas(email);
CREATE INDEX idx_case_entregas_tipo ON aura_jobs_case_entregas(tipo_case);
CREATE INDEX idx_case_entregas_data ON aura_jobs_case_entregas(data_submissao DESC);

-- Comentários
COMMENT ON TABLE aura_jobs_case_entregas IS 'Armazena as entregas dos cases práticos dos candidatos';
COMMENT ON COLUMN aura_jobs_case_entregas.tipo_case IS 'Tipo do case: desenvolvimento, consultoria, designer-po';
COMMENT ON COLUMN aura_jobs_case_entregas.link_entregavel_1 IS 'Primeiro link de entregável (opcional)';
COMMENT ON COLUMN aura_jobs_case_entregas.link_entregavel_2 IS 'Segundo link de entregável (opcional)';
COMMENT ON COLUMN aura_jobs_case_entregas.link_entregavel_3 IS 'Terceiro link de entregável (opcional)';
