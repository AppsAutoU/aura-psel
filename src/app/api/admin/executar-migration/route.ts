import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    console.log('🚀 Iniciando execução da migration...')

    const supabase = await createClient()

    const results = {
      vaga_id_adicionado: false,
      source_adicionado: false,
      indices_criados: false,
      verificacao: null,
      erros: [] as string[]
    }

    // Tentar adicionar coluna vaga_id
    try {
      console.log('1️⃣ Adicionando coluna vaga_id...')

      // Verificar se a coluna já existe
      const { data: existingColumns } = await supabase
        .from('aura_jobs_case_entregas')
        .select('*')
        .limit(1)

      if (existingColumns && existingColumns.length > 0) {
        const columns = Object.keys(existingColumns[0])

        if (columns.includes('vaga_id')) {
          console.log('✅ Coluna vaga_id já existe!')
          results.vaga_id_adicionado = true
        } else {
          console.log('⚠️ Coluna vaga_id não existe, mas não consigo criar via API')
          results.erros.push('Coluna vaga_id precisa ser criada via SQL Editor do Supabase')
        }

        if (columns.includes('source')) {
          console.log('✅ Coluna source já existe!')
          results.source_adicionado = true
        } else {
          console.log('⚠️ Coluna source não existe, mas não consigo criar via API')
          results.erros.push('Coluna source precisa ser criada via SQL Editor do Supabase')
        }

        results.verificacao = {
          colunas_existentes: columns,
          total_colunas: columns.length
        }
      }

    } catch (error: any) {
      console.error('Erro ao verificar colunas:', error)
      results.erros.push(`Erro na verificação: ${error.message}`)
    }

    // Retornar resultado
    const sucesso = results.vaga_id_adicionado && results.source_adicionado

    if (sucesso) {
      return NextResponse.json({
        success: true,
        message: '✅ Migration já está aplicada! As colunas vaga_id e source já existem.',
        detalhes: results
      })
    } else {
      return NextResponse.json({
        success: false,
        message: '⚠️ Migration ainda não foi executada. Execute o SQL manualmente:',
        sql: `
-- Execute este SQL no Supabase Dashboard > SQL Editor:

ALTER TABLE aura_jobs_case_entregas
ADD COLUMN IF NOT EXISTS vaga_id UUID REFERENCES aura_jobs_vagas(id);

ALTER TABLE aura_jobs_case_entregas
ADD COLUMN IF NOT EXISTS source VARCHAR(50);

CREATE INDEX IF NOT EXISTS idx_case_entregas_vaga ON aura_jobs_case_entregas(vaga_id);
CREATE INDEX IF NOT EXISTS idx_case_entregas_source ON aura_jobs_case_entregas(source);
        `,
        detalhes: results,
        instrucoes: [
          '1. Acesse: https://supabase.com/dashboard',
          '2. Selecione seu projeto',
          '3. Vá em "SQL Editor" no menu lateral',
          '4. Clique em "New Query"',
          '5. Cole o SQL acima',
          '6. Clique em "Run"'
        ]
      })
    }

  } catch (error: any) {
    console.error('❌ Erro geral:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erro ao executar migration',
        detalhes: error.message
      },
      { status: 500 }
    )
  }
}
