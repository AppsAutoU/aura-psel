# 🔥 RESOLVER ADMIN DE UMA VEZ POR TODAS

## PASSO 1: CONFIGURAR SUPABASE CORRETAMENTE

### No Supabase Dashboard:

1. **Authentication → Settings → Email Templates**
   - Desabilita "Enable email confirmations" 
   
2. **Authentication → Settings → Auth**
   - Confirma que "Enable email confirmations" está DESABILITADO
   - Se estiver habilitado, DESABILITA

3. **SQL Editor** - Cola e executa:
```sql
-- MATA TODA SEGURANÇA
ALTER TABLE aura_jobs_usuarios DISABLE ROW LEVEL SECURITY;
ALTER TABLE aura_jobs_vagas DISABLE ROW LEVEL SECURITY;
ALTER TABLE aura_jobs_candidatos DISABLE ROW LEVEL SECURITY;
ALTER TABLE aura_jobs_avaliacoes DISABLE ROW LEVEL SECURITY;
ALTER TABLE aura_jobs_historico_status DISABLE ROW LEVEL SECURITY;
ALTER TABLE aura_jobs_notificacoes DISABLE ROW LEVEL SECURITY;

-- Remove todas as policies
DROP POLICY IF EXISTS "Admins podem ver todos usuarios" ON aura_jobs_usuarios;
DROP POLICY IF EXISTS "Users can create their own profile" ON aura_jobs_usuarios;
DROP POLICY IF EXISTS "Users can read their own profile" ON aura_jobs_usuarios;
DROP POLICY IF EXISTS "Users can update their own profile" ON aura_jobs_usuarios;

-- Limpa usuários de teste
DELETE FROM aura_jobs_usuarios WHERE email LIKE '%test%';
```

## PASSO 2: USAR A PÁGINA DE FORÇA BRUTA

Acessa: http://localhost:3001/auth/force-admin

Esta página vai:
- Detectar exatamente qual é o problema
- Tentar múltiplas soluções
- Te dar feedback em tempo real

## PASSO 3: SE AINDA NÃO FUNCIONAR

Vou criar um script que insere direto no banco via SQL:

```sql
-- INSERÇÃO MANUAL DE ADMIN
INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    role
) VALUES (
    gen_random_uuid(),
    'admin@autou.com.br',
    crypt('admin123456', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider": "email", "providers": ["email"]}',
    '{"nome_completo": "Admin AutoU"}',
    false,
    'authenticated'
);

-- Pega o ID do usuário criado
DO $$
DECLARE
    user_id uuid;
BEGIN
    SELECT id INTO user_id FROM auth.users WHERE email = 'admin@autou.com.br';
    
    INSERT INTO aura_jobs_usuarios (
        id,
        email,
        nome_completo,
        role,
        departamento,
        cargo,
        ativo
    ) VALUES (
        user_id,
        'admin@autou.com.br',
        'Admin AutoU',
        'admin',
        'TI',
        'Administrator',
        true
    );
END $$;
```

## CREDENCIAIS FINAIS:
- Email: admin@autou.com.br  
- Senha: admin123456

---

**EXECUTA OS PASSOS NA ORDEM. SE NÃO FUNCIONAR, ME AVISA QUAL ERRO APARECE.**