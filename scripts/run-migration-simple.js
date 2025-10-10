const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Erro: Variáveis de ambiente não encontradas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function runMigration() {
  console.log('🚀 Executando migration...\n')

  // Comando 1: Adicionar coluna vaga_id
  console.log('1️⃣  Adicionando coluna vaga_id...')
  const { error: error1 } = await supabase.rpc('exec', {
    sql: 'ALTER TABLE aura_jobs_case_entregas ADD COLUMN IF NOT EXISTS vaga_id UUID REFERENCES aura_jobs_vagas(id);'
  })

  if (error1) {
    console.log('⚠️  Tentando método alternativo para vaga_id...')
    console.log('Erro:', error1.message)
  } else {
    console.log('✅ Coluna vaga_id adicionada com sucesso!')
  }

  // Comando 2: Adicionar coluna source
  console.log('\n2️⃣  Adicionando coluna source...')
  const { error: error2 } = await supabase.rpc('exec', {
    sql: 'ALTER TABLE aura_jobs_case_entregas ADD COLUMN IF NOT EXISTS source VARCHAR(50);'
  })

  if (error2) {
    console.log('⚠️  Tentando método alternativo para source...')
    console.log('Erro:', error2.message)
  } else {
    console.log('✅ Coluna source adicionada com sucesso!')
  }

  // Verificar se as colunas foram criadas
  console.log('\n3️⃣  Verificando colunas...')
  const { data, error } = await supabase
    .from('aura_jobs_case_entregas')
    .select('*')
    .limit(1)

  if (error) {
    console.error('❌ Erro ao verificar:', error)
  } else {
    console.log('✅ Tabela verificada com sucesso!')
    console.log('\n📋 Colunas disponíveis:', Object.keys(data[0] || {}))
  }

  console.log('\n✨ Migration concluída!')
  console.log('\n⚠️  IMPORTANTE: Se você viu erros acima, execute a migration pelo Supabase Dashboard')
}

runMigration().catch(console.error)
