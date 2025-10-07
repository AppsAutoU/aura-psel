import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()

    // Buscar uma vaga para ver quais campos existem
    const { data, error } = await supabase
      .from('aura_jobs_vagas')
      .select('*')
      .limit(1)

    if (error) {
      return NextResponse.json({
        error: error.message,
        details: error
      }, { status: 500 })
    }

    const vaga = data?.[0] || {}
    const campos = Object.keys(vaga)
    const temPrazoCase = campos.includes('prazo_case_dias')

    return NextResponse.json({
      success: true,
      campos_disponiveis: campos,
      tem_prazo_case_dias: temPrazoCase,
      exemplo_vaga: vaga
    })

  } catch (error: any) {
    return NextResponse.json({
      error: error.message
    }, { status: 500 })
  }
}
