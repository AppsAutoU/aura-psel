import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// POST - Atribuir avaliador a uma ou mais vagas
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Verificar se o usuário é admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const { data: admin } = await supabase
      .from('aura_jobs_usuarios')
      .select('id, role')
      .eq('email', user.email)
      .single()

    if (!admin || admin.role !== 'admin') {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
    }

    const body = await request.json()
    const { avaliador_id, vaga_ids } = body

    if (!avaliador_id || !vaga_ids || !Array.isArray(vaga_ids)) {
      return NextResponse.json({
        error: 'avaliador_id e vaga_ids (array) são obrigatórios'
      }, { status: 400 })
    }

    // Criar atribuições
    const atribuicoes = vaga_ids.map(vaga_id => ({
      avaliador_id,
      vaga_id,
      atribuido_por: admin.id
    }))

    const { data, error } = await supabase
      .from('aura_jobs_avaliador_vagas')
      .upsert(atribuicoes, {
        onConflict: 'avaliador_id,vaga_id',
        ignoreDuplicates: false
      })
      .select()

    if (error) {
      console.error('Erro ao atribuir avaliador:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data,
      message: `Avaliador atribuído a ${vaga_ids.length} vaga(s)`
    })
  } catch (error: any) {
    console.error('Erro na API:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE - Remover atribuição de avaliador
export async function DELETE(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const avaliador_id = searchParams.get('avaliador_id')
    const vaga_id = searchParams.get('vaga_id')

    if (!avaliador_id || !vaga_id) {
      return NextResponse.json({
        error: 'avaliador_id e vaga_id são obrigatórios'
      }, { status: 400 })
    }

    const { error } = await supabase
      .from('aura_jobs_avaliador_vagas')
      .delete()
      .eq('avaliador_id', avaliador_id)
      .eq('vaga_id', vaga_id)

    if (error) {
      console.error('Erro ao remover atribuição:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Atribuição removida com sucesso'
    })
  } catch (error: any) {
    console.error('Erro na API:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// GET - Listar atribuições de um avaliador ou de uma vaga
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Verificar autenticação
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const avaliador_id = searchParams.get('avaliador_id')
    const vaga_id = searchParams.get('vaga_id')

    let query = supabase
      .from('aura_jobs_avaliador_vagas')
      .select(`
        *,
        avaliador:aura_jobs_usuarios!avaliador_id(id, nome_completo, email, tipo_avaliador),
        vaga:aura_jobs_vagas!vaga_id(id, titulo, tipo_vaga)
      `)

    if (avaliador_id) {
      query = query.eq('avaliador_id', avaliador_id)
    }

    if (vaga_id) {
      query = query.eq('vaga_id', vaga_id)
    }

    const { data, error } = await query

    if (error) {
      console.error('Erro ao buscar atribuições:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error('Erro na API:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
