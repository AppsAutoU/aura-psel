import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const supabase = await createClient()

    // Tentar adicionar a coluna prazo_case_dias
    const { data, error } = await supabase.rpc('exec_raw_sql', {
      query: `
        DO $$
        BEGIN
          -- Adicionar coluna se não existir
          IF NOT EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_name = 'aura_jobs_vagas'
            AND column_name = 'prazo_case_dias'
          ) THEN
            ALTER TABLE aura_jobs_vagas
            ADD COLUMN prazo_case_dias INTEGER DEFAULT 5;

            RAISE NOTICE 'Coluna prazo_case_dias adicionada com sucesso';
          ELSE
            RAISE NOTICE 'Coluna prazo_case_dias já existe';
          END IF;
        END $$;
      `
    })

    if (error) {
      console.error('❌ Erro ao adicionar coluna:', error)

      // Tentar abordagem alternativa sem exec_raw_sql
      // Vamos usar uma stored procedure específica para isso
      const { error: altError } = await supabase.rpc('add_prazo_case_column')

      if (altError) {
        return NextResponse.json({
          success: false,
          error: 'Não foi possível adicionar a coluna automaticamente',
          message: 'Execute manualmente: ALTER TABLE aura_jobs_vagas ADD COLUMN IF NOT EXISTS prazo_case_dias INTEGER DEFAULT 5;',
          technical_error: error.message
        }, { status: 500 })
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Coluna prazo_case_dias adicionada ou já existente'
    })

  } catch (error: any) {
    console.error('❌ Erro geral:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
