import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Executando migration com Service Role Key...')

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({
        success: false,
        error: 'Variáveis de ambiente não configuradas'
      }, { status: 500 })
    }

    // Criar cliente com Service Role (tem permissões completas)
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    const results = []

    // Primeiro, vamos verificar se as colunas já existem
    console.log('📋 Verificando estado atual da tabela...')

    const { data: sampleData, error: sampleError } = await supabase
      .from('aura_jobs_case_entregas')
      .select('*')
      .limit(1)

    if (sampleError) {
      console.error('Erro ao verificar tabela:', sampleError)
      return NextResponse.json({
        success: false,
        error: 'Erro ao acessar tabela',
        detalhes: sampleError
      }, { status: 500 })
    }

    const colunasExistentes = sampleData && sampleData.length > 0
      ? Object.keys(sampleData[0])
      : []

    console.log('Colunas existentes:', colunasExistentes)

    const vagaIdExiste = colunasExistentes.includes('vaga_id')
    const sourceExiste = colunasExistentes.includes('source')

    results.push({
      verificacao: 'colunas_existentes',
      vaga_id_existe: vagaIdExiste,
      source_existe: sourceExiste,
      total_colunas: colunasExistentes.length
    })

    if (vagaIdExiste && sourceExiste) {
      return NextResponse.json({
        success: true,
        message: '🎉 Migration já aplicada! As colunas vaga_id e source já existem.',
        detalhes: results,
        colunas: colunasExistentes,
        status: 'JÁ_COMPLETO',
        proximos_passos: [
          '✅ Sistema pronto para uso!',
          '✅ Formulário salva vaga_id e source automaticamente',
          '✅ Portal Avaliador mostra entregas automaticamente',
          '🧪 Teste: Envie um case em http://localhost:3000/case/entregar?source=notion-dev'
        ]
      })
    }

    // Se chegou aqui, as colunas NÃO existem
    // Infelizmente o Supabase JS client não permite ALTER TABLE
    // Vamos precisar fazer via SQL direto

    return NextResponse.json({
      success: false,
      message: '⚠️ As colunas ainda não foram criadas. É necessário executar SQL manualmente.',
      detalhes: {
        vaga_id_existe: vagaIdExiste,
        source_existe: sourceExiste,
        motivo: 'Supabase JS Client não suporta ALTER TABLE por segurança'
      },
      sql_para_executar: `-- 📋 EXECUTE NO SUPABASE DASHBOARD > SQL EDITOR:

ALTER TABLE aura_jobs_case_entregas
ADD COLUMN IF NOT EXISTS vaga_id UUID REFERENCES aura_jobs_vagas(id);

ALTER TABLE aura_jobs_case_entregas
ADD COLUMN IF NOT EXISTS source VARCHAR(50);

CREATE INDEX IF NOT EXISTS idx_case_entregas_vaga ON aura_jobs_case_entregas(vaga_id);
CREATE INDEX IF NOT EXISTS idx_case_entregas_source ON aura_jobs_case_entregas(source);`,
      instrucoes_rapidas: [
        '1. Abra: https://supabase.com/dashboard/project/xjnjfytapohglezpwksf/sql/new',
        '2. Cole o SQL acima',
        '3. Clique em RUN',
        '4. Pronto! ✅'
      ]
    })

  } catch (error: any) {
    console.error('❌ Erro:', error)
    return NextResponse.json({
      success: false,
      error: 'Erro ao executar migration',
      detalhes: error.message
    }, { status: 500 })
  }
}
