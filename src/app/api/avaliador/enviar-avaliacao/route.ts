import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      candidato_id,
      avaliador_id,
      vaga_id,
      nota_tecnica,
      nota_soft_skills,
      nota_experiencia,
      nota_case,
      comentarios_tecnicos,
      comentarios_soft_skills,
      comentarios_experiencia,
      comentarios_case,
      comentario_geral,
      recomenda_aprovar,
      recomenda_entrevista,
      fase_avaliada
    } = body

    const supabase = await createClient()

    // Inserir a avaliação (server-side bypass RLS)
    const { data: avaliacaoData, error: avaliacaoError } = await supabase
      .from('avaliacoes')
      .insert([{
        candidato_id,
        avaliador_id,
        vaga_id,
        nota_tecnica,
        nota_soft_skills,
        nota_experiencia,
        nota_case,
        comentarios_tecnicos,
        comentarios_soft_skills,
        comentarios_experiencia,
        comentarios_case,
        comentario_geral,
        recomenda_aprovar,
        recomenda_entrevista,
        fase_avaliada
      }])
      .select()

    if (avaliacaoError) {
      console.error('Erro ao inserir avaliação:', avaliacaoError)
      return NextResponse.json({
        success: false,
        error: avaliacaoError.message || 'Erro ao inserir avaliação'
      }, { status: 400 })
    }

    // Atualizar status do candidato
    let novoStatus = 'reprovado_case'
    let novaFase = 'avaliacao_case'

    if (recomenda_entrevista) {
      novoStatus = 'entrevista_tecnica'
      novaFase = 'entrevista_tecnica'
    } else if (recomenda_aprovar) {
      novoStatus = 'aprovado_case'
      novaFase = 'avaliacao_case'
    }

    const { error: updateError } = await supabase
      .from('aura_jobs_candidatos')
      .update({
        status: novoStatus,
        fase_atual: novaFase
      })
      .eq('id', candidato_id)

    if (updateError) {
      console.error('Erro ao atualizar candidato:', updateError)
      return NextResponse.json({
        success: false,
        error: 'Avaliação salva, mas erro ao atualizar status do candidato: ' + updateError.message
      }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: 'Avaliação enviada com sucesso!',
      data: avaliacaoData
    })

  } catch (error: any) {
    console.error('Erro no servidor:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Erro interno do servidor'
    }, { status: 500 })
  }
}
