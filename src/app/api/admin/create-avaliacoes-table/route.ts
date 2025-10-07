import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function POST() {
  try {
    // Ler o arquivo SQL da migration
    const migrationPath = path.join(process.cwd(), 'supabase/migrations/20250103_create_avaliacoes.sql')
    const sql = fs.readFileSync(migrationPath, 'utf8')

    return NextResponse.json({
      success: true,
      message: 'Execute este SQL no painel do Supabase:',
      sql: sql
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
