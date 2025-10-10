# 🎯 Sistema de Formulários de Case por Vaga - IMPLEMENTAÇÃO COMPLETA

## ✅ O QUE FOI IMPLEMENTADO

Sistema completo onde cada vaga tem seu próprio formulário de entrega de case, enviado por email quando o candidato é aprovado pela IA.

---

## 📋 ANTES DE USAR - EXECUTAR MIGRATION

### ⚠️ PASSO OBRIGATÓRIO: Executar SQL no Supabase

**Você PRECISA executar a migration SQL manualmente antes de usar o sistema.**

1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em **SQL Editor** → **New Query**
4. Copie e cole o SQL do arquivo: `MIGRATION-CASE-MANUAL.md`
5. Clique em **Run**

**O que a migration faz:**
- Adiciona `url_entregavel_1`, `url_entregavel_2`, `url_video` em `aura_jobs_candidatos`
- Adiciona `case_link_notion` em `aura_jobs_vagas`
- Cria índices para performance

---

## 🔄 FLUXO COMPLETO

```
1. Admin cria vaga no Portal Admin
   ↓ Preenche campo "Link do Case Prático (Notion)"

2. Candidato se inscreve na vaga
   ↓ Preenche formulário /inscricao/[vaga_key]

3. IA avalia candidato automaticamente
   ↓ Se score >= 7 → APROVADO

4. Email automático enviado ao candidato
   ├─ Link do Notion (enunciado do case)
   └─ Link do formulário de entrega: /case/entregar/[vaga_key]

5. Candidato acessa formulário e preenche:
   ├─ Email (mesma da inscrição)
   ├─ Link Entregável 1 (ex: GitHub, Figma)
   ├─ Link Entregável 2 (opcional)
   ├─ Link Vídeo (opcional)
   └─ Comentários (opcional)

6. Dados salvos direto em aura_jobs_candidatos
   ├─ status = 'case_enviado'
   ├─ url_entregavel_1, url_entregavel_2, url_video
   └─ data_envio_case = NOW()

7. Portal Avaliador mostra candidatos
   ├─ Filtra por tipo de avaliador
   └─ Exibe links clicáveis dos entregáveis

8. Avaliador clica e avalia o case
```

---

## 📁 ARQUIVOS CRIADOS/MODIFICADOS

### **✅ Criados:**

1. `/supabase/migrations/20250110_add_case_entrega_fields.sql`
   - Migration SQL com as alterações no banco

2. `/MIGRATION-CASE-MANUAL.md`
   - Instruções para executar migration manualmente

3. `/src/lib/email/templates/case-aprovado.ts`
   - Template de email profissional com 2 links (Notion + Formulário)

4. `/src/app/case/entregar/[vaga_key]/page.tsx`
   - Formulário de entrega de case por vaga

5. `/src/app/api/case/entregar/[vaga_key]/route.ts`
   - API que recebe entrega e atualiza candidato

### **✅ Modificados:**

1. `/src/types/database.types.ts`
   - Interface `Vaga`: + `case_link_notion`
   - Interface `Candidato`: + `url_entregavel_1`, `url_entregavel_2`, `url_video`, `comentarios_adicionais`

2. `/src/app/admin/vagas/page.tsx`
   - Campo "Link do Case Prático (Notion)" no formulário de criar/editar vaga

3. `/src/app/api/ai/avaliar-candidato/route.ts`
   - Busca `case_link_notion` e `vaga_key` da vaga
   - Usa novo template de email com 2 links separados
   - Gera link do formulário: `${APP_URL}/case/entregar/${vaga_key}`

4. `/src/app/avaliador/page.tsx`
   - Query busca `url_entregavel_1`, `url_entregavel_2`, `url_video`
   - Exibe entregáveis clicáveis no modal de avaliação

---

## 🎨 INTERFACE DO ADMIN

Ao criar/editar vaga, agora tem o campo:

