const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
require('dotenv').config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function runMigration() {
  console.log('🚀 Iniciando migração: Adicionar prazo_case_dias às vagas\n')

  try {
    // Ler o arquivo SQL
    const sql = fs.readFileSync('./migrations/add_prazo_case_dias.sql', 'utf8')
    console.log('📄 SQL da migração carregado\n')

    // Tentar executar via RPC (pode não funcionar em todos os planos do Supabase)
    console.log('⚠️  Nota: Esta migração precisa ser executada manualmente no Supabase SQL Editor')
    console.log('📍 URL: https://supabase.com/dashboard/project/xjnjfytapohglezpwksf/sql/new\n')

    // Verificar se a coluna já existe
    console.log('🔍 Verificando vagas existentes...')
    const { data: vagas, error: vagasError } = await supabase
      .from('aura_jobs_vagas')
      .select('id, titulo, prazo_case_dias')
      .limit(5)

    if (vagasError) {
      if (vagasError.message.includes('prazo_case_dias')) {
        console.log('❌ Coluna prazo_case_dias ainda não existe\n')
        console.log('📋 Por favor, execute o SQL abaixo no Supabase:\n')
        console.log('─'.repeat(80))
        console.log(sql)
        console.log('─'.repeat(80))
        return
      }
      throw vagasError
    }

    console.log('✅ Coluna prazo_case_dias já existe!')
    console.log(`\n📊 Amostra de vagas (${vagas.length} primeiras):`)
    vagas.forEach((vaga, index) => {
      console.log(`   ${index + 1}. "${vaga.titulo}" - Prazo: ${vaga.prazo_case_dias || 5} dias`)
    })

    // Contar total de vagas
    const { count, error: countError } = await supabase
      .from('aura_jobs_vagas')
      .select('*', { count: 'exact', head: true })

    if (!countError) {
      console.log(`\n📈 Total de vagas no sistema: ${count}`)
    }

    console.log('\n✨ Migração verificada com sucesso!')

  } catch (error) {
    console.error('❌ Erro durante migração:', error.message)
    console.log('\n📋 Execute este SQL manualmente no Supabase SQL Editor:')
    console.log('─'.repeat(80))
    const sql = fs.readFileSync('./migrations/add_prazo_case_dias.sql', 'utf8')
    console.log(sql)
    console.log('─'.repeat(80))
  }
}

runMigration()
