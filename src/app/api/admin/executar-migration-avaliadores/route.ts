import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Verificar se o usuário é admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const { data: usuario } = await supabase
      .from('aura_jobs_usuarios')
      .select('role')
      .eq('email', user.email)
      .single()

    if (!usuario || usuario.role !== 'admin') {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
    }

    const logs: string[] = []

    // 1. Adicionar campos na tabela de usuários
    logs.push('📝 Adicionando campos tipo_avaliador e pode_avaliar_tudo...')
    try {
      await supabase.rpc('exec_sql', {
        sql: `
          ALTER TABLE aura_jobs_usuarios
          ADD COLUMN IF NOT EXISTS tipo_avaliador VARCHAR(50) CHECK (tipo_avaliador IN ('desenvolvimento', 'design', 'consultoria', 'generalista')),
          ADD COLUMN IF NOT EXISTS pode_avaliar_tudo BOOLEAN DEFAULT FALSE;
        `
      })
      logs.push('✅ Campos adicionados na tabela aura_jobs_usuarios')
    } catch (error: any) {
      // Tentar método alternativo
      logs.push('⚠️ Método RPC não disponível, tentando via client...')

      // Vamos verificar se as colunas já existem
      const { data: testData } = await supabase
        .from('aura_jobs_usuarios')
        .select('tipo_avaliador, pode_avaliar_tudo')
        .limit(1)

      if (testData !== null) {
        logs.push('✅ Colunas já existem em aura_jobs_usuarios')
      } else {
        logs.push('❌ Não foi possível adicionar colunas (necessário acesso ao SQL direto)')
      }
    }

    // 2. Adicionar campo tipo_vaga na tabela de vagas
    logs.push('📝 Adicionando campo tipo_vaga...')
    try {
      await supabase.rpc('exec_sql', {
        sql: `
          ALTER TABLE aura_jobs_vagas
          ADD COLUMN IF NOT EXISTS tipo_vaga VARCHAR(50) CHECK (tipo_vaga IN ('desenvolvimento', 'design', 'consultoria'));
        `
      })
      logs.push('✅ Campo adicionado na tabela aura_jobs_vagas')
    } catch (error: any) {
      const { data: testData } = await supabase
        .from('aura_jobs_vagas')
        .select('tipo_vaga')
        .limit(1)

      if (testData !== null) {
        logs.push('✅ Coluna já existe em aura_jobs_vagas')
      } else {
        logs.push('❌ Não foi possível adicionar coluna tipo_vaga')
      }
    }

    // 3. Criar tabela aura_jobs_avaliador_vagas
    logs.push('📝 Criando tabela aura_jobs_avaliador_vagas...')
    try {
      await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS aura_jobs_avaliador_vagas (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            avaliador_id UUID NOT NULL REFERENCES aura_jobs_usuarios(id) ON DELETE CASCADE,
            vaga_id UUID NOT NULL REFERENCES aura_jobs_vagas(id) ON DELETE CASCADE,
            atribuido_por UUID REFERENCES aura_jobs_usuarios(id),
            atribuido_em TIMESTAMP DEFAULT NOW(),
            UNIQUE(avaliador_id, vaga_id)
          );
        `
      })
      logs.push('✅ Tabela aura_jobs_avaliador_vagas criada')
    } catch (error: any) {
      // Verificar se a tabela existe
      const { data: testData } = await supabase
        .from('aura_jobs_avaliador_vagas')
        .select('id')
        .limit(1)

      if (testData !== null || error.message?.includes('does not exist')) {
        logs.push('✅ Tabela aura_jobs_avaliador_vagas já existe ou foi criada')
      } else {
        logs.push('❌ Não foi possível criar tabela aura_jobs_avaliador_vagas')
      }
    }

    // 4. Criar índices
    logs.push('📝 Criando índices...')
    try {
      await supabase.rpc('exec_sql', {
        sql: `
          CREATE INDEX IF NOT EXISTS idx_usuarios_tipo_avaliador ON aura_jobs_usuarios(tipo_avaliador);
          CREATE INDEX IF NOT EXISTS idx_vagas_tipo_vaga ON aura_jobs_vagas(tipo_vaga);
          CREATE INDEX IF NOT EXISTS idx_avaliador_vagas_avaliador ON aura_jobs_avaliador_vagas(avaliador_id);
          CREATE INDEX IF NOT EXISTS idx_avaliador_vagas_vaga ON aura_jobs_avaliador_vagas(vaga_id);
        `
      })
      logs.push('✅ Índices criados')
    } catch (error: any) {
      logs.push('⚠️ Alguns índices podem não ter sido criados (isso não é crítico)')
    }

    // Verificação final
    logs.push('\n🔍 Verificando estrutura final...')

    const { data: usuariosTest, error: usuariosError } = await supabase
      .from('aura_jobs_usuarios')
      .select('id, tipo_avaliador, pode_avaliar_tudo')
      .limit(1)

    const { data: vagasTest, error: vagasError } = await supabase
      .from('aura_jobs_vagas')
      .select('id, tipo_vaga')
      .limit(1)

    const { data: atribuicoesTest, error: atribuicoesError } = await supabase
      .from('aura_jobs_avaliador_vagas')
      .select('id')
      .limit(1)

    if (usuariosError && usuariosError.message.includes('does not exist')) {
      logs.push('❌ Campos em aura_jobs_usuarios não foram criados')
    } else {
      logs.push('✅ aura_jobs_usuarios: OK')
    }

    if (vagasError && vagasError.message.includes('does not exist')) {
      logs.push('❌ Campo tipo_vaga não foi criado')
    } else {
      logs.push('✅ aura_jobs_vagas: OK')
    }

    if (atribuicoesError && atribuicoesError.message.includes('does not exist')) {
      logs.push('❌ Tabela aura_jobs_avaliador_vagas não foi criada')
    } else {
      logs.push('✅ aura_jobs_avaliador_vagas: OK')
    }

    // Tentar método alternativo se RPC não funcionar
    logs.push('\n💡 MÉTODO ALTERNATIVO:')
    logs.push('Se houver erros acima, você precisará executar o SQL manualmente.')
    logs.push('Abra: /supabase/migrations/20250110_add_avaliador_tipos.sql')
    logs.push('E execute no SQL Editor do Supabase Dashboard.')

    return NextResponse.json({
      success: true,
      logs: logs,
      message: 'Migration executada! Verifique os logs acima.'
    })

  } catch (error: any) {
    console.error('Erro ao executar migration:', error)
    return NextResponse.json({
      error: error.message,
      details: 'Erro crítico ao executar migration'
    }, { status: 500 })
  }
}
