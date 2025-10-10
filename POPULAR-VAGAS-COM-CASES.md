# 📋 Popular Vagas Existentes com Links dos Cases

## ⚠️ EXECUTAR NO SUPABASE DASHBOARD

Este script atualiza as vagas existentes com os links corretos dos cases do Notion.

---

## 🔗 Links dos Cases

- **Product Designer/PO**: https://www.notion.so/autou-digital/Case-Pr-tico-AutoU-Product-Designer-PO-20d36ce78e5580a5a8f7ce7693d4bfce
- **Desenvolvimento**: https://www.notion.so/autou-digital/Case-Pr-tico-AutoU-Desenvolvimento-18836ce78e5580d0b59bcf9610b27769
- **Consultoria**: https://www.notion.so/autou-digital/Case-Pr-tico-AutoU-Consultoria-1ff36ce78e5580f5a410c5393d227bfe

---

## 📝 SQL para Executar

### Passo 1: Verificar Vagas Existentes

Primeiro, veja quais vagas existem:

```sql
SELECT id, titulo, vaga_key, case_link_notion
FROM aura_jobs_vagas
ORDER BY created_at DESC;
```

---

### Passo 2: Atualizar Vagas

Copie e execute o SQL abaixo no **SQL Editor** do Supabase:

```sql
-- =================================================
-- Atualizar vagas existentes com links dos cases
-- =================================================

-- 1. UX/UI Designer → Case de Product Designer/PO
UPDATE aura_jobs_vagas
SET case_link_notion = 'https://www.notion.so/autou-digital/Case-Pr-tico-AutoU-Product-Designer-PO-20d36ce78e5580a5a8f7ce7693d4bfce'
WHERE titulo ILIKE '%UX%' OR titulo ILIKE '%UI%' OR titulo ILIKE '%Designer%';

-- 2. Product Manager → Case de Product Designer/PO
UPDATE aura_jobs_vagas
SET case_link_notion = 'https://www.notion.so/autou-digital/Case-Pr-tico-AutoU-Product-Designer-PO-20d36ce78e5580a5a8f7ce7693d4bfce'
WHERE titulo ILIKE '%Product Manager%' OR titulo ILIKE '%PO%' OR titulo ILIKE '%Product Owner%';

-- 3. Desenvolvedor → Case de Desenvolvimento
UPDATE aura_jobs_vagas
SET case_link_notion = 'https://www.notion.so/autou-digital/Case-Pr-tico-AutoU-Desenvolvimento-18836ce78e5580d0b59bcf9610b27769'
WHERE titulo ILIKE '%Desenvolvedor%' OR titulo ILIKE '%Developer%' OR titulo ILIKE '%Frontend%' OR titulo ILIKE '%Backend%' OR titulo ILIKE '%Full Stack%';

-- 4. Analista de Dados → Case de Consultoria
UPDATE aura_jobs_vagas
SET case_link_notion = 'https://www.notion.so/autou-digital/Case-Pr-tico-AutoU-Consultoria-1ff36ce78e5580f5a410c5393d227bfe'
WHERE titulo ILIKE '%Analista%' OR titulo ILIKE '%Dados%' OR titulo ILIKE '%Data%' OR titulo ILIKE '%Consultor%';
```

---

### Passo 3: Verificar Se Funcionou

Execute novamente para ver os resultados:

```sql
SELECT id, titulo, vaga_key, case_link_notion
FROM aura_jobs_vagas
WHERE case_link_notion IS NOT NULL
ORDER BY created_at DESC;
```

Você deve ver as vagas com os links preenchidos!

---

## 📊 Exemplo de Resultado Esperado

| titulo | vaga_key | case_link_notion |
|--------|----------|------------------|
| UX/UI Designer | ux-ui-designer-2024 | https://notion.so/.../Product-Designer... |
| Desenvolvedor Frontend | dev-frontend-senior-2024 | https://notion.so/.../Desenvolvimento... |
| Product Manager | product-manager-2024 | https://notion.so/.../Product-Designer... |
| Analista de Dados Júnior | analista-dados-junior-2024 | https://notion.so/.../Consultoria... |

---

## ✅ Pronto!

Após executar, todas as vagas terão o link correto do case. Quando a IA aprovar um candidato, o email enviará o case certo automaticamente! 🚀
