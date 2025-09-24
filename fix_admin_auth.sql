-- Primeiro, vamos ver a estrutura atual da tabela
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'aura_jobs_usuarios';

-- Verificar se a coluna password_hash existe
ALTER TABLE aura_jobs_usuarios 
ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);

-- Adicionar ultimo_login se não existir
ALTER TABLE aura_jobs_usuarios 
ADD COLUMN IF NOT EXISTS ultimo_login TIMESTAMP WITH TIME ZONE;

-- Criar tabela de sessões admin se não existir
CREATE TABLE IF NOT EXISTS aura_jobs_admin_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES aura_jobs_usuarios(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ultimo_acesso TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Criar índices se não existirem
CREATE INDEX IF NOT EXISTS idx_admin_sessions_token ON aura_jobs_admin_sessions(token);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_user_id ON aura_jobs_admin_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires ON aura_jobs_admin_sessions(expires_at);

-- Limpar sessões antigas
DELETE FROM aura_jobs_admin_sessions WHERE expires_at < CURRENT_TIMESTAMP;

-- Atualizar ou criar usuário admin com senha padrão
-- Senha: admin123456 (SHA-256 hash)
UPDATE aura_jobs_usuarios 
SET 
  password_hash = '0b14d501a594442a01c6859541bcb3e8164d183d32937b851835442f69d5c94e',
  ativo = true
WHERE email = 'admin@autou.com.br';

-- Se não existir, criar
INSERT INTO aura_jobs_usuarios (
  email,
  nome_completo,
  password_hash,
  role,
  departamento,
  cargo,
  ativo
)
SELECT 
  'admin@autou.com.br',
  'Administrador',
  '0b14d501a594442a01c6859541bcb3e8164d183d32937b851835442f69d5c94e',
  'admin',
  'TI',
  'Administrador',
  true
WHERE NOT EXISTS (
  SELECT 1 FROM aura_jobs_usuarios WHERE email = 'admin@autou.com.br'
);

-- Verificar o resultado
SELECT id, email, nome_completo, role, ativo, password_hash IS NOT NULL as has_password 
FROM aura_jobs_usuarios 
WHERE email = 'admin@autou.com.br';