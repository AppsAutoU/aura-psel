-- Criar tabela para logs de emails enviados
CREATE TABLE IF NOT EXISTS email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidatura_id UUID REFERENCES aura_jobs_candidatos(id) ON DELETE CASCADE,
  tipo VARCHAR(50) NOT NULL,
  destinatario VARCHAR(255) NOT NULL,
  assunto VARCHAR(255),
  status VARCHAR(20) DEFAULT 'enviado',
  erro TEXT,
  enviado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para melhorar performance
CREATE INDEX idx_email_logs_candidatura_id ON email_logs(candidatura_id);
CREATE INDEX idx_email_logs_tipo ON email_logs(tipo);
CREATE INDEX idx_email_logs_destinatario ON email_logs(destinatario);
CREATE INDEX idx_email_logs_enviado_em ON email_logs(enviado_em);

-- Adicionar comentários
COMMENT ON TABLE email_logs IS 'Registro de todos os emails enviados para candidatos';
COMMENT ON COLUMN email_logs.tipo IS 'Tipo do email: confirmacao, status_atualizado, case_enviado, entrevista_agendada, aprovacao_final';
COMMENT ON COLUMN email_logs.status IS 'Status do envio: enviado, erro, bounce';