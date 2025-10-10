import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Carregar .env
dotenv.config({ path: path.join(__dirname, '..', '.env') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function executeMigration() {
  console.log('🚀 Executando migration de campos de case...\n')

  const commands = [
    {
      name: 'Adicionar url_entregavel_1',
      sql: 'ALTER TABLE aura_jobs_candidatos ADD COLUMN IF NOT EXISTS url_entregavel_1 TEXT'
    },
    {
      name: 'Adicionar url_entregavel_2',
      sql: 'ALTER TABLE aura_jobs_candidatos ADD COLUMN IF NOT EXISTS url_entregavel_2 TEXT'
    },
    {
      name: 'Adicionar url_video',
      sql: 'ALTER TABLE aura_jobs_candidatos ADD COLUMN IF NOT EXISTS url_video TEXT'
    },
    {
      name: 'Adicionar data_envio_case',
      sql: 'ALTER TABLE aura_jobs_candidatos ADD COLUMN IF NOT EXISTS data_envio_case TIMESTAMP'
    },
    {
      name: 'Adicionar case_link_notion',
      sql: 'ALTER TABLE aura_jobs_vagas ADD COLUMN IF NOT EXISTS case_link_notion TEXT'
    }
  ]

  for (const cmd of commands) {
    try {
      console.log(`⏳ ${cmd.name}...`)

      const { error } = await supabase.rpc('exec_sql', { sql: cmd.sql })

      if (error) {
        console.error(`❌ Erro: ${error.message}`)
      } else {
        console.log(`✅ Sucesso!`)
      }
    } catch (err: any) {
      console.error(`❌ Erro: ${err.message}`)
    }
  }

  console.log('\n✅ Migration concluída!')
}

executeMigration()
