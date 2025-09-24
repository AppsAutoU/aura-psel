-- ⚡ SOLUÇÃO FINAL: CRIAR ADMIN DIRETAMENTE NO BANCO
-- O problema é erro 500 interno do Supabase Auth
-- Vamos criar o usuário direto nas tabelas do banco

-- 1. Primeiro, garantir que não há restrições
ALTER TABLE IF EXISTS auth.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE aura_jobs_usuarios DISABLE ROW LEVEL SECURITY;

-- 2. Limpar qualquer usuário existente com esse email
DELETE FROM aura_jobs_usuarios WHERE email = 'admin@autou.com.br';
DELETE FROM auth.users WHERE email = 'admin@autou.com.br';

-- 3. Criar UUID fixo para o admin
DO $$
DECLARE
    admin_id uuid := '11111111-1111-1111-1111-111111111111';
BEGIN
    -- Inserir na tabela auth.users (sistema interno do Supabase)
    INSERT INTO auth.users (
        id,
        instance_id,
        email,
        encrypted_password,
        email_confirmed_at,
        raw_app_meta_data,
        raw_user_meta_data,
        created_at,
        updated_at,
        confirmation_token,
        recovery_token,
        email_change_token_new,
        role,
        aud
    ) VALUES (
        admin_id,
        '00000000-0000-0000-0000-000000000000',
        'admin@autou.com.br',
        crypt('admin123456', gen_salt('bf')),
        now(),
        '{"provider": "email", "providers": ["email"]}',
        '{"nome_completo": "Admin AutoU"}',
        now(),
        now(),
        '',
        '',
        '',
        'authenticated',
        'authenticated'
    );

    -- Inserir na nossa tabela de usuários
    INSERT INTO aura_jobs_usuarios (
        id,
        email,
        nome_completo,
        role,
        departamento,
        cargo,
        ativo,
        created_at,
        updated_at
    ) VALUES (
        admin_id,
        'admin@autou.com.br',
        'Admin AutoU',
        'admin',
        'TI',
        'Administrator', 
        true,
        now(),
        now()
    );

    RAISE NOTICE 'Admin criado com sucesso!';
    RAISE NOTICE 'Email: admin@autou.com.br';
    RAISE NOTICE 'Senha: admin123456';
    RAISE NOTICE 'ID: %', admin_id;
END $$;

-- 4. Verificar se foi criado
SELECT 'AUTH USERS:' as tabela, email, email_confirmed_at, created_at 
FROM auth.users 
WHERE email = 'admin@autou.com.br';

SELECT 'NOSSA TABELA:' as tabela, email, nome_completo, role, ativo 
FROM aura_jobs_usuarios 
WHERE email = 'admin@autou.com.br';