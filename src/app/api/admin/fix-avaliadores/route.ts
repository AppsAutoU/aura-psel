import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST() {
  try {
    const supabase = await createClient()

    console.log('🔧 Adicionando colunas à tabela aura_jobs_usuarios...')

    // Adicionar colunas usando SQL direto
    const { error: alterError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE aura_jobs_usuarios
        ADD COLUMN IF NOT EXISTS tipo_avaliador TEXT,
        ADD COLUMN IF NOT EXISTS pode_avaliar_tudo BOOLEAN DEFAULT FALSE;
      `
    })

    if (alterError && !alterError.message.includes('already exists')) {
      console.error('Erro ao adicionar colunas:', alterError)
    }

    console.log('✅ Colunas verificadas/adicionadas')

    // Aguardar um pouco para o Supabase atualizar o cache
    await new Promise(resolve => setTimeout(resolve, 2000))

    console.log('🔄 Atualizando avaliadores...')

    // Buscar todos os avaliadores
    const { data: avaliadores, error: selectError } = await supabase
      .from('aura_jobs_usuarios')
      .select('*')
      .eq('role', 'avaliador')

    if (selectError) {
      return NextResponse.json({
        error: 'Erro ao buscar avaliadores',
        details: selectError
      }, { status: 500 })
    }

    console.log(`Encontrados ${avaliadores.length} avaliadores`)

    // Atualizar cada avaliador individualmente via SQL raw
    const updates = []
    for (const av of avaliadores) {
      const { error } = await supabase.rpc('exec_sql', {
        sql: `
          UPDATE aura_jobs_usuarios
          SET
            pode_avaliar_tudo = TRUE,
            tipo_avaliador = 'generalista'
          WHERE id = '${av.id}';
        `
      })

      if (error) {
        console.error(`Erro ao atualizar ${av.email}:`, error)
      } else {
        updates.push(av.email)
        console.log(`✅ Atualizado: ${av.email}`)
      }
    }

    return NextResponse.json({
      success: true,
      message: `${updates.length} avaliadores atualizados`,
      avaliadores: updates
    })

  } catch (error: any) {
    console.error('Erro:', error)
    return NextResponse.json({
      error: 'Erro ao processar',
      details: error.message
    }, { status: 500 })
  }
}
