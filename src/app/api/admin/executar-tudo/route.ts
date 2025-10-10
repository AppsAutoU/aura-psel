import { NextResponse } from 'next/server'

export async function POST() {
  const sql = `
-- ================================================
-- MIGRATION COMPLETA - AURA JOBS CASE ENTREGAS
-- Executar no Supabase Dashboard > SQL Editor
-- ================================================

-- 1. Criar tabela se não existir
CREATE TABLE IF NOT EXISTS aura_jobs_case_entregas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidato_id UUID REFERENCES aura_jobs_candidatos(id) ON DELETE CASCADE,

  -- Identificação do candidato
  nome_completo VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,

  -- Tipo de case
  tipo_case VARCHAR(50) NOT NULL,

  -- Links dos entregáveis (até 3)
  link_entregavel_1 TEXT,
  link_entregavel_2 TEXT,
  link_entregavel_3 TEXT,

  -- Comentários adicionais
  comentarios_adicionais TEXT,

  -- 🆕 NOVOS CAMPOS
  vaga_id UUID REFERENCES aura_jobs_vagas(id),
  source VARCHAR(50),

  -- Metadados
  data_submissao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  ip_submissao VARCHAR(45)
);

-- 2. Adicionar colunas se a tabela já existir (mas não tiver as colunas)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'aura_jobs_case_entregas' AND column_name = 'vaga_id'
  ) THEN
    ALTER TABLE aura_jobs_case_entregas
    ADD COLUMN vaga_id UUID REFERENCES aura_jobs_vagas(id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'aura_jobs_case_entregas' AND column_name = 'source'
  ) THEN
    ALTER TABLE aura_jobs_case_entregas
    ADD COLUMN source VARCHAR(50);
  END IF;
END $$;

-- 3. Criar índices
CREATE INDEX IF NOT EXISTS idx_case_entregas_candidato ON aura_jobs_case_entregas(candidato_id);
CREATE INDEX IF NOT EXISTS idx_case_entregas_email ON aura_jobs_case_entregas(email);
CREATE INDEX IF NOT EXISTS idx_case_entregas_tipo ON aura_jobs_case_entregas(tipo_case);
CREATE INDEX IF NOT EXISTS idx_case_entregas_data ON aura_jobs_case_entregas(data_submissao DESC);
CREATE INDEX IF NOT EXISTS idx_case_entregas_vaga ON aura_jobs_case_entregas(vaga_id);
CREATE INDEX IF NOT EXISTS idx_case_entregas_source ON aura_jobs_case_entregas(source);

-- 4. Verificação final
SELECT
  'aura_jobs_case_entregas' as tabela,
  count(*) as total_colunas,
  array_agg(column_name ORDER BY ordinal_position) as colunas
FROM information_schema.columns
WHERE table_name = 'aura_jobs_case_entregas'
GROUP BY table_name;
`.trim()

  return NextResponse.json({
    success: false,
    message: '📋 SQL COMPLETO PRONTO PARA EXECUÇÃO',
    instrucoes: [
      '👉 COPIE o SQL abaixo',
      '👉 Acesse: https://supabase.com/dashboard/project/xjnjfytapohglezpwksf/sql/new',
      '👉 COLE o SQL',
      '👉 Clique em RUN',
      '👉 PRONTO! ✅'
    ],
    sql,
    link_direto: 'https://supabase.com/dashboard/project/xjnjfytapohglezpwksf/sql/new',
    o_que_faz: [
      '✅ Cria a tabela aura_jobs_case_entregas (se não existir)',
      '✅ Adiciona as colunas vaga_id e source (se não existirem)',
      '✅ Cria todos os índices necessários',
      '✅ Mostra verificação final das colunas'
    ]
  })
}
