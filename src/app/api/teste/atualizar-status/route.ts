import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { candidato_id, status } = await request.json()

    const supabase = await createClient()

    const { error } = await supabase
      .from('aura_jobs_candidatos')
      .update({
        status: status,
        fase_atual: status === 'case_enviado' ? 'case_pratico' : 'inscricao'
      })
      .eq('id', candidato_id)

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: `Status atualizado para: ${status}`
    })

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
