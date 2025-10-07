import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { candidatoId, novoStatus } = await request.json()

    if (!candidatoId || !novoStatus) {
      return NextResponse.json({
        success: false,
        error: 'candidatoId e novoStatus são obrigatórios'
      }, { status: 400 })
    }

    const supabase = await createClient()

    // Lista de status válidos (incluindo reprovado_socios que pode não estar no enum)
    const validStatuses = [
      'inscrito',
      'em_avaliacao_ia',
      'reprovado_ia',
      'case_enviado',
      'em_avaliacao_case',
      'aprovado_case',
      'reprovado_case',
      'entrevista_tecnica',
      'entrevista_socios',
      'reprovado',
      'reprovado_socios', // ← Adicionado manualmente
      'contratado'
    ]

    if (!validStatuses.includes(novoStatus)) {
      return NextResponse.json({
        success: false,
        error: `Status inválido: ${novoStatus}`
      }, { status: 400 })
    }

    // Tentar update direto primeiro
    const { data, error } = await supabase
      .from('aura_jobs_candidatos')
      .update({ status: novoStatus })
      .eq('id', candidatoId)
      .select()

    if (error) {
      console.error('❌ Erro ao atualizar status (tentativa 1):', error)

      // Se falhar, tentar via raw SQL com cast explícito
      const { data: rawData, error: rawError } = await supabase.rpc('exec_raw_sql', {
        query: `
          UPDATE aura_jobs_candidatos
          SET status = $1::text::candidato_status,
              updated_at = NOW()
          WHERE id = $2::uuid
          RETURNING *
        `,
        params: [novoStatus, candidatoId]
      })

      if (rawError) {
        console.error('❌ Erro ao atualizar status (tentativa 2 - raw SQL):', rawError)

        // Última tentativa: update sem type cast
        const { error: finalError } = await supabase
          .from('aura_jobs_candidatos')
          .update({
            status: novoStatus,
            updated_at: new Date().toISOString()
          } as any)
          .eq('id', candidatoId)

        if (finalError) {
          return NextResponse.json({
            success: false,
            error: `Erro ao atualizar status: ${finalError.message}. O valor '${novoStatus}' pode não existir no enum do banco de dados. Execute: ALTER TYPE candidato_status ADD VALUE '${novoStatus}';`
          }, { status: 500 })
        }
      }
    }

    console.log('✅ Status atualizado com sucesso para:', novoStatus)

    return NextResponse.json({
      success: true,
      candidatoId,
      novoStatus
    })

  } catch (error: any) {
    console.error('❌ Erro geral na API update-status:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
