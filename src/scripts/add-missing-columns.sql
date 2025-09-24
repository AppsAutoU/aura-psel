-- Script para adicionar colunas faltantes na tabela aura_jobs_candidatos
-- Execute este script no Supabase SQL Editor

-- Verificar e adicionar colunas que podem estar faltando
-- IMPORTANTE: Comente as linhas das colunas que já existem no seu banco

-- Dados Pessoais
ALTER TABLE aura_jobs_candidatos ADD COLUMN IF NOT EXISTS telefone TEXT;
ALTER TABLE aura_jobs_candidatos ADD COLUMN IF NOT EXISTS whatsapp TEXT;
ALTER TABLE aura_jobs_candidatos ADD COLUMN IF NOT EXISTS linkedin TEXT;
ALTER TABLE aura_jobs_candidatos ADD COLUMN IF NOT EXISTS portfolio TEXT;
ALTER TABLE aura_jobs_candidatos ADD COLUMN IF NOT EXISTS github TEXT;
ALTER TABLE aura_jobs_candidatos ADD COLUMN IF NOT EXISTS data_nascimento DATE;

-- Formação Acadêmica  
ALTER TABLE aura_jobs_candidatos ADD COLUMN IF NOT EXISTS faculdade TEXT;
ALTER TABLE aura_jobs_candidatos ADD COLUMN IF NOT EXISTS curso_graduacao TEXT;
ALTER TABLE aura_jobs_candidatos ADD COLUMN IF NOT EXISTS tipo_formacao TEXT;
ALTER TABLE aura_jobs_candidatos ADD COLUMN IF NOT EXISTS data_inicio_graduacao DATE;
ALTER TABLE aura_jobs_candidatos ADD COLUMN IF NOT EXISTS data_formatura DATE;
ALTER TABLE aura_jobs_candidatos ADD COLUMN IF NOT EXISTS status_graduacao TEXT;
ALTER TABLE aura_jobs_candidatos ADD COLUMN IF NOT EXISTS pos_graduacao TEXT;
ALTER TABLE aura_jobs_candidatos ADD COLUMN IF NOT EXISTS cursos_complementares TEXT;

-- Experiência Profissional
ALTER TABLE aura_jobs_candidatos ADD COLUMN IF NOT EXISTS empresa_atual TEXT;
ALTER TABLE aura_jobs_candidatos ADD COLUMN IF NOT EXISTS cargo_atual TEXT;
ALTER TABLE aura_jobs_candidatos ADD COLUMN IF NOT EXISTS tempo_experiencia_total INTEGER;
ALTER TABLE aura_jobs_candidatos ADD COLUMN IF NOT EXISTS experiencia_relevante TEXT;
ALTER TABLE aura_jobs_candidatos ADD COLUMN IF NOT EXISTS principais_projetos TEXT;

-- Competências
ALTER TABLE aura_jobs_candidatos ADD COLUMN IF NOT EXISTS competencias_tecnicas TEXT;
ALTER TABLE aura_jobs_candidatos ADD COLUMN IF NOT EXISTS linguagens_programacao TEXT;
ALTER TABLE aura_jobs_candidatos ADD COLUMN IF NOT EXISTS frameworks_bibliotecas TEXT;
ALTER TABLE aura_jobs_candidatos ADD COLUMN IF NOT EXISTS ferramentas_tecnologias TEXT;
ALTER TABLE aura_jobs_candidatos ADD COLUMN IF NOT EXISTS idiomas TEXT;
ALTER TABLE aura_jobs_candidatos ADD COLUMN IF NOT EXISTS nivel_ingles TEXT;

-- Informações da Aplicação
ALTER TABLE aura_jobs_candidatos ADD COLUMN IF NOT EXISTS motivacao_vaga TEXT;
-- Campo como_conheceu_vaga removido (não usamos mais)
ALTER TABLE aura_jobs_candidatos ADD COLUMN IF NOT EXISTS pretensao_salarial DECIMAL(10,2);
ALTER TABLE aura_jobs_candidatos ADD COLUMN IF NOT EXISTS disponibilidade_inicio TEXT;
ALTER TABLE aura_jobs_candidatos ADD COLUMN IF NOT EXISTS disponivel_mudanca BOOLEAN DEFAULT FALSE;
ALTER TABLE aura_jobs_candidatos ADD COLUMN IF NOT EXISTS disponivel_viagens BOOLEAN DEFAULT FALSE;
ALTER TABLE aura_jobs_candidatos ADD COLUMN IF NOT EXISTS possui_mei_pj BOOLEAN DEFAULT FALSE;

-- Documentos
ALTER TABLE aura_jobs_candidatos ADD COLUMN IF NOT EXISTS curriculo_url TEXT;
ALTER TABLE aura_jobs_candidatos ADD COLUMN IF NOT EXISTS curriculo_texto TEXT;

-- REMOVA A COLUNA carta_apresentacao SE ELA EXISTIR (não usamos mais)
-- ALTER TABLE aura_jobs_candidatos DROP COLUMN IF EXISTS carta_apresentacao;

-- Localização
ALTER TABLE aura_jobs_candidatos ADD COLUMN IF NOT EXISTS cidade TEXT;
ALTER TABLE aura_jobs_candidatos ADD COLUMN IF NOT EXISTS estado TEXT;
ALTER TABLE aura_jobs_candidatos ADD COLUMN IF NOT EXISTS pais TEXT DEFAULT 'Brasil';

-- Metadados
ALTER TABLE aura_jobs_candidatos ADD COLUMN IF NOT EXISTS vaga_id UUID REFERENCES aura_jobs_vagas(id);
ALTER TABLE aura_jobs_candidatos ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pendente';
ALTER TABLE aura_jobs_candidatos ADD COLUMN IF NOT EXISTS score_ia INTEGER;

-- Índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_candidatos_vaga_id ON aura_jobs_candidatos(vaga_id);
CREATE INDEX IF NOT EXISTS idx_candidatos_email ON aura_jobs_candidatos(email);
CREATE INDEX IF NOT EXISTS idx_candidatos_status ON aura_jobs_candidatos(status);