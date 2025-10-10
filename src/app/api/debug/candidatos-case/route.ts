import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()

    const { data: candidatos, error } = await supabase
      .from('aura_jobs_candidatos')
      .select('id, nome_completo, email, status, fase_atual, data_envio_case, url_entregavel_1, url_entregavel_2, url_video, vaga_id')
      .in('status', ['case_enviado', 'em_avaliacao_case'])
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message, details: error }, { status: 500 })
    }

    return NextResponse.json({
      total: candidatos?.length || 0,
      candidatos: candidatos || []
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
