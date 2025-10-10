# 📋 Migration Manual - Campos de Case

## ⚠️ ATENÇÃO
A migration SQL precisa ser executada **manualmente** no Supabase Dashboard porque o JavaScript client não permite executar comandos DDL (ALTER TABLE).

## 🔗 Como Executar

### Passo 1: Acessar Supabase Dashboard
1. Acesse: https://supabase.com/dashboard
2. Faça login
3. Selecione seu projeto: `xjnjfytapohglezpwksf`

### Passo 2: Abrir SQL Editor
1. No menu lateral, clique em **SQL Editor**
2. Clique em **New Query**

### Passo 3: Copiar e Colar o SQL Abaixo

```sql
-- ============================================
-- Migration: Adicionar campos para entrega de case
-- Data: 2025-01-10
-- ============================================

-- 1. ADICIONAR CAMPOS EM aura_jobs_candidatos
ALTER TABLE aura_jobs_candidatos
ADD COLUMN IF NOT EXISTS url_entregavel_1 TEXT,
ADD COLUMN IF NOT EXISTS url_entregavel_2 TEXT,
ADD COLUMN IF NOT EXISTS url_video TEXT,
ADD COLUMN IF NOT EXISTS data_envio_case TIMESTAMP;

-- 2. ADICIONAR CAMPO EM aura_jobs_vagas
ALTER TABLE aura_jobs_vagas
ADD COLUMN IF NOT EXISTS case_link_notion TEXT;

-- 3. CRIAR ÍNDICE PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_candidatos_case_enviado
ON aura_jobs_candidatos(data_envio_case)
WHERE data_envio_case IS NOT NULL;
```

### Passo 4: Executar
1. Clique no botão **Run** (ou pressione `Ctrl+Enter` / `Cmd+Enter`)
2. Aguarde a execução
3. Você deve ver: **Success. No rows returned**

### Passo 5: Verificar
Execute esta query para confirmar que as colunas foram criadas:

```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'aura_jobs_candidatos'
  AND column_name IN ('url_entregavel_1', 'url_entregavel_2', 'url_video', 'data_envio_case')
ORDER BY column_name;
```

Você deve ver 4 linhas retornadas.

Para verificar a tabela de vagas:

```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'aura_jobs_vagas'
  AND column_name = 'case_link_notion';
```

Você deve ver 1 linha retornada.

## ✅ Pronto!
Após executar, as colunas estarão criadas e você pode continuar com a implementação do sistema de formulários por vaga.
