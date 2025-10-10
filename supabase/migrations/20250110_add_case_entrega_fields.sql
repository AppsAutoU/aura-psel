-- Migration: Adicionar campos para entrega de case nos candidatos
-- Data: 2025-01-10
-- Descrição: Adiciona campos url_entregavel_1, url_entregavel_2, url_video em candidatos
--            e case_link_notion em vagas para sistema de formulários por vaga

-- ============================================
-- 1. ADICIONAR CAMPOS EM aura_jobs_candidatos
-- ============================================

-- Campos para URLs dos entregáveis
ALTER TABLE aura_jobs_candidatos
ADD COLUMN IF NOT EXISTS url_entregavel_1 TEXT,
ADD COLUMN IF NOT EXISTS url_entregavel_2 TEXT,
ADD COLUMN IF NOT EXISTS url_video TEXT;

-- Campo data_envio_case já existe, mas garantir que existe
ALTER TABLE aura_jobs_candidatos
ADD COLUMN IF NOT EXISTS data_envio_case TIMESTAMP;

-- ============================================
-- 2. ADICIONAR CAMPO EM aura_jobs_vagas
-- ============================================

-- Campo para armazenar o link do Notion do case específico da vaga
ALTER TABLE aura_jobs_vagas
ADD COLUMN IF NOT EXISTS case_link_notion TEXT;

-- ============================================
-- 3. COMENTÁRIOS PARA DOCUMENTAÇÃO
-- ============================================

COMMENT ON COLUMN aura_jobs_candidatos.url_entregavel_1 IS 'URL do primeiro entregável do case prático';
COMMENT ON COLUMN aura_jobs_candidatos.url_entregavel_2 IS 'URL do segundo entregável do case prático';
COMMENT ON COLUMN aura_jobs_candidatos.url_video IS 'URL do vídeo de apresentação do case';
COMMENT ON COLUMN aura_jobs_candidatos.data_envio_case IS 'Data e hora do envio do case prático';
COMMENT ON COLUMN aura_jobs_vagas.case_link_notion IS 'Link do Notion contendo o case prático específico desta vaga';

-- ============================================
-- 4. ÍNDICES PARA PERFORMANCE (OPCIONAL)
-- ============================================

-- Índice para buscar candidatos que enviaram case
CREATE INDEX IF NOT EXISTS idx_candidatos_case_enviado
ON aura_jobs_candidatos(data_envio_case)
WHERE data_envio_case IS NOT NULL;
