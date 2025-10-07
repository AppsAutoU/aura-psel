const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
require('dotenv').config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function createTableViaAPI() {
  console.log('Creating aura_jobs_avaliador_sessions table via Supabase Management API...\n')

  const sql = fs.readFileSync('/tmp/create-sessions-table.sql', 'utf8')

  try {
    // Extract project ref from URL
    const projectRef = process.env.NEXT_PUBLIC_SUPABASE_URL.match(/https:\/\/(.+?)\.supabase\.co/)[1]
    console.log('Project ref:', projectRef)

    // Use Supabase Management API to execute SQL
    const response = await fetch(
      `https://${projectRef}.supabase.co/rest/v1/rpc/exec`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          query: sql
        })
      }
    )

    const result = await response.text()
    console.log('Response status:', response.status)
    console.log('Response:', result)

    if (response.status === 200 || response.status === 201) {
      console.log('\n✅ Table created successfully!')
    } else {
      console.log('\n⚠️  Could not create via API. Trying direct PostgreSQL connection...')
      await createTableDirectPG()
    }
  } catch (error) {
    console.error('❌ Error:', error.message)
    console.log('\nTrying direct PostgreSQL connection...')
    await createTableDirectPG()
  }
}

async function createTableDirectPG() {
  // Try to use psql with connection string
  const { exec } = require('child_process')
  const util = require('util')
  const execPromise = util.promisify(exec)

  // Extract project ref from URL
  const projectRef = process.env.NEXT_PUBLIC_SUPABASE_URL.match(/https:\/\/(.+?)\.supabase\.co/)[1]

  // Supabase connection details
  const host = `db.${projectRef}.supabase.co`
  const database = 'postgres'
  const user = 'postgres'
  const password = 'PaulaCoquetel13*'
  const port = 5432

  console.log('\nAttempting direct PostgreSQL connection...')
  console.log('Host:', host)

  try {
    const { stdout, stderr } = await execPromise(
      `psql "postgresql://${user}:${encodeURIComponent(password)}@${host}:${port}/${database}" -f /tmp/create-sessions-table.sql`,
      { encoding: 'utf8' }
    )

    console.log('✅ Table created successfully via psql!')
    console.log('Output:', stdout)
    if (stderr) console.log('Warnings:', stderr)

    // Verify it worked
    await verifyTable()
  } catch (error) {
    console.error('❌ Error with psql:', error.message)
    console.log('\n⚠️  Please create the table manually in Supabase SQL Editor:')
    console.log('https://supabase.com/dashboard/project/' + projectRef + '/sql/new')
    console.log('\nSQL:\n')
    console.log(fs.readFileSync('/tmp/create-sessions-table.sql', 'utf8'))
  }
}

async function verifyTable() {
  console.log('\nVerifying table creation...')

  const { data, error } = await supabase
    .from('aura_jobs_avaliador_sessions')
    .select('id')
    .limit(1)

  if (error) {
    console.log('❌ Table verification failed:', error.message)
  } else {
    console.log('✅ Table verified and accessible!')
    console.log('\n🎉 Setup complete! You can now login at:')
    console.log('   URL: http://localhost:3000/avaliador/auth/login')
    console.log('   Email: lucca.scarpa@autou.io')
    console.log('   Password: 123456')
  }
}

createTableViaAPI()
