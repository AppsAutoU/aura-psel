import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const vagaId = searchParams.get('vaga_id')

    let query = supabase
      .from('aura_jobs_candidatos')
      .select(`
        *,
        aura_jobs_vagas (
          titulo,
          departamento,
          vaga_key
        )
      `)
      .order('created_at', { ascending: false })

    if (vagaId) {
      query = query.eq('vaga_id', vagaId)
    }

    const { data, error } = await query

    if (error) {
      console.error('Erro ao buscar inscrições:', error)
      return NextResponse.json({ error: 'Erro ao buscar inscrições' }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Erro no servidor:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const { data, error } = await supabase
      .from('aura_jobs_candidatos')
      .insert([body])
      .select()
      .single()

    if (error) {
      console.error('Erro ao criar inscrição:', error)
      return NextResponse.json({ error: 'Erro ao criar inscrição' }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Erro no servidor:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}