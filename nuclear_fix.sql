-- NUCLEAR OPTION: COMPLETELY REMOVE ALL SECURITY RESTRICTIONS
-- This will remove ALL RLS policies and disable security entirely

-- First, drop ALL policies on all tables
DO $$ 
DECLARE
    r RECORD;
BEGIN
    -- Drop all policies on aura_jobs_usuarios
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'aura_jobs_usuarios') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON aura_jobs_usuarios';
    END LOOP;
    
    -- Drop all policies on aura_jobs_vagas
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'aura_jobs_vagas') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON aura_jobs_vagas';
    END LOOP;
    
    -- Drop all policies on aura_jobs_candidatos
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'aura_jobs_candidatos') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON aura_jobs_candidatos';
    END LOOP;
    
    -- Drop all policies on aura_jobs_avaliacoes
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'aura_jobs_avaliacoes') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON aura_jobs_avaliacoes';
    END LOOP;
    
    -- Drop all policies on aura_jobs_historico_status
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'aura_jobs_historico_status') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON aura_jobs_historico_status';
    END LOOP;
    
    -- Drop all policies on aura_jobs_notificacoes
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'aura_jobs_notificacoes') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON aura_jobs_notificacoes';
    END LOOP;
END $$;

-- Now disable RLS on all tables
ALTER TABLE aura_jobs_usuarios DISABLE ROW LEVEL SECURITY;
ALTER TABLE aura_jobs_vagas DISABLE ROW LEVEL SECURITY;
ALTER TABLE aura_jobs_candidatos DISABLE ROW LEVEL SECURITY;
ALTER TABLE aura_jobs_avaliacoes DISABLE ROW LEVEL SECURITY;
ALTER TABLE aura_jobs_historico_status DISABLE ROW LEVEL SECURITY;
ALTER TABLE aura_jobs_notificacoes DISABLE ROW LEVEL SECURITY;

-- Verify that RLS is disabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename LIKE 'aura_jobs_%';

-- Clean up any test data
DELETE FROM aura_jobs_usuarios WHERE email LIKE '%test%' OR email LIKE '%example%' OR email LIKE '%autou%';

-- Show current state
SELECT 'RLS Policies Remaining:' as info;
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE tablename LIKE 'aura_jobs_%';

SELECT 'Tables and RLS Status:' as info;
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename LIKE 'aura_jobs_%';