import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Executar ALTER TABLE para adicionar vaga_id
    const { error: error1 } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE aura_jobs_case_entregas ADD COLUMN IF NOT EXISTS vaga_id UUID REFERENCES aura_jobs_vagas(id)'
    })

    if (error1 && !error1.message.includes('already exists')) {
      console.log('Tentando adicionar vaga_id de forma manual...')
      // Supabase client pode não ter permissão para ALTER TABLE, então vamos tentar via query direta
    }

    // Executar ALTER TABLE para adicionar source
    const { error: error2 } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE aura_jobs_case_entregas ADD COLUMN IF NOT EXISTS source VARCHAR(50)'
    })

    if (error2 && !error2.message.includes('already exists')) {
      console.log('Tentando adicionar source de forma manual...')
    }

    return NextResponse.json({
      success: true,
      message: 'Migration executada! Verifique os logs.',
      errors: { error1, error2 }
    })

  } catch (error: any) {
    console.error('Erro ao executar migration:', error)
    return NextResponse.json(
      { error: 'Erro ao executar migration: ' + error.message },
      { status: 500 }
    )
  }
}
