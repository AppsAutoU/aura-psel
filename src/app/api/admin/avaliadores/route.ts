import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET - Listar todos os avaliadores
export async function GET(request: NextRequest) {
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

    // Buscar todos os avaliadores
    const { data: avaliadores, error } = await supabase
      .from('aura_jobs_usuarios')
      .select('*')
      .eq('role', 'avaliador')
      .order('nome_completo', { ascending: true })

    if (error) {
      console.error('Erro ao buscar avaliadores:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: avaliadores })
  } catch (error: any) {
    console.error('Erro na API:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST - Criar novo avaliador
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

    const body = await request.json()
    const {
      email,
      nome_completo,
      tipo_avaliador,
      pode_avaliar_tudo,
      departamento,
      cargo
    } = body

    if (!email || !nome_completo || !tipo_avaliador) {
      return NextResponse.json({
        error: 'email, nome_completo e tipo_avaliador são obrigatórios'
      }, { status: 400 })
    }

    // Criar avaliador
    const { data, error } = await supabase
      .from('aura_jobs_usuarios')
      .insert({
        email,
        nome_completo,
        role: 'avaliador',
        tipo_avaliador,
        pode_avaliar_tudo: pode_avaliar_tudo || false,
        departamento,
        cargo,
        ativo: true
      })
      .select()
      .single()

    if (error) {
      console.error('Erro ao criar avaliador:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data,
      message: 'Avaliador criado com sucesso'
    })
  } catch (error: any) {
    console.error('Erro na API:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PATCH - Atualizar avaliador
export async function PATCH(request: NextRequest) {
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

    const body = await request.json()
    const {
      id,
      nome_completo,
      tipo_avaliador,
      pode_avaliar_tudo,
      departamento,
      cargo,
      ativo
    } = body

    if (!id) {
      return NextResponse.json({ error: 'id é obrigatório' }, { status: 400 })
    }

    // Atualizar avaliador
    const { data, error } = await supabase
      .from('aura_jobs_usuarios')
      .update({
        ...(nome_completo && { nome_completo }),
        ...(tipo_avaliador && { tipo_avaliador }),
        ...(pode_avaliar_tudo !== undefined && { pode_avaliar_tudo }),
        ...(departamento !== undefined && { departamento }),
        ...(cargo !== undefined && { cargo }),
        ...(ativo !== undefined && { ativo }),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('role', 'avaliador')
      .select()
      .single()

    if (error) {
      console.error('Erro ao atualizar avaliador:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data,
      message: 'Avaliador atualizado com sucesso'
    })
  } catch (error: any) {
    console.error('Erro na API:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
