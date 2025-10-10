-- Migration: Adicionar tipos de avaliador e sistema de atribuição
-- Data: 2025-01-10

-- 1. Adicionar campos na tabela de usuários para especialização de avaliadores
ALTER TABLE aura_jobs_usuarios
ADD COLUMN IF NOT EXISTS tipo_avaliador VARCHAR(50) CHECK (tipo_avaliador IN ('desenvolvimento', 'design', 'consultoria', 'generalista')),
ADD COLUMN IF NOT EXISTS pode_avaliar_tudo BOOLEAN DEFAULT FALSE;

-- 2. Adicionar campo tipo_vaga na tabela de vagas
ALTER TABLE aura_jobs_vagas
ADD COLUMN IF NOT EXISTS tipo_vaga VARCHAR(50) CHECK (tipo_vaga IN ('desenvolvimento', 'design', 'consultoria'));

-- 3. Criar tabela de atribuição de avaliadores a vagas (N:N)
CREATE TABLE IF NOT EXISTS aura_jobs_avaliador_vagas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  avaliador_id UUID NOT NULL REFERENCES aura_jobs_usuarios(id) ON DELETE CASCADE,
  vaga_id UUID NOT NULL REFERENCES aura_jobs_vagas(id) ON DELETE CASCADE,
  atribuido_por UUID REFERENCES aura_jobs_usuarios(id),
  atribuido_em TIMESTAMP DEFAULT NOW(),
  UNIQUE(avaliador_id, vaga_id)
);

-- 4. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_usuarios_tipo_avaliador ON aura_jobs_usuarios(tipo_avaliador);
CREATE INDEX IF NOT EXISTS idx_vagas_tipo_vaga ON aura_jobs_vagas(tipo_vaga);
CREATE INDEX IF NOT EXISTS idx_avaliador_vagas_avaliador ON aura_jobs_avaliador_vagas(avaliador_id);
CREATE INDEX IF NOT EXISTS idx_avaliador_vagas_vaga ON aura_jobs_avaliador_vagas(vaga_id);

-- 5. Comentários para documentação
COMMENT ON COLUMN aura_jobs_usuarios.tipo_avaliador IS 'Tipo de especialização do avaliador: desenvolvimento, design, consultoria ou generalista';
COMMENT ON COLUMN aura_jobs_usuarios.pode_avaliar_tudo IS 'Se TRUE, avaliador pode ver e avaliar candidatos de qualquer tipo de vaga';
COMMENT ON COLUMN aura_jobs_vagas.tipo_vaga IS 'Tipo da vaga para filtrar avaliadores especializados';
COMMENT ON TABLE aura_jobs_avaliador_vagas IS 'Tabela de atribuição manual de avaliadores a vagas específicas';
