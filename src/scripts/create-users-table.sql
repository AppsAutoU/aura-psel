-- Criar tabela de usuários candidatos
CREATE TABLE IF NOT EXISTS aura_jobs_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Dados de autenticação
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL, -- Senha criptografada
    
    -- Dados pessoais básicos
    nome_completo VARCHAR(255) NOT NULL,
    telefone VARCHAR(20),
    whatsapp VARCHAR(20),
    data_nascimento DATE,
    cpf VARCHAR(14) UNIQUE, -- Opcional, mas único se preenchido
    
    -- Localização
    cidade VARCHAR(100),
    estado VARCHAR(2),
    pais VARCHAR(100) DEFAULT 'Brasil',
    cep VARCHAR(9),
    
    -- Links profissionais
    linkedin VARCHAR(255),
    github VARCHAR(255),
    portfolio VARCHAR(255),
    
    -- Preferências de conta
    receber_emails BOOLEAN DEFAULT true,
    receber_whatsapp BOOLEAN DEFAULT false,
    perfil_publico BOOLEAN DEFAULT false,
    
    -- Status da conta
    email_verificado BOOLEAN DEFAULT false,
    token_verificacao VARCHAR(255),
    token_reset_senha VARCHAR(255),
    data_reset_senha TIMESTAMP WITH TIME ZONE,
    ativo BOOLEAN DEFAULT true,
    
    -- Metadados
    ultimo_login TIMESTAMP WITH TIME ZONE,
    total_inscricoes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Índices para melhor performance
    CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_aura_jobs_users_email ON aura_jobs_users(email);
CREATE INDEX IF NOT EXISTS idx_aura_jobs_users_cpf ON aura_jobs_users(cpf) WHERE cpf IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_aura_jobs_users_created_at ON aura_jobs_users(created_at);

-- Adicionar trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_aura_jobs_users_updated_at 
BEFORE UPDATE ON aura_jobs_users 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

-- Criar tabela de sessões (para gerenciar login sem usar JWT complexo)
CREATE TABLE IF NOT EXISTS aura_jobs_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES aura_jobs_users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Índice para busca rápida por token
    CONSTRAINT valid_session CHECK (expires_at > CURRENT_TIMESTAMP)
);

CREATE INDEX IF NOT EXISTS idx_aura_jobs_sessions_token ON aura_jobs_sessions(token);
CREATE INDEX IF NOT EXISTS idx_aura_jobs_sessions_user_id ON aura_jobs_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_aura_jobs_sessions_expires_at ON aura_jobs_sessions(expires_at);

-- Criar view para facilitar consultas de candidatos com seus dados de usuário
CREATE OR REPLACE VIEW aura_jobs_candidatos_completos AS
SELECT 
    c.*,
    u.email_verificado,
    u.ultimo_login,
    u.receber_emails,
    u.receber_whatsapp
FROM aura_jobs_candidatos c
LEFT JOIN aura_jobs_users u ON c.email = u.email;

-- Adicionar coluna user_id na tabela de candidatos para vincular com usuário
ALTER TABLE aura_jobs_candidatos 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES aura_jobs_users(id);

-- Criar índice para melhorar performance
CREATE INDEX IF NOT EXISTS idx_aura_jobs_candidatos_user_id 
ON aura_jobs_candidatos(user_id);

-- Comentários para documentação
COMMENT ON TABLE aura_jobs_users IS 'Tabela de usuários candidatos com autenticação básica';
COMMENT ON COLUMN aura_jobs_users.password_hash IS 'Senha criptografada usando bcrypt ou similar';
COMMENT ON COLUMN aura_jobs_users.token_verificacao IS 'Token para verificação de email';
COMMENT ON COLUMN aura_jobs_users.token_reset_senha IS 'Token para recuperação de senha';
COMMENT ON TABLE aura_jobs_sessions IS 'Sessões ativas dos usuários para controle de login';