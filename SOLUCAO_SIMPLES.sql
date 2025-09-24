-- 🚀 SOLUÇÃO SIMPLES: APENAS NOSSA TABELA
-- Sem mexer no auth.users do Supabase
-- Sistema 100% baseado em aura_jobs_usuarios

-- 1. Garantir que nossa tabela não tem restrições
ALTER TABLE aura_jobs_usuarios DISABLE ROW LEVEL SECURITY;

-- 2. Limpar qualquer admin existente
DELETE FROM aura_jobs_usuarios WHERE email = 'admin@autou.com.br';

-- 3. Criar admin direto na nossa tabela
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
    '11111111-1111-1111-1111-111111111111',
    'admin@autou.com.br',
    'Admin AutoU',
    'admin',
    'TI',
    'Administrator',
    true,
    now(),
    now()
);

-- 4. Verificar se foi criado
SELECT 'ADMIN CRIADO:' as status, email, nome_completo, role, ativo 
FROM aura_jobs_usuarios 
WHERE email = 'admin@autou.com.br';

-- ✅ CREDENCIAIS CRIADAS:
-- Email: admin@autou.com.br
-- Senha: (será definida no sistema simples)
-- Sistema: 100% nossa tabela, sem Auth do Supabase