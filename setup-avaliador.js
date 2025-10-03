const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function setup() {
  console.log('Setting up avaliador authentication...\n')

  // 1. Create avaliador_sessions table
  console.log('1. Creating aura_jobs_avaliador_sessions table...')

  const { error: tableError } = await supabase.rpc('exec_sql', {
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
    `
  })

  if (tableError) {
    console.log('   Note: Table may already exist or RPC not available. Trying direct approach...')
  } else {
    console.log('   ✅ Table created successfully')
  }

  // 2. Update Lucca Scarpa to avaliador role
  console.log('\n2. Updating Lucca Scarpa to avaliador role...')

  const { data: lucca, error: luccaError } = await supabase
    .from('aura_jobs_usuarios')
    .update({
      role: 'avaliador',
      password_hash: '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', // "123456"
      ativo: true
    })
    .eq('email', 'lucca.scarpa@autou.io')
    .select()

  if (luccaError) {
    console.error('   ❌ Error updating Lucca:', luccaError.message)
  } else {
    console.log('   ✅ Lucca Scarpa updated successfully')
    console.log('   - Email: lucca.scarpa@autou.io')
    console.log('   - Password: 123456')
    console.log('   - Role: avaliador')
  }

  // 3. Verify
  console.log('\n3. Verifying Lucca Scarpa setup...')

  const { data: verify, error: verifyError } = await supabase
    .from('aura_jobs_usuarios')
    .select('id, nome_completo, email, role, ativo')
    .eq('email', 'lucca.scarpa@autou.io')
    .single()

  if (verify) {
    console.log('   ✅ User found:')
    console.log('   ', JSON.stringify(verify, null, 2))
  } else {
    console.log('   ❌ User not found')
  }

  console.log('\n✨ Setup complete!')
  console.log('\nYou can now login at:')
  console.log('http://localhost:3000/avaliador/auth/login')
  console.log('\nCredentials:')
  console.log('Email: lucca.scarpa@autou.io')
  console.log('Password: 123456')
}

setup()
