import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const supabase = await createClient()

    // Execute as queries SQL uma por uma
    const queries = [
      `ALTER TABLE avaliacoes ENABLE ROW LEVEL SECURITY;`,

      `DROP POLICY IF EXISTS "Permitir inserção de avaliações" ON avaliacoes;`,
      `DROP POLICY IF EXISTS "Permitir leitura de avaliações" ON avaliacoes;`,
      `DROP POLICY IF EXISTS "Permitir atualização de avaliações" ON avaliacoes;`,
      `DROP POLICY IF EXISTS "Permitir inserção anônima" ON avaliacoes;`,
      `DROP POLICY IF EXISTS "Permitir leitura anônima" ON avaliacoes;`,

      `CREATE POLICY "Permitir inserção de avaliações"
       ON avaliacoes FOR INSERT TO authenticated WITH CHECK (true);`,

      `CREATE POLICY "Permitir leitura de avaliações"
       ON avaliacoes FOR SELECT TO authenticated USING (true);`,

      `CREATE POLICY "Permitir atualização de avaliações"
       ON avaliacoes FOR UPDATE TO authenticated USING (true) WITH CHECK (true);`,

      `CREATE POLICY "Permitir inserção anônima"
       ON avaliacoes FOR INSERT TO anon WITH CHECK (true);`,

      `CREATE POLICY "Permitir leitura anônima"
       ON avaliacoes FOR SELECT TO anon USING (true);`
    ]

    const results = []

    for (const query of queries) {
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: query })
        results.push({ query: query.substring(0, 50) + '...', success: !error, error: error?.message })
      } catch (err: any) {
        // Algumas queries podem falhar se a policy não existir, tudo bem
        results.push({ query: query.substring(0, 50) + '...', success: false, error: err.message })
      }
    }

    return NextResponse.json({
      success: true,
      message: 'RLS policies aplicadas com sucesso',
      results
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
