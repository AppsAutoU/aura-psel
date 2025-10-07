const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function createTable() {
  console.log('Creating avaliador_sessions table manually...\n')

  // First, let's try to create the table using admin API
  // We'll do this by making a direct SQL query through Supabase

  const { data, error } = await supabase
    .from('aura_jobs_avaliador_sessions')
    .select('*')
    .limit(1)

  if (error && error.message.includes('does not exist')) {
    console.log('❌ Table does not exist. Please run this SQL in Supabase SQL Editor:\n')
    console.log(`
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
    `)
    console.log('\nGo to: https://supabase.com/dashboard/project/xjnjfytapohglezpwksf/sql/new')
  } else if (error) {
    console.log('Error checking table:', error.message)
  } else {
    console.log('✅ Table already exists!')
  }
}

createTable()
