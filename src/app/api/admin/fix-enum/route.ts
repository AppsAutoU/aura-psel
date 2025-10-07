import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const supabase = await createClient()

    // Tentar adicionar o valor ao enum usando SQL direto
    const { data, error } = await supabase.rpc('exec_sql', {
      sql_query: `
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_enum e
            JOIN pg_type t ON e.enumtypid = t.oid
            WHERE t.typname = 'candidato_status'
            AND e.enumlabel = 'reprovado_socios'
          ) THEN
            ALTER TYPE candidato_status ADD VALUE 'reprovado_socios';
          END IF;
        END $$;
      `
    })

    if (error) {
      console.error('❌ Erro ao adicionar enum via RPC:', error)

      // Alternativa: tentar via raw SQL
      return NextResponse.json({
        success: false,
        error: error.message,
        message: 'Execute manualmente no Supabase SQL Editor:',
        sql: "ALTER TYPE candidato_status ADD VALUE IF NOT EXISTS 'reprovado_socios';"
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Enum value "reprovado_socios" added successfully'
    })

  } catch (error: any) {
    console.error('❌ Erro geral:', error)
    return NextResponse.json({
      success: false,
      error: error.message,
      message: 'Execute manualmente no Supabase SQL Editor:',
      sql: "ALTER TYPE candidato_status ADD VALUE 'reprovado_socios';"
    }, { status: 500 })
  }
}
