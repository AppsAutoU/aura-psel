-- Migration para adicionar rastreamento de usuário e token de consulta em candidaturas

-- 1. Adicionar coluna user_id opcional para vincular candidatura a um usuário (quando criar conta)
ALTER TABLE aura_jobs_candidatos
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES aura_jobs_users(id) ON DELETE SET NULL;

-- 2. Adicionar token único para consulta de status sem login
ALTER TABLE aura_jobs_candidatos
ADD COLUMN IF NOT EXISTS consulta_token VARCHAR(100) UNIQUE;

-- 3. Criar índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_candidatos_user_id ON aura_jobs_candidatos(user_id);
CREATE INDEX IF NOT EXISTS idx_candidatos_consulta_token ON aura_jobs_candidatos(consulta_token);
CREATE INDEX IF NOT EXISTS idx_candidatos_email ON aura_jobs_candidatos(email);

-- 4. Adicionar trigger para gerar token automaticamente
CREATE OR REPLACE FUNCTION generate_consulta_token()
RETURNS TRIGGER AS $$
BEGIN
    -- Gera um token único combinando UUID parcial com timestamp
    NEW.consulta_token := CONCAT(
        SUBSTRING(MD5(RANDOM()::TEXT || NEW.email || NOW()::TEXT), 1, 8),
        '-',
        SUBSTRING(MD5(NEW.id::TEXT), 1, 8)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Criar trigger que será executado antes de inserir
DROP TRIGGER IF EXISTS set_consulta_token ON aura_jobs_candidatos;
CREATE TRIGGER set_consulta_token
    BEFORE INSERT ON aura_jobs_candidatos
    FOR EACH ROW
    WHEN (NEW.consulta_token IS NULL)
    EXECUTE FUNCTION generate_consulta_token();

-- 6. Atualizar registros existentes com tokens
UPDATE aura_jobs_candidatos
SET consulta_token = CONCAT(
    SUBSTRING(MD5(RANDOM()::TEXT || email || NOW()::TEXT), 1, 8),
    '-',
    SUBSTRING(MD5(id::TEXT), 1, 8)
)
WHERE consulta_token IS NULL;

-- 7. Comentários para documentação
COMMENT ON COLUMN aura_jobs_candidatos.user_id IS 'ID do usuário vinculado (opcional - candidato pode criar conta depois)';
COMMENT ON COLUMN aura_jobs_candidatos.consulta_token IS 'Token único para consulta de status sem login';