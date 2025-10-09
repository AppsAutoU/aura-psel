import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Missing Supabase credentials' },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Buscar candidatos com status 'inscrito' que ainda não foram avaliados
    const { data: candidatos, error } = await supabase
      .from('aura_jobs_candidatos')
      .select('id, nome_completo, status')
      .eq('status', 'inscrito')

    if (error) {
      return NextResponse.json(
        { error: 'Erro ao buscar candidatos', details: error.message },
        { status: 500 }
      )
    }

    if (!candidatos || candidatos.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Nenhum candidato pendente de avaliação',
        total: 0
      })
    }

    console.log(`🤖 Iniciando avaliação IA para ${candidatos.length} candidatos pendentes...`)

    // Atualizar status para 'em_avaliacao_ia' e iniciar avaliação em background
    const avaliacoes = candidatos.map(async (candidato) => {
      try {
        // Atualizar status
        await supabase
          .from('aura_jobs_candidatos')
          .update({
            status: 'em_avaliacao_ia',
            fase_atual: 'avaliacao_ia'
          })
          .eq('id', candidato.id)

        // Iniciar avaliação IA em background
        fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/ai/avaliar-candidato`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ candidato_id: candidato.id })
        }).catch(err => {
          console.error(`Erro ao avaliar candidato ${candidato.id}:`, err)
        })

        return { id: candidato.id, nome: candidato.nome_completo, success: true }
      } catch (err: any) {
        console.error(`Erro ao processar candidato ${candidato.id}:`, err)
        return { id: candidato.id, nome: candidato.nome_completo, success: false, error: err.message }
      }
    })

    const resultados = await Promise.all(avaliacoes)

    const sucesso = resultados.filter(r => r.success).length
    const falhas = resultados.filter(r => !r.success).length

    return NextResponse.json({
      success: true,
      message: `Avaliação iniciada para ${candidatos.length} candidatos`,
      total: candidatos.length,
      sucesso,
      falhas,
      resultados
    })

  } catch (error: any) {
    console.error('❌ Erro ao avaliar candidatos pendentes:', error)
    return NextResponse.json(
      { error: 'Erro ao processar avaliações', message: error.message },
      { status: 500 }
    )
  }
}
