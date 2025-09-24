-- Add password_hash to admin users table if not exists
ALTER TABLE aura_jobs_usuarios 
ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);

-- Add ultimo_login column if not exists
ALTER TABLE aura_jobs_usuarios 
ADD COLUMN IF NOT EXISTS ultimo_login TIMESTAMP WITH TIME ZONE;

-- Create admin sessions table
CREATE TABLE IF NOT EXISTS aura_jobs_admin_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES aura_jobs_usuarios(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ultimo_acesso TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_admin_sessions_token ON aura_jobs_admin_sessions(token);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_user_id ON aura_jobs_admin_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires ON aura_jobs_admin_sessions(expires_at);

-- Create a default admin user if no admin exists
-- Password: admin123456 (SHA-256 hash)
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
  '0b14d501a594442a01c6859541bcb3e8164d183d32937b851835442f69d5c94e', -- admin123456 hashed
  'admin',
  'TI',
  'Administrador',
  true
WHERE NOT EXISTS (
  SELECT 1 FROM aura_jobs_usuarios WHERE role = 'admin'
);

-- Function to clean up expired sessions (run periodically)
CREATE OR REPLACE FUNCTION clean_expired_admin_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM aura_jobs_admin_sessions
  WHERE expires_at < CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update updated_at on aura_jobs_usuarios if not exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to aura_jobs_usuarios table
DROP TRIGGER IF EXISTS update_aura_jobs_usuarios_updated_at ON aura_jobs_usuarios;
CREATE TRIGGER update_aura_jobs_usuarios_updated_at 
BEFORE UPDATE ON aura_jobs_usuarios 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();