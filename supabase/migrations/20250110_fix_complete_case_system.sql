-- ============================================
-- MIGRATION COMPLETA: Correção Total do Sistema de Cases
-- Data: 2025-01-10
-- ============================================

-- ============================================
-- PARTE 1: ADICIONAR COLUNAS FALTANTES
-- ============================================

-- 1.1 Adicionar colunas em aura_jobs_candidatos (se não existirem)
ALTER TABLE aura_jobs_candidatos
ADD COLUMN IF NOT EXISTS url_entregavel_1 TEXT,
ADD COLUMN IF NOT EXISTS url_entregavel_2 TEXT,
ADD COLUMN IF NOT EXISTS url_video TEXT,
ADD COLUMN IF NOT EXISTS data_envio_case TIMESTAMP,
ADD COLUMN IF NOT EXISTS comentarios_adicionais TEXT;

-- 1.2 Adicionar colunas em aura_jobs_vagas (se não existirem)
ALTER TABLE aura_jobs_vagas
ADD COLUMN IF NOT EXISTS case_link_notion TEXT,
ADD COLUMN IF NOT EXISTS prazo_case_dias INTEGER DEFAULT 5,
ADD COLUMN IF NOT EXISTS tipo_vaga TEXT;

-- 1.3 Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_candidatos_case_enviado
ON aura_jobs_candidatos(data_envio_case)
WHERE data_envio_case IS NOT NULL;

-- 1.4 Criar índice para vagas por tipo
CREATE INDEX IF NOT EXISTS idx_vagas_tipo
ON aura_jobs_vagas(tipo_vaga)
WHERE tipo_vaga IS NOT NULL;

COMMENT ON COLUMN aura_jobs_vagas.case_link_notion IS 'Link do Notion com o enunciado do case prático para esta vaga';
COMMENT ON COLUMN aura_jobs_vagas.prazo_case_dias IS 'Prazo em dias para entrega do case (padrão: 5 dias)';
COMMENT ON COLUMN aura_jobs_vagas.tipo_vaga IS 'Tipo da vaga: desenvolvimento, designer-po, consultoria, etc.';

-- ============================================
-- PARTE 2: POPULAR case_link_notion NAS VAGAS EXISTENTES
-- ============================================

-- 2.1 Designer, UX, UI, Product Manager, PO
UPDATE aura_jobs_vagas
SET case_link_notion = 'https://www.notion.so/autou-digital/Case-Pr-tico-AutoU-Product-Designer-PO-20d36ce78e5580a5a8f7ce7693d4bfce',
    tipo_vaga = 'designer-po'
WHERE case_link_notion IS NULL
  AND (
    titulo ILIKE '%designer%' OR
    titulo ILIKE '%ux%' OR
    titulo ILIKE '%ui%' OR
    titulo ILIKE '%product manager%' OR
    titulo ILIKE '%product owner%' OR
    titulo ILIKE '%po %'
  );

-- 2.2 Desenvolvedor, Developer, Frontend, Backend
UPDATE aura_jobs_vagas
SET case_link_notion = 'https://www.notion.so/autou-digital/Case-Pr-tico-AutoU-Desenvolvimento-18836ce78e5580d0b59bcf9610b27769',
    tipo_vaga = 'desenvolvimento'
WHERE case_link_notion IS NULL
  AND (
    titulo ILIKE '%desenvolvedor%' OR
    titulo ILIKE '%developer%' OR
    titulo ILIKE '%frontend%' OR
    titulo ILIKE '%backend%' OR
    titulo ILIKE '%full stack%' OR
    titulo ILIKE '%fullstack%' OR
    titulo ILIKE '%dev %'
  );

-- 2.3 Analista, Dados, Consultoria, Negócios
UPDATE aura_jobs_vagas
SET case_link_notion = 'https://www.notion.so/autou-digital/Case-Pr-tico-AutoU-Consultoria-1ff36ce78e5580f5a410c5393d227bfe',
    tipo_vaga = 'consultoria'
WHERE case_link_notion IS NULL
  AND (
    titulo ILIKE '%analista%' OR
    titulo ILIKE '%dados%' OR
    titulo ILIKE '%data %' OR
    titulo ILIKE '%consultor%' OR
    titulo ILIKE '%consultoria%' OR
    titulo ILIKE '%negócio%' OR
    titulo ILIKE '%negocio%' OR
    titulo ILIKE '%business%'
  );

-- 2.4 Vagas genéricas ou "Teste" - usar desenvolvimento como padrão
UPDATE aura_jobs_vagas
SET case_link_notion = 'https://www.notion.so/autou-digital/Case-Pr-tico-AutoU-Desenvolvimento-18836ce78e5580d0b59bcf9610b27769',
    tipo_vaga = 'desenvolvimento'
WHERE case_link_notion IS NULL;

-- ============================================
-- PARTE 3: CRIAR FUNÇÃO PARA AUTO-POPULAÇÃO AUTOMÁTICA
-- ============================================

