# Configuração do Supabase para AutoU Jobs

Este documento contém todas as instruções para configurar o Supabase corretamente para o sistema AutoU Jobs.

## 1. Criar Projeto no Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Crie uma nova conta ou faça login
3. Crie um novo projeto
4. Anote a **URL** e **anon key** do projeto

## 2. Configurar Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima
```

## 3. Executar Scripts de Configuração

### 3.1 Criar Schema Principal

No **SQL Editor** do Supabase, execute o arquivo `supabase_schema.sql`:

```sql
-- Cole todo o conteúdo do arquivo supabase_schema.sql aqui
```

### 3.2 Configurar Storage

No **SQL Editor** do Supabase, execute o arquivo `setup_storage.sql`:

```sql
-- Cole todo o conteúdo do arquivo setup_storage.sql aqui
```

### 3.3 Criar Bucket Manualmente (se necessário)

Caso o script não funcione, crie manualmente:

1. Vá para **Storage** no painel do Supabase
2. Clique em **New bucket**
3. Nome: `candidatos`
4. **Public**: `false` (privado)
5. Clique em **Create bucket**

### 3.4 Inserir Dados de Exemplo

No **SQL Editor** do Supabase, execute o arquivo `seed_vagas.sql`:

```sql
-- Cole todo o conteúdo do arquivo seed_vagas.sql aqui
```

## 4. Configurar Políticas de RLS

As políticas já estão incluídas no `supabase_schema.sql`, mas verifique se estão ativas:

### 4.1 Verificar RLS Ativo

```sql
-- Verificar se RLS está ativo em todas as tabelas
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename LIKE 'aura_jobs_%';
```

### 4.2 Listar Políticas

```sql
-- Listar todas as políticas criadas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename LIKE 'aura_jobs_%';
```

## 5. Configurar Autenticação (Opcional)

Para usar autenticação completa:

1. Vá para **Authentication** > **Settings**
2. Configure **Site URL**: `http://localhost:3000`
3. Configure **Redirect URLs**: `http://localhost:3000/auth/callback`

## 6. Testar Sistema

### 6.1 Testar Listagem de Vagas

1. Inicie o projeto: `npm run dev`
2. Acesse: `http://localhost:3000/candidato/vagas`
3. Deve mostrar as 5 vagas criadas

### 6.2 Testar Inscrição

1. Clique em uma vaga
2. Clique em "Candidatar-se"
3. Preencha o formulário completo
4. Faça upload de um PDF como currículo
5. Clique em "Enviar Candidatura"

### 6.3 Verificar Storage

1. Vá para **Storage** > **candidatos** no Supabase
2. Deve aparecer o arquivo enviado

### 6.4 Verificar Dados

```sql
-- Verificar candidatos criados
SELECT nome_completo, email, vaga_id, status, data_inscricao 
FROM aura_jobs_candidatos 
ORDER BY data_inscricao DESC;
```

## 7. Estrutura das Tabelas

### Principais Tabelas Criadas:

- **aura_jobs_usuarios**: Admins e avaliadores
- **aura_jobs_vagas**: Vagas disponíveis  
- **aura_jobs_candidatos**: Candidaturas recebidas
- **aura_jobs_avaliacoes**: Avaliações dos candidatos
- **aura_jobs_historico_status**: Log de mudanças de status
- **aura_jobs_notificacoes**: Log de emails enviados

### Storage:

- **Bucket "candidatos"**: Currículos e cartas de apresentação

## 8. Troubleshooting

### Erro "Bucket not found"

1. Execute `setup_storage.sql`
2. Ou crie manualmente o bucket "candidatos"
3. Certifique-se que as políticas de storage estão ativas

### Erro "RLS policy violation"

1. Verifique se as políticas foram criadas corretamente
2. Para testes, pode temporariamente desabilitar RLS:

```sql
-- CUIDADO: Apenas para testes locais
ALTER TABLE aura_jobs_vagas DISABLE ROW LEVEL SECURITY;
ALTER TABLE aura_jobs_candidatos DISABLE ROW LEVEL SECURITY;
```

### Erro de permissão no upload

1. Verifique se o bucket existe
2. Verifique se as políticas de storage foram criadas
3. Teste com RLS desabilitado temporariamente

## 9. Próximos Passos

Após configurar tudo:

1. ✅ Sistema de candidaturas funcionando
2. ✅ Upload de arquivos funcionando  
3. ✅ Dados sendo salvos corretamente

Para produção:

1. Configure domínio personalizado no Supabase
2. Configure SMTP para envio de emails
3. Configure backup automático
4. Configure monitoramento

---

**Importante**: Mantenha suas chaves do Supabase em segurança e nunca commite arquivos `.env` no Git!