-- Adicionar campo cargo na tabela aura_jobs_vagas
ALTER TABLE aura_jobs_vagas ADD COLUMN IF NOT EXISTS cargo VARCHAR(255);