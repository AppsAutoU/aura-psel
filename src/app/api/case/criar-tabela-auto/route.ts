import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Tentar criar a tabela via INSERT com uma estrutura que force a criação
    // Isso é um hack, mas pode funcionar

    console.log('🚀 Tentando criar tabela via INSERT...')

    // Primeiro teste: tentar inserir dados
    const { error } = await supabase
      .from('aura_jobs_case_entregas')
      .insert({
        nome_completo: 'TESTE MIGRATION',
        email: 'teste@migration.com',
        tipo_case: 'desenvolvimento',
        vaga_id: null,
        source: 'teste-migration'
      })

    if (error) {
      if (error.code === '42P01') {
        // Tabela não existe
        return NextResponse.json({
          success: false,
          message: '📋 Tabela não existe. Vou criar o SQL para você executar em outra ferramenta.',
          sql: `
-- Execute este SQL usando qualquer cliente PostgreSQL ou ferramenta online:
-- Exemplo: https://sql-playground.wizardzines.com/ (substitua pela connection string correta)

CREATE TABLE aura_jobs_case_entregas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidato_id UUID,
  nome_completo VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  tipo_case VARCHAR(50) NOT NULL,
  link_entregavel_1 TEXT,
  link_entregavel_2 TEXT,
  link_entregavel_3 TEXT,
  comentarios_adicionais TEXT,
  vaga_id UUID,
  source VARCHAR(50),
  data_submissao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  ip_submissao VARCHAR(45)
);

CREATE INDEX idx_case_entregas_vaga ON aura_jobs_case_entregas(vaga_id);
CREATE INDEX idx_case_entregas_source ON aura_jobs_case_entregas(source);
          `,
          connection_string: 'postgresql://postgres.zbsjjafbrwloedtkwfjl:SUA_SENHA@aws-0-sa-east-1.pooler.supabase.com:6543/postgres',
          alternativa: 'Peça a senha do banco para alguém da equipe ou acesso ao Supabase Dashboard'
        })
      } else if (error.code === '42703') {
        // Colunas não existem
        return NextResponse.json({
          success: false,
          message: '⚠️ Tabela existe mas faltam colunas vaga_id e source',
          error: error.message,
          solucao: 'Execute ALTER TABLE manualmente ou peça acesso ao Supabase'
        })
      } else {
        return NextResponse.json({
          success: false,
          message: 'Erro ao testar inserção',
          error: error
        })
      }
    }

    // Se chegou aqui, a inserção funcionou! Tabela existe com as colunas corretas
    // Vamos deletar o registro de teste
    await supabase
      .from('aura_jobs_case_entregas')
      .delete()
      .eq('email', 'teste@migration.com')

    return NextResponse.json({
      success: true,
      message: '🎉 Tabela já existe e está funcional!',
      detalhes: 'As colunas vaga_id e source estão presentes e funcionando.'
    })

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
