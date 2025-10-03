-- Criar tabela de avaliações
CREATE TABLE IF NOT EXISTS avaliacoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidato_id UUID NOT NULL REFERENCES aura_jobs_candidatos(id) ON DELETE CASCADE,
  avaliador_id TEXT NOT NULL,
  vaga_id UUID NOT NULL REFERENCES aura_jobs_vagas(id) ON DELETE CASCADE,

  -- Notas
  nota_tecnica DECIMAL(3,1),
  nota_soft_skills DECIMAL(3,1),
  nota_experiencia DECIMAL(3,1),
  nota_case DECIMAL(3,1),

  -- Comentários
  comentarios_tecnicos TEXT,
  comentarios_soft_skills TEXT,
  comentarios_experiencia TEXT,
  comentarios_case TEXT,
  comentario_geral TEXT,

  -- Recomendações
  recomenda_aprovar BOOLEAN DEFAULT false,
  recomenda_entrevista BOOLEAN DEFAULT false,

  -- Fase avaliada
  fase_avaliada TEXT NOT NULL,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_avaliacoes_candidato ON avaliacoes(candidato_id);
CREATE INDEX IF NOT EXISTS idx_avaliacoes_vaga ON avaliacoes(vaga_id);
CREATE INDEX IF NOT EXISTS idx_avaliacoes_avaliador ON avaliacoes(avaliador_id);

-- Habilitar RLS
ALTER TABLE avaliacoes ENABLE ROW LEVEL SECURITY;

-- Criar política que permite tudo (para desenvolvimento)
CREATE POLICY "Permitir tudo em avaliacoes"
ON avaliacoes
FOR ALL
USING (true)
WITH CHECK (true);

-- Comentários
COMMENT ON TABLE avaliacoes IS 'Armazena as avaliações dos candidatos feitas pelos avaliadores';
COMMENT ON COLUMN avaliacoes.fase_avaliada IS 'Fase que foi avaliada: avaliacao_case, entrevista_tecnica, etc';
