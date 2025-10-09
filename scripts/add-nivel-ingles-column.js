const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function addNivelInglesColumn() {
  console.log('🔧 Adding nivel_ingles column to aura_jobs_candidatos...')

  try {
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE aura_jobs_candidatos
        ADD COLUMN IF NOT EXISTS nivel_ingles TEXT;

        COMMENT ON COLUMN aura_jobs_candidatos.nivel_ingles IS 'Nível de inglês do candidato (Básico, Intermediário, Avançado, Fluente, Nativo)';
      `
    })

    if (error) {
      console.error('❌ Error:', error.message)

      // Try alternative approach using direct SQL
      console.log('🔄 Trying alternative approach...')
      const { error: directError } = await supabase
        .from('aura_jobs_candidatos')
        .select('nivel_ingles')
        .limit(1)

      if (directError && directError.code === '42703') {
        console.error('❌ Column does not exist. Please run the SQL migration manually in Supabase dashboard:')
        console.log('\n--- SQL TO RUN ---')
        console.log('ALTER TABLE aura_jobs_candidatos ADD COLUMN IF NOT EXISTS nivel_ingles TEXT;')
        console.log('------------------\n')
        process.exit(1)
      } else if (!directError) {
        console.log('✅ Column already exists!')
        process.exit(0)
      }
    } else {
      console.log('✅ Column added successfully!')
    }
  } catch (err) {
    console.error('❌ Unexpected error:', err.message)
    console.log('\n📝 Please run this SQL manually in Supabase dashboard:')
    console.log('ALTER TABLE aura_jobs_candidatos ADD COLUMN IF NOT EXISTS nivel_ingles TEXT;')
    process.exit(1)
  }
}

addNivelInglesColumn()
