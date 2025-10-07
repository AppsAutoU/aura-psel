-- Script para adicionar o novo status 'reprovado_socios' ao enum
-- Execute este script no Supabase SQL Editor

-- Adicionar o novo valor ao enum candidato_status
ALTER TYPE candidato_status ADD VALUE IF NOT EXISTS 'reprovado_socios';

-- Verificar se foi adicionado com sucesso
SELECT unnest(enum_range(NULL::candidato_status)) AS status_values;