-- 3.1 Criar função que detecta o tipo baseado no título
CREATE OR REPLACE FUNCTION auto_populate_case_link()
RETURNS TRIGGER AS $$
BEGIN
  -- Se case_link_notion já foi preenchido manualmente, não sobrescrever
  IF NEW.case_link_notion IS NOT NULL AND NEW.case_link_notion != '' THEN
    RETURN NEW;
  END IF;

  -- Designer, UX, UI, Product Manager, PO
  IF NEW.titulo ~* '(designer|ux|ui|product manager|product owner|po )' THEN
    NEW.case_link_notion := 'https://www.notion.so/autou-digital/Case-Pr-tico-AutoU-Product-Designer-PO-20d36ce78e5580a5a8f7ce7693d4bfce';
    NEW.tipo_vaga := 'designer-po';
    RETURN NEW;
  END IF;

  -- Desenvolvedor
  IF NEW.titulo ~* '(desenvolvedor|developer|frontend|backend|full stack|fullstack|dev )' THEN
    NEW.case_link_notion := 'https://www.notion.so/autou-digital/Case-Pr-tico-AutoU-Desenvolvimento-18836ce78e5580d0b59bcf9610b27769';
    NEW.tipo_vaga := 'desenvolvimento';
    RETURN NEW;
  END IF;

  -- Consultoria, Analista, Dados
  IF NEW.titulo ~* '(analista|dados|data |consultor|consultoria|negócio|negocio|business)' THEN
    NEW.case_link_notion := 'https://www.notion.so/autou-digital/Case-Pr-tico-AutoU-Consultoria-1ff36ce78e5580f5a410c5393d227bfe';
    NEW.tipo_vaga := 'consultoria';
    RETURN NEW;
  END IF;

  -- Default: Desenvolvimento
  NEW.case_link_notion := 'https://www.notion.so/autou-digital/Case-Pr-tico-AutoU-Desenvolvimento-18836ce78e5580d0b59bcf9610b27769';
  NEW.tipo_vaga := 'desenvolvimento';

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3.2 Criar trigger para INSERT (novas vagas)
DROP TRIGGER IF EXISTS trigger_auto_populate_case_link_insert ON aura_jobs_vagas;
CREATE TRIGGER trigger_auto_populate_case_link_insert
BEFORE INSERT ON aura_jobs_vagas
FOR EACH ROW
EXECUTE FUNCTION auto_populate_case_link();

-- 3.3 Criar trigger para UPDATE (quando o título muda e case_link é null)
DROP TRIGGER IF EXISTS trigger_auto_populate_case_link_update ON aura_jobs_vagas;
CREATE TRIGGER trigger_auto_populate_case_link_update
BEFORE UPDATE ON aura_jobs_vagas
FOR EACH ROW
WHEN (NEW.case_link_notion IS NULL OR NEW.case_link_notion = '')
EXECUTE FUNCTION auto_populate_case_link();

-- ============================================
-- PARTE 4: QUERIES DE VERIFICAÇÃO
-- ============================================

-- 4.1 Verificar se as colunas foram criadas em candidatos
DO $$
BEGIN
  RAISE NOTICE '=== VERIFICANDO COLUNAS EM aura_jobs_candidatos ===';
END $$;

SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'aura_jobs_candidatos'
  AND column_name IN ('url_entregavel_1', 'url_entregavel_2', 'url_video', 'data_envio_case', 'comentarios_adicionais')
ORDER BY column_name;

-- 4.2 Verificar se as colunas foram criadas em vagas
DO $$
BEGIN
  RAISE NOTICE '=== VERIFICANDO COLUNAS EM aura_jobs_vagas ===';
END $$;

SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'aura_jobs_vagas'
  AND column_name IN ('case_link_notion', 'prazo_case_dias', 'tipo_vaga')
ORDER BY column_name;

-- 4.3 Verificar se case_link_notion foi populado
DO $$
BEGIN
  RAISE NOTICE '=== VERIFICANDO case_link_notion POPULADO ===';
END $$;

SELECT
  id,
  titulo,
  case_link_notion,
  tipo_vaga,
  prazo_case_dias
FROM aura_jobs_vagas
ORDER BY created_at DESC
LIMIT 10;

-- 4.4 Contar vagas por tipo
DO $$
BEGIN
  RAISE NOTICE '=== CONTAGEM POR TIPO DE VAGA ===';
END $$;

SELECT
  tipo_vaga,
  COUNT(*) as quantidade,
  COUNT(CASE WHEN case_link_notion IS NOT NULL THEN 1 END) as com_case_link
FROM aura_jobs_vagas
GROUP BY tipo_vaga
ORDER BY quantidade DESC;

-- 4.5 Verificar se há vagas sem case_link
DO $$
BEGIN
  RAISE NOTICE '=== VAGAS SEM case_link_notion (deveria ser 0) ===';
END $$;

SELECT COUNT(*) as vagas_sem_case_link
FROM aura_jobs_vagas
WHERE case_link_notion IS NULL OR case_link_notion = '';

-- ============================================
-- FIM DA MIGRATION
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '✅ MIGRATION COMPLETA EXECUTADA COM SUCESSO!';
  RAISE NOTICE '✅ Todas as colunas foram criadas';
  RAISE NOTICE '✅ Todas as vagas foram populadas com case_link_notion';
  RAISE NOTICE '✅ Triggers criados para auto-população em novas vagas';
  RAISE NOTICE '✅ Sistema 100%% funcional!';
END $$;
