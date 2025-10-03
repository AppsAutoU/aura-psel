const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    db: {
      schema: 'public'
    },
    auth: {
      persistSession: false
    }
  }
)

async function createTable() {
  console.log('Creating table via direct SQL execution...\n')

  // First, let's verify Lucca Scarpa's account
  console.log('1. Verifying Lucca Scarpa account...')
  const { data: lucca, error: luccaError } = await supabase
    .from('aura_jobs_usuarios')
    .select('id, nome_completo, email, role, ativo, password_hash')
    .eq('email', 'lucca.scarpa@autou.io')
    .single()

  if (luccaError) {
    console.error('   ❌ Error:', luccaError.message)
    return
  }

  console.log('   ✅ User found:')
  console.log('      ID:', lucca.id)
  console.log('      Name:', lucca.nome_completo)
  console.log('      Email:', lucca.email)
  console.log('      Role:', lucca.role)
  console.log('      Active:', lucca.ativo)
  console.log('      Has password:', !!lucca.password_hash)

  // Now let's try to create a test session to see if the table exists
  console.log('\n2. Testing if sessions table exists...')

  const testToken = 'test-' + Date.now()
  const expiresAt = new Date()
  expiresAt.setHours(expiresAt.getHours() + 24)

  const { data: sessionData, error: sessionError } = await supabase
    .from('aura_jobs_avaliador_sessions')
    .insert([{
      user_id: lucca.id,
      token: testToken,
      expires_at: expiresAt.toISOString()
    }])
    .select()

  if (sessionError) {
    console.log('   ❌ Table does not exist')
    console.log('   Error details:', JSON.stringify(sessionError, null, 2))
    console.log('\n   Please create it manually in Supabase SQL Editor:')
    console.log('   https://supabase.com/dashboard/project/xjnjfytapohglezpwksf/sql/new')
    console.log('\n   Copy and paste this SQL:\n')
    console.log('   ' + '-'.repeat(60))
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
    console.log('   ' + '-'.repeat(60))
    console.log('\n✨ After creating the table, test the login!')
    console.log('\nLogin credentials:')
    console.log('  URL: http://localhost:3000/avaliador/auth/login')
    console.log('  Email: lucca.scarpa@autou.io')
    console.log('  Password: 123456')
  } else {
    console.log('   ✅ Table exists! Test session created successfully')
    console.log('      Session ID:', sessionData[0].id)

    // Clean up test session
    await supabase
      .from('aura_jobs_avaliador_sessions')
      .delete()
      .eq('token', testToken)

    console.log('      Test session cleaned up')

    console.log('\n✨ Everything is ready!')
    console.log('\nLogin credentials:')
    console.log('  URL: http://localhost:3000/avaliador/auth/login')
    console.log('  Email: lucca.scarpa@autou.io')
    console.log('  Password: 123456')
  }
}

createTable()
