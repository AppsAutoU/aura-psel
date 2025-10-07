import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()

  // Tentar buscar estrutura da tabela avaliacoes
  const { data, error } = await supabase
    .from('avaliacoes')
    .select('*')
    .limit(1)

  return NextResponse.json({
    exists: !error,
    error: error?.message,
    errorDetails: error,
    sampleData: data
  })
}
