-- Criar bucket para currículos se não existir
INSERT INTO storage.buckets (id, name, public)
VALUES ('curriculos', 'curriculos', false)
ON CONFLICT (id) DO NOTHING;

-- Política para permitir uploads de currículos
CREATE POLICY "Permitir upload de curriculos" ON storage.objects
FOR INSERT
TO public
WITH CHECK (bucket_id = 'curriculos');

-- Política para permitir leitura de currículos (apenas para autenticados)
CREATE POLICY "Permitir leitura de curriculos" ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'curriculos');

-- Política para permitir leitura de currículos públicos (temporariamente para testes)
CREATE POLICY "Permitir leitura publica temporaria" ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'curriculos');