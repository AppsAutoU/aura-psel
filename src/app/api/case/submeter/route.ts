import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import * as fs from 'fs'
import * as path from 'path'

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
      comentarios_adicionais,
      source
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

    // Buscar candidato pelo email para vincular E pegar vaga_id
    const { data: candidato } = await supabase
      .from('aura_jobs_candidatos')
      .select('id, vaga_id')
      .eq('email', email)
      .single()

    // Obter IP do cliente
    const ip = request.headers.get('x-forwarded-for') ||
                request.headers.get('x-real-ip') ||
                'unknown'

    // Preparar dados para salvar
    const entregaData = {
      id: crypto.randomUUID(),
      candidato_id: candidato?.id || null,
      vaga_id: candidato?.vaga_id || null,
      nome_completo,
      email,
      tipo_case,
      link_entregavel_1: link_entregavel_1 || null,
      link_entregavel_2: link_entregavel_2 || null,
      link_entregavel_3: link_entregavel_3 || null,
      comentarios_adicionais: comentarios_adicionais || null,
      source: source || null,
      ip_submissao: ip,
      data_submissao: new Date().toISOString()
    }

    // TENTAR SALVAR NO BANCO PRIMEIRO
    let salvouNoBanco = false
    const { data: dbData, error: dbError } = await supabase
      .from('aura_jobs_case_entregas')
      .insert([entregaData])
      .select()
      .single()

    if (!dbError) {
      salvouNoBanco = true
      console.log(`✅ Case salvo no BANCO! ID: ${dbData.id}, Email: ${email}`)
    } else {
      console.log(`⚠️ Banco indisponível, salvando em JSON: ${dbError.message}`)
    }

    // SEMPRE SALVAR EM JSON COMO BACKUP (ou principal se banco falhar)
    try {
      const dataDir = path.join(process.cwd(), 'data', 'case-entregas')

      // Garantir que a pasta existe
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true })
      }

      // Salvar em arquivo individual (mais seguro)
      const fileName = `${entregaData.id}.json`
      const filePath = path.join(dataDir, fileName)

      fs.writeFileSync(filePath, JSON.stringify(entregaData, null, 2))
      console.log(`✅ Case salvo em JSON: ${fileName}`)

      // Também manter um índice de todos
      const indexPath = path.join(dataDir, '_index.json')
      let index: any[] = []

      if (fs.existsSync(indexPath)) {
        index = JSON.parse(fs.readFileSync(indexPath, 'utf-8'))
      }

      index.push({
        id: entregaData.id,
        email: entregaData.email,
        nome_completo: entregaData.nome_completo,
        data_submissao: entregaData.data_submissao,
        tipo_case: entregaData.tipo_case,
        source: entregaData.source,
        salvo_no_banco: salvouNoBanco
      })

      fs.writeFileSync(indexPath, JSON.stringify(index, null, 2))

    } catch (fsError: any) {
      console.error('⚠️ Erro ao salvar JSON:', fsError.message)
      // Não bloqueia o fluxo
    }

    return NextResponse.json({
      success: true,
      message: 'Case entregue com sucesso!',
      id: entregaData.id,
      salvo_em: salvouNoBanco ? 'banco' : 'arquivo_json',
      backup_json: true
    })

  } catch (error: any) {
    console.error('Erro na API de submissão de case:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
