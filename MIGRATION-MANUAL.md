# 🚀 Migration Manual - Sistema de Avaliadores

## ⚠️ IMPORTANTE: Execute este SQL no Supabase Dashboard

Como a API não consegue executar DDL (Data Definition Language) commands, você precisa executar manualmente no Supabase.

---

## 📋 PASSO A PASSO:

### 1. Acesse o Supabase Dashboard
- Vá para: https://supabase.com/dashboard
- Faça login
- Selecione seu projeto **aura-psel**

### 2. Abra o SQL Editor
- No menu lateral esquerdo, clique em **"SQL Editor"** (ícone <>)
- Clique em **"+ New query"** (botão verde no topo)

### 3. Cole o SQL abaixo
Copie TODO o código SQL abaixo e cole no editor:

```sql
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- Migration: Sistema de Avaliadores Especializados
-- Data: 2025-01-10
-- Descrição: Adiciona tipos de avaliador e sistema de filtragem por especialização
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- 1. Adicionar campos na tabela de usuários para especialização de avaliadores
ALTER TABLE aura_jobs_usuarios
ADD COLUMN IF NOT EXISTS tipo_avaliador VARCHAR(50) CHECK (tipo_avaliador IN ('desenvolvimento', 'design', 'consultoria', 'generalista')),
ADD COLUMN IF NOT EXISTS pode_avaliar_tudo BOOLEAN DEFAULT FALSE;

-- 2. Adicionar campo tipo_vaga na tabela de vagas
ALTER TABLE aura_jobs_vagas
ADD COLUMN IF NOT EXISTS tipo_vaga VARCHAR(50) CHECK (tipo_vaga IN ('desenvolvimento', 'design', 'consultoria'));

-- 3. Criar tabela de atribuição de avaliadores a vagas (N:N)
CREATE TABLE IF NOT EXISTS aura_jobs_avaliador_vagas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  avaliador_id UUID NOT NULL REFERENCES aura_jobs_usuarios(id) ON DELETE CASCADE,
  vaga_id UUID NOT NULL REFERENCES aura_jobs_vagas(id) ON DELETE CASCADE,
  atribuido_por UUID REFERENCES aura_jobs_usuarios(id),
  atribuido_em TIMESTAMP DEFAULT NOW(),
  UNIQUE(avaliador_id, vaga_id)
);

-- 4. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_usuarios_tipo_avaliador ON aura_jobs_usuarios(tipo_avaliador);
CREATE INDEX IF NOT EXISTS idx_vagas_tipo_vaga ON aura_jobs_vagas(tipo_vaga);
CREATE INDEX IF NOT EXISTS idx_avaliador_vagas_avaliador ON aura_jobs_avaliador_vagas(avaliador_id);
CREATE INDEX IF NOT EXISTS idx_avaliador_vagas_vaga ON aura_jobs_avaliador_vagas(vaga_id);

-- 5. Comentários para documentação
COMMENT ON COLUMN aura_jobs_usuarios.tipo_avaliador IS 'Tipo de especialização do avaliador: desenvolvimento, design, consultoria ou generalista';
COMMENT ON COLUMN aura_jobs_usuarios.pode_avaliar_tudo IS 'Se TRUE, avaliador pode ver e avaliar candidatos de qualquer tipo de vaga';
COMMENT ON COLUMN aura_jobs_vagas.tipo_vaga IS 'Tipo da vaga para filtrar avaliadores especializados';
COMMENT ON TABLE aura_jobs_avaliador_vagas IS 'Tabela de atribuição manual de avaliadores a vagas específicas';

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- FIM DA MIGRATION
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 4. Execute o SQL
- Clique no botão **"Run"** (▶️) no canto inferior direito
- Aguarde a execução (deve levar 1-2 segundos)

### 5. Verifique os resultados
Você deve ver mensagens como:
```
✓ ALTER TABLE
✓ ALTER TABLE
✓ CREATE TABLE
✓ CREATE INDEX
✓ CREATE INDEX
✓ CREATE INDEX
✓ CREATE INDEX
✓ COMMENT
✓ COMMENT
✓ COMMENT
✓ COMMENT
```

---

## ✅ DEPOIS DA MIGRATION

1. **Acesse o Admin**:
   ```
   http://localhost:3000/admin
   ```

2. **Clique em "👨‍⚖️ Avaliadores"** no menu lateral

3. **Crie seu primeiro avaliador de teste**:
   - Nome: Seu nome
   - Email: Seu email
   - Tipo: Desenvolvimento (ou outro)
   - Pode avaliar tudo: ✓ (marque para teste)

4. **Configure uma vaga**:
   - Vá em Admin > Vagas
   - Edite uma vaga existente
   - Defina tipo_vaga = "desenvolvimento"

5. **Teste o filtro**:
   - Faça logout e login novamente
   - Acesse o Portal Avaliador
   - Você deve ver apenas candidatos filtrados!

---

## 🆘 EM CASO DE ERRO

### Erro: "relation aura_jobs_usuarios does not exist"
- Verifique se você está no projeto correto no Supabase
- Confirme que as tabelas foram criadas anteriormente

### Erro: "column already exists"
- Tudo bem! Significa que a coluna já foi criada antes
- Pode ignorar e continuar

### Erro: "permission denied"
- Você precisa ter permissões de admin no Supabase
- Verifique se está usando a conta correta

---

## 📞 PRECISA DE AJUDA?

Se tiver qualquer problema, me avise e eu te ajudo!
