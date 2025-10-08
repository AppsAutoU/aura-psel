import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      nome_completo,
      email,
      tipo_case,
      link_entregavel_1,
      link_entregavel_2,
      link_entregavel_3,
      comentarios_adicionais
    } = body

    // Validação
    if (!nome_completo || !email || !tipo_case) {
      return NextResponse.json(
        { error: 'Nome completo, email e tipo de case são obrigatórios' },
        { status: 400 }
      )
    }

    // Validar tipo de case
    const tiposValidos = ['desenvolvimento', 'consultoria', 'designer-po']
    if (!tiposValidos.includes(tipo_case)) {
      return NextResponse.json(
        { error: 'Tipo de case inválido' },
        { status: 400 }
      )
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Buscar candidato pelo email para vincular (opcional)
    const { data: candidato } = await supabase
      .from('aura_jobs_candidatos')
      .select('id')
      .eq('email', email)
      .single()

    // Obter IP do cliente
    const ip = request.headers.get('x-forwarded-for') ||
                request.headers.get('x-real-ip') ||
                'unknown'

    // Inserir entrega do case
    const { data, error } = await supabase
      .from('aura_jobs_case_entregas')
      .insert([{
        candidato_id: candidato?.id || null,
        nome_completo,
        email,
        tipo_case,
        link_entregavel_1: link_entregavel_1 || null,
        link_entregavel_2: link_entregavel_2 || null,
        link_entregavel_3: link_entregavel_3 || null,
        comentarios_adicionais: comentarios_adicionais || null,
        ip_submissao: ip,
        data_submissao: new Date().toISOString()
      }])
      .select()
      .single()

    if (error) {
      console.error('Erro ao salvar entrega do case:', error)
      return NextResponse.json(
        { error: 'Erro ao salvar entrega do case' },
        { status: 500 }
      )
    }

    console.log(`✅ Case entregue com sucesso! ID: ${data.id}, Email: ${email}, Tipo: ${tipo_case}`)

    return NextResponse.json({
      success: true,
      message: 'Case entregue com sucesso!',
      id: data.id
    })

  } catch (error: any) {
    console.error('Erro na API de submissão de case:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
