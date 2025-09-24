-- VERSÃO MAIS SIMPLES - MATA TUDO DE SEGURANÇA
-- Execute linha por linha se der erro

-- Mata todas as policies de uma vez
DROP POLICY IF EXISTS "Admins podem ver todos usuarios" ON aura_jobs_usuarios CASCADE;
DROP POLICY IF EXISTS "Admins podem gerenciar vagas" ON aura_jobs_vagas CASCADE;
DROP POLICY IF EXISTS "Vagas ativas são públicas" ON aura_jobs_vagas CASCADE;
DROP POLICY IF EXISTS "Avaliadores podem ver candidatos" ON aura_jobs_candidatos CASCADE;
DROP POLICY IF EXISTS "Avaliadores podem criar avaliacoes" ON aura_jobs_avaliacoes CASCADE;
DROP POLICY IF EXISTS "Candidatos podem se inscrever" ON aura_jobs_candidatos CASCADE;
DROP POLICY IF EXISTS "Candidatos podem ver proprias informacoes" ON aura_jobs_candidatos CASCADE;
DROP POLICY IF EXISTS "Users can create their own profile" ON aura_jobs_usuarios CASCADE;
DROP POLICY IF EXISTS "Users can read their own profile" ON aura_jobs_usuarios CASCADE;
DROP POLICY IF EXISTS "Users can update their own profile" ON aura_jobs_usuarios CASCADE;

-- Desabilita RLS completamente
ALTER TABLE aura_jobs_usuarios DISABLE ROW LEVEL SECURITY;
ALTER TABLE aura_jobs_vagas DISABLE ROW LEVEL SECURITY;
ALTER TABLE aura_jobs_candidatos DISABLE ROW LEVEL SECURITY;
ALTER TABLE aura_jobs_avaliacoes DISABLE ROW LEVEL SECURITY;
ALTER TABLE aura_jobs_historico_status DISABLE ROW LEVEL SECURITY;
ALTER TABLE aura_jobs_notificacoes DISABLE ROW LEVEL SECURITY;

-- Limpa dados de teste
DELETE FROM aura_jobs_usuarios WHERE email LIKE '%test%' OR email LIKE '%example%';