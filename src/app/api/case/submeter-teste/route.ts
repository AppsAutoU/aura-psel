import { NextRequest, NextResponse } from 'next/server'
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

    // Validação básica
    if (!nome_completo || !email || !tipo_case) {
      return NextResponse.json(
        { error: 'Nome completo, email e tipo de case são obrigatórios' },
        { status: 400 }
      )
    }

    // Obter IP do cliente
    const ip = request.headers.get('x-forwarded-for') ||
                request.headers.get('x-real-ip') ||
                'unknown'

    // Preparar dados para salvar (SEM buscar candidato - aceita qualquer email)
    const entregaData = {
      id: crypto.randomUUID(),
      candidato_id: null, // ← TESTE: aceita sem candidato
      vaga_id: null, // ← TESTE: aceita sem vaga
      nome_completo,
      email,
      tipo_case,
      link_entregavel_1: link_entregavel_1 || null,
      link_entregavel_2: link_entregavel_2 || null,
      link_entregavel_3: link_entregavel_3 || null,
      comentarios_adicionais: comentarios_adicionais || null,
      source: source || 'teste',
      ip_submissao: ip,
      data_submissao: new Date().toISOString(),
      _TESTE: true // ← Marca como teste para fácil identificação
    }

    // SALVAR EM JSON (modo teste não tenta banco)
    try {
      const dataDir = path.join(process.cwd(), 'data', 'case-entregas')

      // Garantir que a pasta existe
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true })
      }

      // Salvar em arquivo individual
      const fileName = `TESTE_${entregaData.id}.json`
      const filePath = path.join(dataDir, fileName)

      fs.writeFileSync(filePath, JSON.stringify(entregaData, null, 2))
      console.log(`✅ Case de TESTE salvo em JSON: ${fileName}`)

      // Atualizar índice
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
        salvo_no_banco: false,
        _TESTE: true
      })

      fs.writeFileSync(indexPath, JSON.stringify(index, null, 2))

      console.log(`
╔════════════════════════════════════════════════╗
║   🧪 CASE DE TESTE SALVO COM SUCESSO!         ║
╚════════════════════════════════════════════════╝
📧 Email: ${email}
👤 Nome: ${nome_completo}
📁 Arquivo: ${fileName}
📍 Source: ${source || 'teste'}

✅ Agora vá em http://localhost:3000/avaliador
   e procure por este email para ver a entrega!
      `)

    } catch (fsError: any) {
      console.error('❌ Erro ao salvar JSON:', fsError.message)
      return NextResponse.json(
        { error: 'Erro ao salvar entrega de teste' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: '🧪 Case de TESTE enviado com sucesso!',
      id: entregaData.id,
      salvo_em: 'arquivo_json_teste',
      instrucoes: [
        '1. Vá em http://localhost:3000/avaliador',
        `2. Procure por candidato com email: ${email}`,
        '3. Ou busque na lista de cases',
        '4. Clique em "Avaliar"',
        '5. Veja se a entrega aparece automaticamente!'
      ]
    })

  } catch (error: any) {
    console.error('Erro na API de teste:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
