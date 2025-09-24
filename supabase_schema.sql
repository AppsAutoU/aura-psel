-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enum types for better data integrity
CREATE TYPE user_role AS ENUM ('admin', 'avaliador');
CREATE TYPE candidato_status AS ENUM ('inscrito', 'em_avaliacao_ia', 'reprovado_ia', 'case_enviado', 'em_avaliacao_case', 'aprovado_case', 'reprovado_case', 'entrevista_tecnica', 'entrevista_socios', 'aprovado', 'reprovado', 'contratado');
CREATE TYPE vaga_status AS ENUM ('aberta', 'pausada', 'fechada');
CREATE TYPE fase_processo AS ENUM ('inscricao', 'avaliacao_ia', 'case_pratico', 'avaliacao_case', 'entrevista_tecnica', 'entrevista_socios', 'contratacao');

-- Table: aura_jobs_usuarios (Admin and Avaliadores)
CREATE TABLE aura_jobs_usuarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    nome_completo VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'avaliador',
    departamento VARCHAR(100),
    cargo VARCHAR(100),
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: aura_jobs_vagas
CREATE TABLE aura_jobs_vagas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT,
    departamento VARCHAR(100),
    tipo_contrato VARCHAR(50), -- CLT, PJ, Estágio, etc
    modelo_trabalho VARCHAR(50), -- Remoto, Presencial, Híbrido
    localizacao VARCHAR(100), -- São Paulo, Remoto, etc
    nivel_experiencia VARCHAR(50), -- Júnior, Pleno, Sênior
    salario_min DECIMAL(10,2),
    salario_max DECIMAL(10,2),
    requisitos TEXT[], -- Array de requisitos
    beneficios TEXT[], -- Array de benefícios
    vaga_key VARCHAR(100) UNIQUE NOT NULL, -- Link único para formulário
    ativa BOOLEAN DEFAULT true,
    vagas_disponiveis INTEGER DEFAULT 1,
    data_publicacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    data_expiracao TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES aura_jobs_usuarios(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: aura_jobs_candidatos
CREATE TABLE aura_jobs_candidatos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vaga_id UUID REFERENCES aura_jobs_vagas(id) ON DELETE CASCADE,
    
    -- Dados Pessoais
    nome_completo VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    telefone VARCHAR(20),
    data_nascimento DATE,
    cidade VARCHAR(100),
    estado VARCHAR(2),
    pais VARCHAR(100) DEFAULT 'Brasil',
    
    -- Formação Acadêmica
    nivel_escolaridade VARCHAR(100), -- Ensino Médio, Superior, etc
    curso VARCHAR(255),
    instituicao VARCHAR(255),
    ano_conclusao INTEGER,
    
    -- Experiência Profissional
    experiencia_anos INTEGER, -- Anos de experiência
    cargo_atual VARCHAR(255),
    empresa_atual VARCHAR(255),
    salario_pretendido DECIMAL(10,2),
    
    -- Skills e Portfolio
    principais_skills TEXT,
    linkedin VARCHAR(255),
    github VARCHAR(255),
    portfolio VARCHAR(255),
    
    -- Motivação e Disponibilidade
    motivacao TEXT,
    disponibilidade VARCHAR(100), -- Imediata, 30 dias, etc
    
    -- Documentos
    curriculo_url TEXT,
    carta_apresentacao_url TEXT,
    
    -- Avaliação e Status
    score_ia DECIMAL(3,1), -- 0.0 a 10.0
    analise_ia_completa JSONB, -- Resultado completo da análise da IA
    status candidato_status DEFAULT 'inscrito',
    fase_atual fase_processo DEFAULT 'inscricao',
    
    -- Case Prático
    case_enviado BOOLEAN DEFAULT false,
    case_url TEXT,
    data_envio_case TIMESTAMP WITH TIME ZONE,
    prazo_case TIMESTAMP WITH TIME ZONE,
    
    -- Avaliações
    nota_media_case DECIMAL(3,1),
    total_avaliacoes INTEGER DEFAULT 0,
    aprovado_case BOOLEAN,
    
    -- Entrevistas
    data_entrevista_tecnica TIMESTAMP WITH TIME ZONE,
    feedback_entrevista_tecnica TEXT,
    aprovado_entrevista_tecnica BOOLEAN,
    data_entrevista_socios TIMESTAMP WITH TIME ZONE,
    feedback_entrevista_socios TEXT,
    aprovado_entrevista_socios BOOLEAN,
    
    -- Metadados
    observacoes_internas TEXT,
    tags TEXT[],
    data_inscricao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    UNIQUE(email, vaga_id) -- Evita inscrições duplicadas na mesma vaga
);

