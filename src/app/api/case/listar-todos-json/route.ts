import { NextResponse } from 'next/server'
import * as fs from 'fs'
import * as path from 'path'

export async function GET() {
  try {
    const dataDir = path.join(process.cwd(), 'data', 'case-entregas')

    // Se a pasta não existe, retorna vazio
    if (!fs.existsSync(dataDir)) {
      return NextResponse.json({
        success: true,
        data: [],
        total: 0
      })
    }

    const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.json') && f !== '_index.json')

    const entregas = files.map(file => {
      const filePath = path.join(dataDir, file)
      const fileContent = fs.readFileSync(filePath, 'utf-8')
      return JSON.parse(fileContent)
    }).sort((a, b) => {
      // Ordenar por data de submissão (mais recente primeiro)
      return new Date(b.data_submissao).getTime() - new Date(a.data_submissao).getTime()
    })

    return NextResponse.json({
      success: true,
      data: entregas,
      total: entregas.length
    })

  } catch (error: any) {
    console.error('Erro ao listar todas as entregas:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
