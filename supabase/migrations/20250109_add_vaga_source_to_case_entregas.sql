-- Adicionar campos vaga_id e source à tabela aura_jobs_case_entregas
-- Migration criada em: 2025-01-09

-- Adicionar campo vaga_id para rastrear para qual vaga o candidato está aplicando
ALTER TABLE aura_jobs_case_entregas
ADD COLUMN IF NOT EXISTS vaga_id UUID REFERENCES aura_jobs_vagas(id);

-- Adicionar campo source para rastrear de qual Notion o candidato veio
ALTER TABLE aura_jobs_case_entregas
ADD COLUMN IF NOT EXISTS source VARCHAR(50);

-- Criar índices para melhorar performance das consultas
CREATE INDEX IF NOT EXISTS idx_case_entregas_vaga ON aura_jobs_case_entregas(vaga_id);
CREATE INDEX IF NOT EXISTS idx_case_entregas_source ON aura_jobs_case_entregas(source);

-- Adicionar comentários para documentação
COMMENT ON COLUMN aura_jobs_case_entregas.vaga_id IS 'Referência à vaga para qual o candidato está aplicando';
COMMENT ON COLUMN aura_jobs_case_entregas.source IS 'Origem da submissão (notion-dev, notion-design, notion-consultoria, direto)';