-- Table: aura_jobs_avaliacoes
CREATE TABLE aura_jobs_avaliacoes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidato_id UUID REFERENCES aura_jobs_candidatos(id) ON DELETE CASCADE,
    avaliador_id UUID REFERENCES aura_jobs_usuarios(id),
    vaga_id UUID REFERENCES aura_jobs_vagas(id),
    
    -- Notas e Avaliação
    nota_tecnica DECIMAL(3,1) CHECK (nota_tecnica >= 0 AND nota_tecnica <= 10),
    nota_soft_skills DECIMAL(3,1) CHECK (nota_soft_skills >= 0 AND nota_soft_skills <= 10),
    nota_experiencia DECIMAL(3,1) CHECK (nota_experiencia >= 0 AND nota_experiencia <= 10),
    nota_case DECIMAL(3,1) CHECK (nota_case >= 0 AND nota_case <= 10),
    nota_final DECIMAL(3,1) GENERATED ALWAYS AS (
        (COALESCE(nota_tecnica, 0) + COALESCE(nota_soft_skills, 0) + 
         COALESCE(nota_experiencia, 0) + COALESCE(nota_case, 0)) / 
        NULLIF(
            (CASE WHEN nota_tecnica IS NOT NULL THEN 1 ELSE 0 END +
             CASE WHEN nota_soft_skills IS NOT NULL THEN 1 ELSE 0 END +
             CASE WHEN nota_experiencia IS NOT NULL THEN 1 ELSE 0 END +
             CASE WHEN nota_case IS NOT NULL THEN 1 ELSE 0 END), 0)
    ) STORED,
    
    -- Feedback Detalhado
    comentarios_tecnicos TEXT,
    comentarios_soft_skills TEXT,
    comentarios_experiencia TEXT,
    comentarios_case TEXT,
    comentario_geral TEXT,
    
    -- Recomendação
    recomenda_aprovar BOOLEAN,
    recomenda_entrevista BOOLEAN,
    nivel_senioridade_sugerido VARCHAR(50), -- Junior, Pleno, Senior
    
    -- Metadados
    fase_avaliada fase_processo,
    tempo_avaliacao INTEGER, -- em minutos
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Evita avaliações duplicadas do mesmo avaliador
    UNIQUE(candidato_id, avaliador_id, fase_avaliada)
);

