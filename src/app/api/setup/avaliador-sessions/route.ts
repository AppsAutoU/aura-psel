import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const supabase = await createClient()

    // Try to create the table by inserting a test record and catching the error
    const testUserId = '00000000-0000-0000-0000-000000000000'
    const testToken = 'test-' + Date.now()
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 24)

    const { error } = await supabase
      .from('aura_jobs_avaliador_sessions')
      .insert([{
        user_id: testUserId,
        token: testToken,
        expires_at: expiresAt.toISOString()
      }])

    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message,
        message: 'Table does not exist. Please create it manually in Supabase SQL Editor.',
        sql: `
CREATE TABLE IF NOT EXISTS aura_jobs_avaliador_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES aura_jobs_usuarios(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ultimo_acesso TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_avaliador_sessions_token ON aura_jobs_avaliador_sessions(token);
CREATE INDEX IF NOT EXISTS idx_avaliador_sessions_user_id ON aura_jobs_avaliador_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_avaliador_sessions_expires_at ON aura_jobs_avaliador_sessions(expires_at);
        `,
        supabaseUrl: 'https://supabase.com/dashboard/project/xjnjfytapohglezpwksf/sql/new'
      }, { status: 500 })
    }

    // Clean up test record
    await supabase
      .from('aura_jobs_avaliador_sessions')
      .delete()
      .eq('token', testToken)

    return NextResponse.json({
      success: true,
      message: 'Table exists and is working correctly!'
    })

  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: err.message
    }, { status: 500 })
  }
}
