import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({
        success: false,
        error: 'Variáveis de ambiente não configuradas'
      }, { status: 500 })
    }

    const results = {
      vaga_id: { success: false, message: '' },
      source: { success: false, message: '' },
      indices: { success: false, message: '' }
    }

    // SQL para executar
    const migrations = [
      {
        name: 'vaga_id',
        sql: 'ALTER TABLE aura_jobs_case_entregas ADD COLUMN IF NOT EXISTS vaga_id UUID REFERENCES aura_jobs_vagas(id);'
      },
      {
        name: 'source',
        sql: 'ALTER TABLE aura_jobs_case_entregas ADD COLUMN IF NOT EXISTS source VARCHAR(50);'
      },
      {
        name: 'indices',
        sql: `
          CREATE INDEX IF NOT EXISTS idx_case_entregas_vaga ON aura_jobs_case_entregas(vaga_id);
          CREATE INDEX IF NOT EXISTS idx_case_entregas_source ON aura_jobs_case_entregas(source);
        `
      }
    ]

    // Tentar executar via REST API do Supabase
    for (const migration of migrations) {
      try {
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`
          },
          body: JSON.stringify({ sql: migration.sql })
        })

        if (response.ok) {
          results[migration.name as keyof typeof results] = {
            success: true,
            message: 'Executado com sucesso!'
          }
        } else {
          const errorText = await response.text()
          results[migration.name as keyof typeof results] = {
            success: false,
            message: errorText
          }
        }
      } catch (error: any) {
        results[migration.name as keyof typeof results] = {
          success: false,
          message: error.message
        }
      }
    }

    const todasSucesso = Object.values(results).every(r => r.success)

    if (!todasSucesso) {
      return NextResponse.json({
        success: false,
        message: '⚠️ Não foi possível executar a migration via API. Use o método manual:',
        detalhes: results,
        sql_manual: `
-- 📋 COPIE E COLE NO SUPABASE DASHBOARD > SQL EDITOR:

ALTER TABLE aura_jobs_case_entregas
ADD COLUMN IF NOT EXISTS vaga_id UUID REFERENCES aura_jobs_vagas(id);

ALTER TABLE aura_jobs_case_entregas
ADD COLUMN IF NOT EXISTS source VARCHAR(50);

CREATE INDEX IF NOT EXISTS idx_case_entregas_vaga ON aura_jobs_case_entregas(vaga_id);
CREATE INDEX IF NOT EXISTS idx_case_entregas_source ON aura_jobs_case_entregas(source);
        `,
        instrucoes: [
          '1. Acesse: https://supabase.com/dashboard',
          '2. Clique no seu projeto',
          '3. No menu lateral, clique em "SQL Editor"',
          '4. Clique em "+ New Query"',
          '5. Cole o SQL acima',
          '6. Clique em "Run" (ou Ctrl+Enter)',
          '7. Você verá "Success. No rows returned" - isso é normal!',
          '8. Atualize esta página para verificar'
        ]
      })
    }

    return NextResponse.json({
      success: true,
      message: '✅ Migration executada com sucesso!',
      detalhes: results
    })

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: 'Erro ao executar migration',
      detalhes: error.message
    }, { status: 500 })
  }
}
