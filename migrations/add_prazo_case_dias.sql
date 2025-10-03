-- Migração: Adicionar campo configurável de prazo do case por vaga
-- Data: 2025-10-03
-- Descrição: Permite que cada vaga tenha um prazo customizado para entrega do case prático

-- Adicionar coluna prazo_case_dias na tabela aura_jobs_vagas
ALTER TABLE aura_jobs_vagas
ADD COLUMN IF NOT EXISTS prazo_case_dias INTEGER DEFAULT 5
CHECK (prazo_case_dias > 0 AND prazo_case_dias <= 30);

-- Adicionar comentário explicativo
COMMENT ON COLUMN aura_jobs_vagas.prazo_case_dias IS
'Prazo do case em dias após aprovação pela IA (D+N). Padrão: 5 dias. Mínimo: 1 dia. Máximo: 30 dias.';

-- Atualizar vagas existentes para garantir que todas tenham o valor padrão
UPDATE aura_jobs_vagas
SET prazo_case_dias = 5
WHERE prazo_case_dias IS NULL;

-- Verificação: Contar vagas com o novo campo
SELECT
  COUNT(*) as total_vagas,
  AVG(prazo_case_dias) as prazo_medio,
  MIN(prazo_case_dias) as prazo_minimo,
  MAX(prazo_case_dias) as prazo_maximo
FROM aura_jobs_vagas;
