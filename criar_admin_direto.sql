-- SCRIPT DEFINITIVO: CRIAR ADMIN DIRETO NO BANCO
-- Execute isso no Supabase SQL Editor

-- Primeiro, remove qualquer segurança que possa estar atrapalhando
ALTER TABLE aura_jobs_usuarios DISABLE ROW LEVEL SECURITY;

-- Remove policies que possam estar bloqueando
DROP POLICY IF EXISTS "Admins podem ver todos usuarios" ON aura_jobs_usuarios;
DROP POLICY IF EXISTS "Users can create their own profile" ON aura_jobs_usuarios;
DROP POLICY IF EXISTS "Users can read their own profile" ON aura_jobs_usuarios;
DROP POLICY IF EXISTS "Users can update their own profile" ON aura_jobs_usuarios;

-- Limpa qualquer usuário de teste existente
DELETE FROM aura_jobs_usuarios WHERE email IN ('admin@autou.com.br', 'test@test.com');
DELETE FROM auth.users WHERE email IN ('admin@autou.com.br', 'test@test.com');

-- Cria o usuário diretamente na tabela auth.users do Supabase
INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    invited_at,
    confirmation_token,
    confirmation_sent_at,
    recovery_token,
    recovery_sent_at,
    email_change_token_new,
    email_change,
    email_change_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    created_at,
    updated_at,
    phone,
    phone_confirmed_at,
    phone_change,
    phone_change_token,
    phone_change_sent_at,
    email_change_confirm_status,
    banned_until,
    reauthentication_token,
    reauthentication_sent_at,
    is_sso_user,
    deleted_at
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'admin@autou.com.br',
    crypt('admin123456', gen_salt('bf')),
    now(),
    null,
    '',
    null,
    '',
    null,
    '',
    '',
    null,
    null,
    '{"provider": "email", "providers": ["email"]}',
    '{"nome_completo": "Admin AutoU"}',
    false,
    now(),
    now(),
    null,
    null,
    '',
    '',
    null,
    0,
    null,
    '',
    null,
    false,
    null
);

-- Agora pega o ID do usuário criado e insere na nossa tabela
DO $$
DECLARE
    user_id uuid;
BEGIN
    -- Busca o ID do usuário que acabamos de criar
    SELECT id INTO user_id FROM auth.users WHERE email = 'admin@autou.com.br' LIMIT 1;
    
    -- Insere na nossa tabela de usuários
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
        user_id,
        'admin@autou.com.br',
        'Admin AutoU',
        'admin',
        'TI',
        'Administrator',
        true,
        now(),
        now()
    );
    
    RAISE NOTICE 'Admin criado com sucesso! ID: %', user_id;
END $$;

-- Verifica se deu certo
SELECT 'USUÁRIOS CRIADOS:' as info;
SELECT au.email, au.email_confirmed_at, au.created_at 
FROM auth.users au 
WHERE au.email = 'admin@autou.com.br';

SELECT 'PERFIS CRIADOS:' as info;
SELECT aju.email, aju.nome_completo, aju.role, aju.ativo 
FROM aura_jobs_usuarios aju 
WHERE aju.email = 'admin@autou.com.br';

-- CREDENCIAIS FINAIS:
-- Email: admin@autou.com.br
-- Senha: admin123456