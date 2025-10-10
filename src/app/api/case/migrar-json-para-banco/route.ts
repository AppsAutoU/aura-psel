import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import * as fs from 'fs'
import * as path from 'path'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const dataDir = path.join(process.cwd(), 'data', 'case-entregas')

    if (!fs.existsSync(dataDir)) {
      return NextResponse.json({
        success: false,
        message: 'Nenhum arquivo JSON encontrado para migrar'
      })
    }

    const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.json') && f !== '_index.json')

    let migrados = 0
    let erros = 0
    const resultados = []

    for (const file of files) {
      try {
        const filePath = path.join(dataDir, file)
        const fileContent = fs.readFileSync(filePath, 'utf-8')
        const entrega = JSON.parse(fileContent)

        // Tentar inserir no banco
        const { error } = await supabase
          .from('aura_jobs_case_entregas')
          .insert([entrega])

        if (error) {
          console.error(`❌ Erro ao migrar ${file}:`, error.message)
          erros++
          resultados.push({
            arquivo: file,
            status: 'erro',
            erro: error.message
          })
        } else {
          console.log(`✅ Migrado: ${file}`)
          migrados++
          resultados.push({
            arquivo: file,
            status: 'sucesso'
          })

          // Opcional: Renomear arquivo para .migrado
          fs.renameSync(filePath, filePath.replace('.json', '.migrado.json'))
        }

      } catch (err: any) {
        console.error(`❌ Erro ao processar ${file}:`, err.message)
        erros++
        resultados.push({
          arquivo: file,
          status: 'erro',
          erro: err.message
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: `Migração completa! ${migrados} sucesso, ${erros} erros`,
      total_arquivos: files.length,
      migrados,
      erros,
      resultados
    })

  } catch (error: any) {
    console.error('Erro na migração:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