-- Table: aura_jobs_historico_status (Para rastrear mudanças de status)
CREATE TABLE aura_jobs_historico_status (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidato_id UUID REFERENCES aura_jobs_candidatos(id) ON DELETE CASCADE,
    status_anterior candidato_status,
    status_novo candidato_status NOT NULL,
    fase_anterior fase_processo,
    fase_nova fase_processo,
    motivo TEXT,
    usuario_responsavel UUID REFERENCES aura_jobs_usuarios(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: aura_jobs_notificacoes (Para rastrear emails enviados)
CREATE TABLE aura_jobs_notificacoes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidato_id UUID REFERENCES aura_jobs_candidatos(id) ON DELETE CASCADE,
    tipo VARCHAR(50) NOT NULL, -- aprovacao_ia, envio_case, aprovacao_case, etc
    assunto VARCHAR(255),
    conteudo TEXT,
    email_destinatario VARCHAR(255),
    enviado BOOLEAN DEFAULT false,
    data_envio TIMESTAMP WITH TIME ZONE,
    erro_envio TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX idx_aura_jobs_candidatos_vaga ON aura_jobs_candidatos(vaga_id);
CREATE INDEX idx_aura_jobs_candidatos_status ON aura_jobs_candidatos(status);
CREATE INDEX idx_aura_jobs_candidatos_fase ON aura_jobs_candidatos(fase_atual);
CREATE INDEX idx_aura_jobs_candidatos_email ON aura_jobs_candidatos(email);
CREATE INDEX idx_aura_jobs_candidatos_score ON aura_jobs_candidatos(score_ia);
CREATE INDEX idx_aura_jobs_avaliacoes_candidato ON aura_jobs_avaliacoes(candidato_id);
CREATE INDEX idx_aura_jobs_avaliacoes_avaliador ON aura_jobs_avaliacoes(avaliador_id);
CREATE INDEX idx_aura_jobs_vagas_key ON aura_jobs_vagas(vaga_key);
CREATE INDEX idx_aura_jobs_vagas_ativa ON aura_jobs_vagas(ativa);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_aura_jobs_usuarios_updated_at BEFORE UPDATE ON aura_jobs_usuarios
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_aura_jobs_vagas_updated_at BEFORE UPDATE ON aura_jobs_vagas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_aura_jobs_candidatos_updated_at BEFORE UPDATE ON aura_jobs_candidatos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_aura_jobs_avaliacoes_updated_at BEFORE UPDATE ON aura_jobs_avaliacoes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger para registrar mudanças de status
CREATE OR REPLACE FUNCTION registrar_mudanca_status()
RETURNS TRIGGER AS $$
BEGIN
    IF (OLD.status IS DISTINCT FROM NEW.status) OR (OLD.fase_atual IS DISTINCT FROM NEW.fase_atual) THEN
        INSERT INTO aura_jobs_historico_status (
            candidato_id,
            status_anterior,
            status_novo,
            fase_anterior,
            fase_nova
        ) VALUES (
            NEW.id,
            OLD.status,
            NEW.status,
            OLD.fase_atual,
            NEW.fase_atual
        );
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_aura_jobs_historico_status
    AFTER UPDATE ON aura_jobs_candidatos
    FOR EACH ROW EXECUTE FUNCTION registrar_mudanca_status();

-- Trigger para calcular média das avaliações
CREATE OR REPLACE FUNCTION atualizar_media_avaliacoes()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE aura_jobs_candidatos
    SET nota_media_case = (
        SELECT AVG(nota_final)
        FROM aura_jobs_avaliacoes
        WHERE candidato_id = NEW.candidato_id
    ),
    total_avaliacoes = (
        SELECT COUNT(*)
        FROM aura_jobs_avaliacoes
        WHERE candidato_id = NEW.candidato_id
    )
    WHERE id = NEW.candidato_id;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_aura_jobs_atualizar_media
    AFTER INSERT OR UPDATE OR DELETE ON aura_jobs_avaliacoes
    FOR EACH ROW EXECUTE FUNCTION atualizar_media_avaliacoes();

-- Row Level Security (RLS)
ALTER TABLE aura_jobs_usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE aura_jobs_vagas ENABLE ROW LEVEL SECURITY;
ALTER TABLE aura_jobs_candidatos ENABLE ROW LEVEL SECURITY;
ALTER TABLE aura_jobs_avaliacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE aura_jobs_historico_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE aura_jobs_notificacoes ENABLE ROW LEVEL SECURITY;

-- Políticas básicas de RLS (ajustar conforme necessário)
-- Admins podem ver tudo
CREATE POLICY "Admins podem ver todos usuarios" ON aura_jobs_usuarios
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins podem gerenciar vagas" ON aura_jobs_vagas
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Políticas públicas para vagas (candidatos precisam ver vagas)
CREATE POLICY "Vagas ativas são públicas" ON aura_jobs_vagas
    FOR SELECT USING (ativa = true);

-- Avaliadores podem ver candidatos e avaliar
CREATE POLICY "Avaliadores podem ver candidatos" ON aura_jobs_candidatos
    FOR SELECT USING (
        auth.jwt() ->> 'role' IN ('admin', 'avaliador')
    );

CREATE POLICY "Avaliadores podem criar avaliacoes" ON aura_jobs_avaliacoes
    FOR INSERT WITH CHECK (
        auth.jwt() ->> 'role' IN ('admin', 'avaliador')
    );

-- Candidatos podem criar suas próprias candidaturas
CREATE POLICY "Candidatos podem se inscrever" ON aura_jobs_candidatos
    FOR INSERT WITH CHECK (true);

-- Candidatos podem ver apenas suas próprias informações
CREATE POLICY "Candidatos podem ver proprias informacoes" ON aura_jobs_candidatos
    FOR SELECT USING (
        email = auth.jwt() ->> 'email'
    );

-- Inserir alguns dados de exemplo (opcional)
-- INSERT INTO aura_jobs_usuarios (email, nome_completo, role) VALUES
-- ('admin@autou.com.br', 'Administrador AutoU', 'admin'),
-- ('avaliador1@autou.com.br', 'Avaliador 1', 'avaliador'),
-- ('avaliador2@autou.com.br', 'Avaliador 2', 'avaliador');

-- Comentários sobre as tabelas
COMMENT ON TABLE aura_jobs_usuarios IS 'Usuários do sistema (admins e avaliadores)';
COMMENT ON TABLE aura_jobs_vagas IS 'Vagas abertas no processo seletivo';
COMMENT ON TABLE aura_jobs_candidatos IS 'Candidatos inscritos nas vagas';
COMMENT ON TABLE aura_jobs_avaliacoes IS 'Avaliações dos candidatos pelos avaliadores';
COMMENT ON TABLE aura_jobs_historico_status IS 'Histórico de mudanças de status dos candidatos';
COMMENT ON TABLE aura_jobs_notificacoes IS 'Log de notificações enviadas aos candidatos';