```
┌─────────────────────────────────────────────────┐
│ Link do Case Prático (Notion)                  │
│ ┌─────────────────────────────────────────────┐ │
│ │ https://notion.so/autou-digital/...        │ │
│ └─────────────────────────────────────────────┘ │
│ 📖 Link do Notion com o enunciado do case.     │
│    Será enviado por email aos candidatos       │
│    aprovados pela IA.                           │
└─────────────────────────────────────────────────┘
```

---

## 📧 EMAIL ENVIADO AO CANDIDATO

### Assunto:
`Você foi aprovado! 🎉 - [Nome da Vaga]`

### Conteúdo:
- Header bonito com gradiente
- Parabéns pela aprovação
- 3 passos claros:
  1. **Leia o Case**: Link para Notion
  2. **Desenvolva**: Prazo D+5 (ou configurado)
  3. **Envie**: Link do formulário `/case/entregar/[vaga_key]`

- Dicas importantes
- Prazo destacado em amarelo

---

## 📝 FORMULÁRIO DE ENTREGA

### URL:
`/case/entregar/[vaga_key]`

**Exemplo:**
- Vaga: "Desenvolvedor Frontend" → `vaga_key: dev-frontend-2025`
- Link: `https://seudominio.com/case/entregar/dev-frontend-2025`

### Campos:
- **Email*** (validado - deve ser o mesmo da inscrição)
- **Link Entregável 1** (GitHub, Figma, Drive, etc)
- **Link Entregável 2** (opcional)
- **Link Vídeo** (YouTube, Loom, Vimeo)
- **Comentários Adicionais** (textarea)

### Validações:
- Email obrigatório
- Pelo menos 1 entregável (link ou vídeo)
- Candidato precisa estar inscrito na vaga
- Busca exata: `email + vaga_id`

---

## 👀 PORTAL AVALIADOR

### O que mudou:

**Lista de candidatos:**
- Ordenados por `data_envio_case` (mais recentes primeiro)

**Modal de avaliação:**
- Exibe 3 cenários:

1. **Se tem entrega antiga** (tabela `aura_jobs_case_entregas`):
   - Mostra links do sistema antigo

2. **Se tem entrega nova** (campos em `aura_jobs_candidatos`):
   - ✅ Badge "Case Entregue"
   - Data/hora da entrega
   - 📎 Entregável 1 (link clicável)
   - 📎 Entregável 2 (link clicável)
   - 🎥 Vídeo (link clicável)
   - 💬 Comentários do candidato

3. **Se não tem entrega**:
   - ⏳ "Aguardando Resposta do Candidato"

---

## 🔐 SEGURANÇA

### API `/api/case/entregar/[vaga_key]`:

✅ Valida email
✅ Busca vaga pelo `vaga_key`
✅ Busca candidato exato: `WHERE email = ? AND vaga_id = ?`
✅ Retorna erro 404 se candidato não encontrado
✅ Atualiza apenas o candidato correto

**Não permite:**
- Candidato enviar case para vaga que não se inscreveu
- Candidato usar email diferente
- Enviar sem pelo menos 1 entregável

---

## 🚀 COMO USAR (PASSO A PASSO)

### 1. EXECUTAR MIGRATION (OBRIGATÓRIO)
Ver seção "ANTES DE USAR" acima.

### 2. CRIAR VAGA COM LINK DO NOTION

1. Acesse: `/admin/vagas`
2. Clique "Nova Vaga"
3. Preencha todos os campos
4. **IMPORTANTE:** Preencha "Link do Case Prático (Notion)"
   - Exemplo: `https://www.notion.so/autou-digital/Case-Desenvolvimento-xxx`
5. Defina "Prazo do Case" (ex: 5 dias)
6. Salvar

### 3. CANDIDATO SE INSCREVE

- Acessa `/inscricao/[vaga_key]`
- Preenche formulário de inscrição
- Aguarda avaliação da IA

### 4. IA AVALIA E ENVIA EMAIL

