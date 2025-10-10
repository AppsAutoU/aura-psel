const { Client } = require('pg');

const SQL = `
-- ================================================
-- MIGRATION COMPLETA - AURA JOBS CASE ENTREGAS
-- ================================================

-- 1. Criar tabela se não existir
CREATE TABLE IF NOT EXISTS aura_jobs_case_entregas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidato_id UUID REFERENCES aura_jobs_candidatos(id) ON DELETE CASCADE,
  nome_completo VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  tipo_case VARCHAR(50) NOT NULL,
  link_entregavel_1 TEXT,
  link_entregavel_2 TEXT,
  link_entregavel_3 TEXT,
  comentarios_adicionais TEXT,
  vaga_id UUID REFERENCES aura_jobs_vagas(id),
  source VARCHAR(50),
  data_submissao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  ip_submissao VARCHAR(45)
);

-- 2. Adicionar colunas se a tabela já existir (mas não tiver as colunas)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'aura_jobs_case_entregas' AND column_name = 'vaga_id'
  ) THEN
    ALTER TABLE aura_jobs_case_entregas
    ADD COLUMN vaga_id UUID REFERENCES aura_jobs_vagas(id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'aura_jobs_case_entregas' AND column_name = 'source'
  ) THEN
    ALTER TABLE aura_jobs_case_entregas
    ADD COLUMN source VARCHAR(50);
  END IF;
END $$;

-- 3. Criar índices
CREATE INDEX IF NOT EXISTS idx_case_entregas_candidato ON aura_jobs_case_entregas(candidato_id);
CREATE INDEX IF NOT EXISTS idx_case_entregas_email ON aura_jobs_case_entregas(email);
CREATE INDEX IF NOT EXISTS idx_case_entregas_tipo ON aura_jobs_case_entregas(tipo_case);
CREATE INDEX IF NOT EXISTS idx_case_entregas_data ON aura_jobs_case_entregas(data_submissao DESC);
CREATE INDEX IF NOT EXISTS idx_case_entregas_vaga ON aura_jobs_case_entregas(vaga_id);
CREATE INDEX IF NOT EXISTS idx_case_entregas_source ON aura_jobs_case_entregas(source);
`;

async function executarMigration() {
  const client = new Client({
    host: 'aws-0-sa-east-1.pooler.supabase.com',
    port: 6543,
    database: 'postgres',
    user: 'postgres.zbsjjafbrwloedtkwfjl',
    password: 'sua_senha_postgres',
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🔌 Conectando ao banco de dados...');
    await client.connect();
    console.log('✅ Conectado com sucesso!\n');

    console.log('🚀 Executando migration...\n');
    await client.query(SQL);
    console.log('✅ Migration executada com sucesso!\n');

    console.log('📋 Verificando colunas criadas...');
    const result = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'aura_jobs_case_entregas'
      ORDER BY ordinal_position;
    `);

    console.log('\n🎉 Colunas da tabela aura_jobs_case_entregas:');
    console.table(result.rows);

    const hasVagaId = result.rows.some(r => r.column_name === 'vaga_id');
    const hasSource = result.rows.some(r => r.column_name === 'source');

    if (hasVagaId && hasSource) {
      console.log('\n✨ SUCESSO TOTAL! ✨');
      console.log('✅ Coluna vaga_id criada');
      console.log('✅ Coluna source criada');
      console.log('\n🚀 O sistema está 100% funcional agora!');
    } else {
      console.log('\n⚠️  Algumas colunas podem não ter sido criadas');
    }

  } catch (error) {
    console.error('\n❌ Erro ao executar migration:', error.message);
    if (error.message.includes('password')) {
      console.error('\n💡 Dica: A senha do banco pode estar incorreta no script');
    }
  } finally {
    await client.end();
    console.log('\n🔌 Desconectado do banco de dados');
  }
}

executarMigration();
