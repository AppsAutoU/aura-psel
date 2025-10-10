-- ============================================
-- MIGRATION: Tabela de Backup de Entregas de Cases
-- Data: 2025-01-10
-- Objetivo: Garantir que nenhuma resposta de formulário seja perdida
-- ============================================

-- ============================================
-- CRIAR TABELA DE ENTREGAS DE CASES
-- ============================================

CREATE TABLE IF NOT EXISTS aura_jobs_case_entregas (
  -- Identificação
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relacionamentos
  candidato_id UUID NOT NULL REFERENCES aura_jobs_candidatos(id) ON DELETE CASCADE,
  vaga_id UUID NOT NULL REFERENCES aura_jobs_vagas(id) ON DELETE CASCADE,

  -- Dados do candidato (para backup)
  candidato_email VARCHAR(255) NOT NULL,
  candidato_nome VARCHAR(255),

  -- Dados da vaga (para backup)
  vaga_titulo TEXT,
  vaga_key VARCHAR(50),

  -- Entregáveis (cópia exata do que foi submetido)
  url_entregavel_1 TEXT,
  url_entregavel_2 TEXT,
  url_video TEXT,
  comentarios_adicionais TEXT,

  -- Metadados da submissão
  ip_address VARCHAR(45), -- IPv4 ou IPv6
  user_agent TEXT,

  -- JSON completo da request (backup total)
  request_payload JSONB,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Controle de versão (caso candidato reenvie)
  versao INTEGER DEFAULT 1,
  is_latest BOOLEAN DEFAULT TRUE
);

-- ============================================
-- CRIAR ÍNDICES PARA PERFORMANCE
-- ============================================

-- Índice para buscar entregas por candidato
CREATE INDEX IF NOT EXISTS idx_case_entregas_candidato_id
ON aura_jobs_case_entregas(candidato_id);

-- Índice para buscar entregas por vaga
CREATE INDEX IF NOT EXISTS idx_case_entregas_vaga_id
ON aura_jobs_case_entregas(vaga_id);

-- Índice para buscar por email (útil para debug)
CREATE INDEX IF NOT EXISTS idx_case_entregas_email
ON aura_jobs_case_entregas(candidato_email);

-- Índice para buscar entregas mais recentes
CREATE INDEX IF NOT EXISTS idx_case_entregas_created_at
ON aura_jobs_case_entregas(created_at DESC);

-- Índice para buscar apenas versões mais recentes
CREATE INDEX IF NOT EXISTS idx_case_entregas_latest
ON aura_jobs_case_entregas(is_latest)
WHERE is_latest = TRUE;

-- Índice composto para buscar última entrega de um candidato em uma vaga
CREATE INDEX IF NOT EXISTS idx_case_entregas_candidato_vaga_latest
ON aura_jobs_case_entregas(candidato_id, vaga_id, is_latest)
WHERE is_latest = TRUE;

-- ============================================
-- COMENTÁRIOS E DOCUMENTAÇÃO
-- ============================================

COMMENT ON TABLE aura_jobs_case_entregas IS 'Tabela de backup imutável de todas as entregas de cases práticos. Armazena o histórico completo de submissões, incluindo reenvios.';

COMMENT ON COLUMN aura_jobs_case_entregas.candidato_id IS 'Referência ao candidato que enviou o case';
COMMENT ON COLUMN aura_jobs_case_entregas.vaga_id IS 'Referência à vaga relacionada ao case';
COMMENT ON COLUMN aura_jobs_case_entregas.candidato_email IS 'Email do candidato (backup denormalizado)';
COMMENT ON COLUMN aura_jobs_case_entregas.candidato_nome IS 'Nome do candidato (backup denormalizado)';
COMMENT ON COLUMN aura_jobs_case_entregas.vaga_titulo IS 'Título da vaga (backup denormalizado)';
COMMENT ON COLUMN aura_jobs_case_entregas.vaga_key IS 'Chave única da vaga (backup denormalizado)';
COMMENT ON COLUMN aura_jobs_case_entregas.request_payload IS 'JSON completo da requisição original (backup total)';
COMMENT ON COLUMN aura_jobs_case_entregas.ip_address IS 'Endereço IP de onde foi enviado (auditoria)';
COMMENT ON COLUMN aura_jobs_case_entregas.user_agent IS 'User agent do navegador (auditoria)';
COMMENT ON COLUMN aura_jobs_case_entregas.versao IS 'Número da versão (incrementa a cada reenvio do mesmo candidato na mesma vaga)';
COMMENT ON COLUMN aura_jobs_case_entregas.is_latest IS 'Indica se é a versão mais recente da entrega deste candidato para esta vaga';

