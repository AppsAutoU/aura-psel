import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.join(__dirname, '..', '.env') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

async function executeMigration() {
  console.log('🚀 Executando migration via SQL direto...\n')

  const commands = [
    // 1. Adicionar campos em candidatos
    `ALTER TABLE aura_jobs_candidatos ADD COLUMN IF NOT EXISTS url_entregavel_1 TEXT;`,
    `ALTER TABLE aura_jobs_candidatos ADD COLUMN IF NOT EXISTS url_entregavel_2 TEXT;`,
    `ALTER TABLE aura_jobs_candidatos ADD COLUMN IF NOT EXISTS url_video TEXT;`,
    `ALTER TABLE aura_jobs_candidatos ADD COLUMN IF NOT EXISTS data_envio_case TIMESTAMP;`,

    // 2. Adicionar campo em vagas
    `ALTER TABLE aura_jobs_vagas ADD COLUMN IF NOT EXISTS case_link_notion TEXT;`,

    // 3. Criar índice
    `CREATE INDEX IF NOT EXISTS idx_candidatos_case_enviado ON aura_jobs_candidatos(data_envio_case) WHERE data_envio_case IS NOT NULL;`
  ]

  for (const sql of commands) {
    try {
      console.log(`⏳ Executando: ${sql.substring(0, 80)}...`)

      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
        method: 'POST',
        headers: {
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ sql })
      })

      if (response.ok) {
        console.log(`✅ Sucesso!`)
      } else {
        const error = await response.text()
        console.log(`⚠️ Resposta: ${error}`)
      }
    } catch (err: any) {
      console.log(`⚠️ Erro: ${err.message}`)
    }
  }

  console.log('\n✅ Migration concluída!')
  console.log('\n📊 Verificando se as colunas foram criadas...\n')

  // Verificar se colunas existem
  try {
    const response = await fetch(
      `${supabaseUrl}/rest/v1/aura_jobs_candidatos?select=url_entregavel_1,url_entregavel_2,url_video&limit=1`,
      {
        headers: {
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`
        }
      }
    )

    if (response.ok) {
      console.log('✅ Colunas de candidatos existem!')
    } else {
      console.log('❌ Colunas de candidatos NÃO existem')
    }
  } catch (err) {
    console.log('❌ Erro ao verificar colunas')
  }

  try {
    const response = await fetch(
      `${supabaseUrl}/rest/v1/aura_jobs_vagas?select=case_link_notion&limit=1`,
      {
        headers: {
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`
        }
      }
    )

    if (response.ok) {
      console.log('✅ Coluna case_link_notion existe!')
    } else {
      console.log('❌ Coluna case_link_notion NÃO existe')
    }
  } catch (err) {
    console.log('❌ Erro ao verificar coluna')
  }
}

executeMigration().catch(console.error)
