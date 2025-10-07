-- Create table for avaliador sessions
CREATE TABLE IF NOT EXISTS aura_jobs_avaliador_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES aura_jobs_usuarios(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ultimo_acesso TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_avaliador_sessions_token ON aura_jobs_avaliador_sessions(token);
CREATE INDEX IF NOT EXISTS idx_avaliador_sessions_user_id ON aura_jobs_avaliador_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_avaliador_sessions_expires_at ON aura_jobs_avaliador_sessions(expires_at);

-- Update Lucca Scarpa to be an avaliador with password "123456"
-- Password hash for "123456" using SHA-256
UPDATE aura_jobs_usuarios
SET
  role = 'avaliador',
  password_hash = '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92',
  ativo = true
WHERE email = 'lucca.scarpa@autou.io';

-- Verify the update
SELECT id, nome_completo, email, role, ativo, password_hash IS NOT NULL as has_password
FROM aura_jobs_usuarios
WHERE email = 'lucca.scarpa@autou.io';
