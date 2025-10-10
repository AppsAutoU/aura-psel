import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Ler arquivo SQL
    const migrationPath = path.join(
      process.cwd(),
      'supabase',
      'migrations',
      '20250110_add_case_entrega_fields.sql'
    )

    const sqlContent = fs.readFileSync(migrationPath, 'utf-8')

    // Dividir em comandos individuais (por ponto e vírgula)
    const commands = sqlContent
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--') && !cmd.startsWith('COMMENT'))

    const results = []

    for (const command of commands) {
      if (command.includes('COMMENT ON')) continue // Pular comentários

      try {
        const { data, error } = await supabase.rpc('exec_sql', { sql: command + ';' })

        if (error) {
          console.error('Erro no comando:', command)
          console.error('Erro:', error)
          results.push({ command, success: false, error: error.message })
        } else {
          results.push({ command, success: true })
        }
      } catch (err: any) {
        console.error('Erro ao executar:', err)
        results.push({ command, success: false, error: err.message })
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Migration executada',
      results
    })

  } catch (error: any) {
    console.error('Erro na migration:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
