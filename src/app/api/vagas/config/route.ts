import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// API para gerenciar configurações de vagas (como prazo_case_dias)
// Usa localStorage no frontend como fallback se a tabela não existir

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const vagaId = searchParams.get('vagaId')

    if (!vagaId) {
      return NextResponse.json({
        success: false,
        error: 'vagaId é obrigatório'
      }, { status: 400 })
    }

    // Retornar configuração padrão (será gerenciado no frontend via localStorage)
    return NextResponse.json({
      success: true,
      config: {
        vaga_id: vagaId,
        prazo_case_dias: 5 // Padrão
      }
    })

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { vagaId, prazoCaseDias } = await request.json()

    if (!vagaId || !prazoCaseDias) {
      return NextResponse.json({
        success: false,
        error: 'vagaId e prazoCaseDias são obrigatórios'
      }, { status: 400 })
    }

    // Como não temos a tabela/coluna, vamos apenas confirmar
    // O frontend gerenciará via localStorage
    return NextResponse.json({
      success: true,
      message: 'Configuração salva (gerenciada no frontend)',
      config: {
        vaga_id: vagaId,
        prazo_case_dias: prazoCaseDias
      }
    })

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
