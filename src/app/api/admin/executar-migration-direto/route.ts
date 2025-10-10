import { NextRequest, NextResponse } from 'next/server'
import { Client } from 'pg'

export async function POST(request: NextRequest) {
  let client: Client | null = null

  try {
    console.log('🚀 Iniciando execução da migration via PostgreSQL direto...')

    // Configurar conexão com o banco
    const connectionString = `postgresql://postgres.zbsjjafbrwloedtkwfjl:sua_senha_postgres@aws-0-sa-east-1.pooler.supabase.com:6543/postgres`

    client = new Client({
      connectionString,
      ssl: {
        rejectUnauthorized: false
      }
    })

    await client.connect()
    console.log('✅ Conectado ao banco de dados!')

    const results = []

    // 1. Adicionar coluna vaga_id
    console.log('\n1️⃣ Adicionando coluna vaga_id...')
    try {
      await client.query(`
        ALTER TABLE aura_jobs_case_entregas
        ADD COLUMN IF NOT EXISTS vaga_id UUID REFERENCES aura_jobs_vagas(id);
      `)
      results.push({ step: 'vaga_id', success: true, message: '✅ Coluna vaga_id adicionada' })
      console.log('✅ Coluna vaga_id adicionada com sucesso!')
    } catch (error: any) {
      results.push({ step: 'vaga_id', success: false, message: error.message })
      console.error('❌ Erro ao adicionar vaga_id:', error.message)
    }

    // 2. Adicionar coluna source
    console.log('\n2️⃣ Adicionando coluna source...')
    try {
      await client.query(`
        ALTER TABLE aura_jobs_case_entregas
        ADD COLUMN IF NOT EXISTS source VARCHAR(50);
      `)
      results.push({ step: 'source', success: true, message: '✅ Coluna source adicionada' })
      console.log('✅ Coluna source adicionada com sucesso!')
    } catch (error: any) {
      results.push({ step: 'source', success: false, message: error.message })
      console.error('❌ Erro ao adicionar source:', error.message)
    }

    // 3. Criar índice para vaga_id
    console.log('\n3️⃣ Criando índice para vaga_id...')
    try {
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_case_entregas_vaga ON aura_jobs_case_entregas(vaga_id);
      `)
      results.push({ step: 'index_vaga', success: true, message: '✅ Índice vaga_id criado' })
      console.log('✅ Índice vaga_id criado com sucesso!')
    } catch (error: any) {
      results.push({ step: 'index_vaga', success: false, message: error.message })
      console.error('❌ Erro ao criar índice vaga_id:', error.message)
    }

    // 4. Criar índice para source
    console.log('\n4️⃣ Criando índice para source...')
    try {
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_case_entregas_source ON aura_jobs_case_entregas(source);
      `)
      results.push({ step: 'index_source', success: true, message: '✅ Índice source criado' })
      console.log('✅ Índice source criado com sucesso!')
    } catch (error: any) {
      results.push({ step: 'index_source', success: false, message: error.message })
      console.error('❌ Erro ao criar índice source:', error.message)
    }

    // 5. Verificar as colunas criadas
    console.log('\n5️⃣ Verificando colunas...')
    const verificacao = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'aura_jobs_case_entregas'
      AND column_name IN ('vaga_id', 'source')
      ORDER BY column_name;
    `)

    console.log('📋 Colunas verificadas:', verificacao.rows)

    await client.end()
    console.log('\n✅ Desconectado do banco de dados')

    const todasSucesso = results.every(r => r.success)

    return NextResponse.json({
      success: todasSucesso,
      message: todasSucesso
        ? '🎉 Migration executada com sucesso! Todas as colunas foram adicionadas.'
        : '⚠️ Migration parcialmente executada. Verifique os detalhes.',
      results,
      verificacao: verificacao.rows,
      proximos_passos: todasSucesso
        ? [
            '✅ O sistema está pronto!',
            '✅ Formulário de case agora salva vaga_id e source',
            '✅ Portal Avaliador mostra automaticamente as entregas',
            '✅ Você pode testar enviando um case prático'
          ]
        : [
            'Verifique os erros acima',
            'Se necessário, execute manualmente no Supabase Dashboard'
          ]
    })

  } catch (error: any) {
    console.error('❌ Erro geral:', error)

    if (client) {
      await client.end()
    }

    return NextResponse.json({
      success: false,
      error: 'Erro ao conectar ou executar migration',
      detalhes: error.message,
      dica: 'Verifique se a senha do banco está correta no código'
    }, { status: 500 })
  }
}
