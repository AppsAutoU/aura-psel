const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function createSessionsTable() {
  console.log('Creating aura_jobs_avaliador_sessions table...\n')

  try {
    // Try to insert a test row to see if table exists
    const { error: testError } = await supabase
      .from('aura_jobs_avaliador_sessions')
      .select('id')
      .limit(1)

    if (!testError) {
      console.log('✅ Table already exists!')
      return
    }

    // If table doesn't exist, we need to create it via raw SQL
    // Since Supabase doesn't allow direct DDL through the client library,
    // we'll use the REST API directly
    const { data, error } = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/exec_sql`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
        },
        body: JSON.stringify({
          query: `
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
          `
        })
      }
    ).then(res => res.json())

    console.log('Response:', data, error)
    console.log('\n✅ Table created successfully!')
  } catch (err) {
    console.error('❌ Error:', err.message)
    console.log('\nPlease create the table manually in Supabase SQL Editor:')
    console.log('https://supabase.com/dashboard/project/xjnjfytapohglezpwksf/sql/new')
    console.log('\nSQL:')
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
  }
}

createSessionsTable()
