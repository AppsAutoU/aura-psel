-- Habilitar RLS na tabela avaliacoes se ainda não estiver
ALTER TABLE avaliacoes ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Permitir inserção de avaliações" ON avaliacoes;
DROP POLICY IF EXISTS "Permitir leitura de avaliações" ON avaliacoes;
DROP POLICY IF EXISTS "Permitir atualização de avaliações" ON avaliacoes;

-- Política para permitir inserção (qualquer usuário autenticado pode inserir)
CREATE POLICY "Permitir inserção de avaliações"
ON avaliacoes
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Política para permitir leitura (qualquer usuário autenticado pode ler)
CREATE POLICY "Permitir leitura de avaliações"
ON avaliacoes
FOR SELECT
TO authenticated
USING (true);

-- Política para permitir atualização (apenas o próprio avaliador pode atualizar)
CREATE POLICY "Permitir atualização de avaliações"
ON avaliacoes
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Também permitir para usuários anônimos (para testes)
CREATE POLICY "Permitir inserção anônima"
ON avaliacoes
FOR INSERT
TO anon
WITH CHECK (true);

CREATE POLICY "Permitir leitura anônima"
ON avaliacoes
FOR SELECT
TO anon
USING (true);
