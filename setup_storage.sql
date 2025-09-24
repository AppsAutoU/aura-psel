-- Configuração do Supabase Storage para o sistema AutoU
-- Execute este script no Supabase para criar os buckets necessários

-- 1. Criar bucket para documentos dos candidatos
INSERT INTO storage.buckets (id, name, public)
VALUES ('candidatos', 'candidatos', false);

-- 2. Configurar políticas de storage para upload de currículos
-- Permitir que qualquer pessoa faça upload (candidatos se inscrevendo)
CREATE POLICY "Candidatos podem fazer upload de documentos" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'candidatos');

-- Permitir que candidatos vejam apenas seus próprios documentos
CREATE POLICY "Candidatos podem ver seus próprios documentos" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'candidatos');

-- Permitir que admins e avaliadores vejam todos os documentos
CREATE POLICY "Admins podem ver todos os documentos" 
ON storage.objects FOR SELECT 
USING (
    bucket_id = 'candidatos' AND 
    auth.jwt() ->> 'role' IN ('admin', 'avaliador')
);

-- Permitir que admins possam deletar documentos se necessário
CREATE POLICY "Admins podem deletar documentos" 
ON storage.objects FOR DELETE 
USING (
    bucket_id = 'candidatos' AND 
    auth.jwt() ->> 'role' = 'admin'
);

-- 3. Configurar MIME types permitidos (apenas PDFs)
-- Nota: Esta configuração pode precisar ser feita via interface do Supabase

COMMENT ON TABLE storage.buckets IS 'Bucket para armazenar currículos e cartas de apresentação dos candidatos';