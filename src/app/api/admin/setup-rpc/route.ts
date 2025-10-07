import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const supabase = await createClient()

    // SQL para criar a função RPC que atualiza o status com cast
    const sql = `
CREATE OR REPLACE FUNCTION update_candidato_status(
  p_candidato_id UUID,
  p_novo_status TEXT
)
RETURNS void AS $$
BEGIN
  UPDATE aura_jobs_candidatos
  SET status = p_novo_status::candidato_status
  WHERE id = p_candidato_id;
EXCEPTION
  WHEN invalid_text_representation THEN
    -- Se o valor não existe no enum, adiciona e tenta novamente
    EXECUTE format('ALTER TYPE candidato_status ADD VALUE IF NOT EXISTS %L', p_novo_status);
    UPDATE aura_jobs_candidatos
    SET status = p_novo_status::candidato_status
    WHERE id = p_candidato_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
    `

    return NextResponse.json({
      success: true,
      message: 'Execute este SQL no Supabase SQL Editor:',
      sql
    })

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
