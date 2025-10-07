const { Client } = require('pg')
const fs = require('fs')
require('dotenv').config()

async function createTable() {
  // Extract project ref from URL
  const projectRef = process.env.NEXT_PUBLIC_SUPABASE_URL.match(/https:\/\/(.+?)\.supabase\.co/)[1]

  const client = new Client({
    host: `db.${projectRef}.supabase.co`,
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: 'PaulaCoquetel13*',
    ssl: {
      rejectUnauthorized: false
    }
  })

  try {
    console.log('Connecting to PostgreSQL...')
    await client.connect()
    console.log('✅ Connected!')

    const sql = fs.readFileSync('/tmp/create-sessions-table.sql', 'utf8')

    console.log('\nExecuting SQL...')
    await client.query(sql)

    console.log('✅ Table created successfully!')

    // Verify
    console.log('\nVerifying table...')
    const result = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_name = 'aura_jobs_avaliador_sessions'
    `)

    if (result.rows.length > 0) {
      console.log('✅ Table verified:', result.rows[0].table_name)
    }

    console.log('\n🎉 Setup complete! You can now login at:')
    console.log('   URL: http://localhost:3000/avaliador/auth/login')
    console.log('   Email: lucca.scarpa@autou.io')
    console.log('   Password: 123456')

  } catch (error) {
    console.error('❌ Error:', error.message)
    console.error('\nFull error:', error)
  } finally {
    await client.end()
  }
}

createTable()
