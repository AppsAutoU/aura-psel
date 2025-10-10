# 🚀 EXECUTAR MIGRATION COMPLETA - Sistema de Cases

## ⚠️ IMPORTANTE
Esta migration corrige **TODOS OS 5 ERROS** identificados no sistema de entrega de cases.

---

## 📋 O QUE ESTA MIGRATION FAZ

✅ **Adiciona colunas faltantes:**
- `aura_jobs_candidatos`: `url_entregavel_1`, `url_entregavel_2`, `url_video`, `data_envio_case`, `comentarios_adicionais`
- `aura_jobs_vagas`: `case_link_notion`, `prazo_case_dias`, `tipo_vaga`

✅ **Popula automaticamente case_link_notion em TODAS as vagas existentes** baseado no título

✅ **Cria triggers para auto-população em vagas novas** - Admin não precisa mais preencher manualmente!

✅ **Adiciona índices para performance**

✅ **Inclui queries de verificação automática** - você verá os resultados na tela!

---

## 🔗 PASSO A PASSO

### 1️⃣ Acessar Supabase Dashboard
1. Acesse: https://supabase.com/dashboard
2. Faça login
3. Selecione seu projeto: `xjnjfytapohglezpwksf`

### 2️⃣ Abrir SQL Editor
1. No menu lateral, clique em **SQL Editor**
2. Clique em **New Query**

### 3️⃣ Copiar e Executar o SQL
1. Abra o arquivo: `/supabase/migrations/20250110_fix_complete_case_system.sql`
2. Copie **TODO O CONTEÚDO** do arquivo
3. Cole no SQL Editor do Supabase
4. Clique em **Run** (ou pressione `Cmd+Enter`)

### 4️⃣ Aguardar Execução
- Você verá várias mensagens de `NOTICE` aparecerem
- Ao final, você deve ver várias tabelas de verificação mostrando:
  - ✅ Colunas criadas em `aura_jobs_candidatos`
  - ✅ Colunas criadas em `aura_jobs_vagas`
  - ✅ Todas as vagas com `case_link_notion` populado
  - ✅ Contagem de vagas por tipo
  - ✅ Quantidade de vagas sem `case_link_notion` = **0**

### 5️⃣ Verificar Resultado Final
Você deve ver algo como:

```
✅ MIGRATION COMPLETA EXECUTADA COM SUCESSO!
✅ Todas as colunas foram criadas
✅ Todas as vagas foram populadas com case_link_notion
✅ Triggers criados para auto-população em novas vagas
✅ Sistema 100% funcional!
```

---

## 🎯 RESULTADO ESPERADO

### **ANTES** (Quebrado):
❌ case_link_notion = NULL em todas as vagas
❌ Erro: `column prazo_case_dias does not exist`
❌ Erro: `column tipo_vaga does not exist`
❌ Entregáveis NULL mesmo com status case_enviado
❌ Admin precisa preencher case_link_notion manualmente

### **DEPOIS** (Funcionando):
✅ Todas as vagas com case_link_notion correto
✅ Colunas prazo_case_dias e tipo_vaga existem
✅ Portal Avaliador funciona sem erros
✅ Novas vagas recebem case_link_notion automaticamente
✅ Admin só preenche manualmente se for case customizado
✅ Sistema 100% funcional de ponta a ponta

---

## 🔍 COMO TESTAR APÓS A MIGRATION

### Teste 1: Verificar Vagas Existentes
```sql
SELECT id, titulo, case_link_notion, tipo_vaga, prazo_case_dias
FROM aura_jobs_vagas
ORDER BY created_at DESC
LIMIT 5;
```
**Esperado:** TODAS as vagas devem ter `case_link_notion` preenchido

### Teste 2: Criar Vaga Nova (Teste de Trigger)
1. Vá em Admin → Vagas
2. Crie uma vaga com título "Desenvolvedor Frontend"
3. **NÃO preencha** o campo "Link do Case Prático"
4. Salve a vaga
5. Verifique no banco:
```sql
SELECT titulo, case_link_notion, tipo_vaga
FROM aura_jobs_vagas
WHERE titulo ILIKE '%frontend%';
```
**Esperado:** case_link_notion e tipo_vaga devem estar preenchidos automaticamente!

### Teste 3: Fluxo Completo End-to-End
1. ✅ Admin cria vaga → case_link_notion auto-populated
2. ✅ Candidato se inscreve
3. ✅ Admin avalia candidato → IA aprova
4. ✅ Email enviado com link correto do case
5. ✅ Candidato aparece automaticamente em "Cases Práticos A Avaliar" com status "Aguardando entrega"
6. ✅ Candidato preenche formulário de entrega
7. ✅ Entregáveis aparecem no Portal Avaliador
8. ✅ Avaliador pode avaliar o case

---

## ⚠️ TROUBLESHOOTING

### Se aparecer erro "relation already exists"
✅ **Isso é NORMAL!** Significa que algumas colunas já existiam.
A migration usa `IF NOT EXISTS` então é seguro executar múltiplas vezes.

### Se alguma vaga ainda tiver case_link_notion NULL
Execute manualmente:
```sql
UPDATE aura_jobs_vagas
SET case_link_notion = 'https://www.notion.so/autou-digital/Case-Pr-tico-AutoU-Desenvolvimento-18836ce78e5580d0b59bcf9610b27769',
    tipo_vaga = 'desenvolvimento'
WHERE case_link_notion IS NULL;
```

### Se quiser reexecutar TUDO do zero
Você pode executar a migration quantas vezes quiser. Ela é **idempotente** (seguro executar múltiplas vezes).

---

## 📞 SUPORTE

Se algo der errado, envie:
1. Screenshot do erro no SQL Editor
2. Resultado desta query:
```sql
SELECT column_name FROM information_schema.columns
WHERE table_name = 'aura_jobs_vagas'
AND column_name IN ('case_link_notion', 'prazo_case_dias', 'tipo_vaga');
```
3. Resultado desta query:
```sql
SELECT COUNT(*) as total,
       COUNT(case_link_notion) as com_link
FROM aura_jobs_vagas;
```

---

## ✅ PRONTO!

Após executar esta migration, o sistema estará **100% funcional** de ponta a ponta! 🎉
