-- Adiciona coluna nivel_ingles à tabela aura_jobs_candidatos
ALTER TABLE aura_jobs_candidatos
ADD COLUMN IF NOT EXISTS nivel_ingles TEXT;

-- Adiciona comentário na coluna
COMMENT ON COLUMN aura_jobs_candidatos.nivel_ingles IS 'Nível de inglês do candidato (Básico, Intermediário, Avançado, Fluente, Nativo)';
