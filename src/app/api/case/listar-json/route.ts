import { NextRequest, NextResponse } from 'next/server'
import * as fs from 'fs'
import * as path from 'path'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const candidatoId = searchParams.get('candidato_id')

    const dataDir = path.join(process.cwd(), 'data', 'case-entregas')

    // Se a pasta não existe, retorna vazio
    if (!fs.existsSync(dataDir)) {
      return NextResponse.json({
        success: true,
        data: [],
        source: 'json',
        message: 'Nenhuma entrega encontrada'
      })
    }

    // Se busca por candidato específico
    if (candidatoId) {
      const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.json') && f !== '_index.json')

      for (const file of files) {
        const filePath = path.join(dataDir, file)
        const fileContent = fs.readFileSync(filePath, 'utf-8')
        const entrega = JSON.parse(fileContent)

        if (entrega.candidato_id === candidatoId) {
          return NextResponse.json({
            success: true,
            data: entrega,
            source: 'json'
          })
        }
      }

      return NextResponse.json({
        success: true,
        data: null,
        source: 'json',
        message: 'Entrega não encontrada para este candidato'
      })
    }

    // Retornar todas as entregas
    const indexPath = path.join(dataDir, '_index.json')

    if (fs.existsSync(indexPath)) {
      const index = JSON.parse(fs.readFileSync(indexPath, 'utf-8'))
      return NextResponse.json({
        success: true,
        data: index,
        source: 'json',
        total: index.length
      })
    }

    return NextResponse.json({
      success: true,
      data: [],
      source: 'json',
      message: 'Índice não encontrado'
    })

  } catch (error: any) {
    console.error('Erro ao listar entregas JSON:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