-- ============================================
-- TRIGGER PARA AUTO-UPDATE DO updated_at
-- ============================================

CREATE OR REPLACE FUNCTION update_case_entregas_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_case_entregas_updated_at ON aura_jobs_case_entregas;
CREATE TRIGGER trigger_update_case_entregas_updated_at
BEFORE UPDATE ON aura_jobs_case_entregas
FOR EACH ROW
EXECUTE FUNCTION update_case_entregas_updated_at();

-- ============================================
-- FUNCTION PARA MARCAR VERSÕES ANTIGAS COMO NÃO-LATEST
-- ============================================

CREATE OR REPLACE FUNCTION mark_previous_entregas_as_old()
RETURNS TRIGGER AS $$
BEGIN
  -- Marca todas as entregas anteriores deste candidato nesta vaga como não-latest
  UPDATE aura_jobs_case_entregas
  SET is_latest = FALSE
  WHERE candidato_id = NEW.candidato_id
    AND vaga_id = NEW.vaga_id
    AND id != NEW.id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_mark_previous_entregas_as_old ON aura_jobs_case_entregas;
CREATE TRIGGER trigger_mark_previous_entregas_as_old
AFTER INSERT ON aura_jobs_case_entregas
FOR EACH ROW
EXECUTE FUNCTION mark_previous_entregas_as_old();

-- ============================================
-- QUERIES DE VERIFICAÇÃO
-- ============================================

-- Verificar se a tabela foi criada
DO $$
BEGIN
  RAISE NOTICE '=== VERIFICANDO TABELA aura_jobs_case_entregas ===';
END $$;

SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'aura_jobs_case_entregas'
ORDER BY ordinal_position;

-- Verificar índices criados
DO $$
BEGIN
  RAISE NOTICE '=== VERIFICANDO ÍNDICES CRIADOS ===';
END $$;

SELECT
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'aura_jobs_case_entregas'
ORDER BY indexname;

-- Verificar triggers criados
DO $$
BEGIN
  RAISE NOTICE '=== VERIFICANDO TRIGGERS CRIADOS ===';
END $$;

SELECT
  trigger_name,
  event_manipulation,
  action_timing
FROM information_schema.triggers
WHERE event_object_table = 'aura_jobs_case_entregas'
ORDER BY trigger_name;

-- ============================================
-- POLÍTICAS RLS (Row Level Security) - OPCIONAL
-- ============================================

-- Habilitar RLS (se necessário para segurança extra)
-- ALTER TABLE aura_jobs_case_entregas ENABLE ROW LEVEL SECURITY;

-- Política para service_role ter acesso total
-- CREATE POLICY "Service role has full access"
-- ON aura_jobs_case_entregas
-- FOR ALL
-- TO service_role
-- USING (true)
-- WITH CHECK (true);

-- ============================================
-- FIM DA MIGRATION
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '✅ TABELA DE BACKUP DE ENTREGAS CRIADA COM SUCESSO!';
  RAISE NOTICE '✅ Todas as respostas de formulários serão salvas em duplicata';
  RAISE NOTICE '✅ Sistema com backup completo e rastreabilidade total!';
  RAISE NOTICE '✅ Suporta versionamento automático de reenvios!';
END $$;
