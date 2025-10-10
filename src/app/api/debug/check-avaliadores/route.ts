import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()

    // Buscar todos os usuários avaliadores
    const { data: avaliadores, error } = await supabase
      .from('aura_jobs_usuarios')
      .select('id, email, role, created_at')
      .eq('role', 'avaliador')

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      total: avaliadores?.length || 0,
      avaliadores: avaliadores || []
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