- Automático quando score >= 7
- Email com 2 links:
  - Notion (enunciado)
  - Formulário (entrega)

### 5. CANDIDATO ENTREGA CASE

- Acessa link do email: `/case/entregar/[vaga_key]`
- Preenche formulário
- Envia

### 6. AVALIADOR VÊ E AVALIA

- Acessa `/avaliador`
- Vê candidato na lista
- Clica "Avaliar"
- Vê todos os links clicáveis
- Preenche avaliação

---

## ❓ FAQ

### **P: E se a vaga não tiver `case_link_notion` configurado?**
R: O sistema usa fallback automático baseado no título da vaga (links antigos do Notion).

### **P: E se o candidato estiver em 2+ vagas?**
R: O formulário usa `vaga_key` na URL, então cada entrega é vinculada à vaga correta. Sem conflitos!

### **P: O formulário antigo `/case/entregar` ainda funciona?**
R: Sim, mas ele tem o problema de não saber qual vaga quando candidato tem múltiplas inscrições. Use o novo: `/case/entregar/[vaga_key]`

### **P: Os entregáveis antigos (JSON) ainda funcionam?**
R: Sim! O Portal Avaliador suporta ambos os sistemas. Mostra entregáveis de qualquer fonte.

### **P: Como testar?**
R:
1. Crie uma vaga de teste
2. Inscreva-se com seu email
3. Force avaliação IA (score >= 7)
4. Receba email
5. Acesse link do formulário
6. Entregue case
7. Vá no Portal Avaliador

---

## 🐛 TROUBLESHOOTING

### **Erro: "Vaga não encontrada"**
- Verifique se o `vaga_key` na URL está correto
- Verifique se a vaga existe e está ativa

### **Erro: "Candidato não encontrado"**
- Candidato não se inscreveu nessa vaga
- Email diferente do usado na inscrição
- Verifique se `vaga_id` no banco está correto

### **Email não foi enviado**
- Verifique variáveis de ambiente: `EMAIL_USER`, `EMAIL_PASSWORD`
- Veja console da API para erros
- Verifique se IA aprovou (score >= 7)

### **Entregáveis não aparecem no Portal Avaliador**
- Execute a migration SQL
- Verifique se colunas foram criadas: `url_entregavel_1`, etc
- Veja console do navegador para erros

---

## 📊 BANCO DE DADOS

### Tabela: `aura_jobs_candidatos`

**Novos campos:**
```sql
url_entregavel_1      TEXT      -- Link do primeiro entregável
url_entregavel_2      TEXT      -- Link do segundo entregável
url_video             TEXT      -- Link do vídeo
comentarios_adicionais TEXT     -- Comentários do candidato
data_envio_case       TIMESTAMP -- Data/hora do envio
```

### Tabela: `aura_jobs_vagas`

**Novo campo:**
```sql
case_link_notion TEXT -- Link do Notion com o case
```

---

## ✅ CHECKLIST DE TESTES

- [ ] Migration SQL executada
- [ ] Colunas criadas no banco
- [ ] Vaga criada com `case_link_notion`
- [ ] Candidato se inscreve
- [ ] IA avalia e aprova
- [ ] Email recebido com 2 links
- [ ] Link do Notion abre correto
- [ ] Link do formulário funciona
- [ ] Formulário carrega vaga correta
- [ ] Entrega salva no banco
- [ ] Portal Avaliador mostra entregáveis
- [ ] Links são clicáveis
- [ ] Avaliação funciona normalmente

---

## 🎉 CONCLUSÃO

Sistema completo implementado! Cada vaga agora tem:
- ✅ Link próprio do Notion
- ✅ Formulário exclusivo de entrega
- ✅ Email automático profissional
- ✅ Suporte a múltiplas vagas por candidato
- ✅ Portal Avaliador atualizado

**Próximos passos:**
1. Executar migration SQL
2. Testar com vaga real
3. Configurar links do Notion para cada tipo de vaga
4. Treinar admins para preencher `case_link_notion`
