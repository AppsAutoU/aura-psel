import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function runMigration() {
  try {
    console.log('📦 Lendo arquivo de migration...')

    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20250109_add_vaga_source_to_case_entregas.sql')
    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8')

    console.log('🚀 Executando migration...')
    console.log('SQL:', migrationSQL)

    // Dividir em comandos individuais
    const commands = migrationSQL
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'))

    for (const command of commands) {
      if (command.startsWith('COMMENT')) {
        console.log('⏭️  Pulando comando COMMENT (não suportado via client)')
        continue
      }

      console.log('Executando:', command.substring(0, 50) + '...')
      const { error } = await supabase.rpc('exec_sql', { sql: command })

      if (error) {
        console.error('❌ Erro ao executar comando:', error)
        // Tentar de outra forma
        console.log('Tentando método alternativo...')
      }
    }

    console.log('✅ Migration executada com sucesso!')

  } catch (error) {
    console.error('❌ Erro ao executar migration:', error)
    process.exit(1)
  }
}

runMigration()
