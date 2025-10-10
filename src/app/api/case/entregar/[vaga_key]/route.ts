import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(
  request: NextRequest,
  { params }: { params: { vaga_key: string } }
) {
  try {
    const { vaga_key } = params
    const body = await request.json()

    console.log('📥 Recebendo entrega de case:')
    console.log('  vaga_key:', vaga_key)
    console.log('  body:', JSON.stringify(body, null, 2))

    const {
      email,
      url_entregavel_1,
      url_entregavel_2,
      url_video,
      comentarios_adicionais
    } = body

    // Validação
    if (!email) {
      return NextResponse.json(
        { error: 'Email é obrigatório' },
        { status: 400 }
      )
    }

    if (!url_entregavel_1 && !url_entregavel_2 && !url_video) {
      return NextResponse.json(
        { error: 'É necessário enviar pelo menos um entregável' },
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

    // 1. Buscar a vaga pelo vaga_key
    const { data: vaga, error: vagaError } = await supabase
      .from('aura_jobs_vagas')
      .select('id, titulo')
      .eq('vaga_key', vaga_key)
      .single()

    if (vagaError || !vaga) {
      console.error('Erro ao buscar vaga:', vagaError)
      return NextResponse.json(
        { error: 'Vaga não encontrada' },
        { status: 404 }
      )
    }

    // 2. Buscar o candidato pelo email E vaga_id (específico para esta vaga!)
    const { data: candidato, error: candidatoError } = await supabase
      .from('aura_jobs_candidatos')
      .select('id, nome_completo, status')
      .eq('email', email)
      .eq('vaga_id', vaga.id)
      .single()

    if (candidatoError || !candidato) {
      console.error('Erro ao buscar candidato:', candidatoError)
      return NextResponse.json(
        {
          error: `Candidato não encontrado para a vaga "${vaga.titulo}". Verifique se você está usando o email correto da sua inscrição.`
        },
        { status: 404 }
      )
    }

    // 3. Atualizar o candidato com os entregáveis
    const updateData = {
      url_entregavel_1: url_entregavel_1 || null,
      url_entregavel_2: url_entregavel_2 || null,
      url_video: url_video || null,
      comentarios_adicionais: comentarios_adicionais || null,
      status: 'case_enviado',
      case_enviado: true,
      data_envio_case: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    console.log('💾 Atualizando candidato com dados:', JSON.stringify(updateData, null, 2))

    const { data: updated, error: updateError } = await supabase
      .from('aura_jobs_candidatos')
      .update(updateData)
      .eq('id', candidato.id)
      .select()
      .single()

    if (updateError) {
      console.error('❌ Erro ao atualizar candidato:', updateError)
      console.error('   Detalhes:', JSON.stringify(updateError, null, 2))
      return NextResponse.json(
        { error: 'Erro ao salvar entrega do case', details: updateError.message },
        { status: 500 }
      )
    }

    console.log(`✅ Case salvo em aura_jobs_candidatos! Candidato: ${candidato.nome_completo} (${email}) | Vaga: ${vaga.titulo}`)

    // 4. BACKUP: Salvar também na tabela de entregas (garantia de não perder dados)
    console.log('💾 Salvando backup na tabela aura_jobs_case_entregas...')

    // Buscar versão anterior (se existe)
    const { data: entregasAnteriores } = await supabase
      .from('aura_jobs_case_entregas')
      .select('versao')
      .eq('candidato_id', candidato.id)
      .eq('vaga_id', vaga.id)
      .order('versao', { ascending: false })
      .limit(1)

    const novaVersao = entregasAnteriores && entregasAnteriores.length > 0
      ? (entregasAnteriores[0].versao || 0) + 1
      : 1

    // Extrair IP e User-Agent do request
    const ip = request.headers.get('x-forwarded-for') ||
                request.headers.get('x-real-ip') ||
                'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    const backupData = {
      candidato_id: candidato.id,
      vaga_id: vaga.id,
      candidato_email: email,
      candidato_nome: candidato.nome_completo,
      vaga_titulo: vaga.titulo,
      vaga_key: vaga_key,
      url_entregavel_1: url_entregavel_1 || null,
      url_entregavel_2: url_entregavel_2 || null,
      url_video: url_video || null,
      comentarios_adicionais: comentarios_adicionais || null,
      ip_address: ip,
      user_agent: userAgent,
      request_payload: body,
      versao: novaVersao,
      is_latest: true
    }

    const { data: backupSaved, error: backupError } = await supabase
      .from('aura_jobs_case_entregas')
      .insert(backupData)
      .select()
      .single()

    if (backupError) {
      console.error('⚠️ Erro ao salvar backup (mas dados principais foram salvos):', backupError)
      // NÃO retornar erro aqui - o importante é que salvou em candidatos
    } else {
      console.log(`✅ Backup salvo! ID: ${backupSaved.id} | Versão: ${novaVersao}`)
    }

    console.log('🎉 ENTREGA COMPLETA - Dados salvos em DUAS tabelas (candidatos + backup)!')

    return NextResponse.json({
      success: true,
      message: 'Case entregue com sucesso!',
      data: {
        candidato_id: candidato.id,
        vaga_id: vaga.id,
        vaga_titulo: vaga.titulo,
        backup_id: backupSaved?.id,
        versao: novaVersao
      }
    })

  } catch (error: any) {
    console.error('Erro na API de entrega de case:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
