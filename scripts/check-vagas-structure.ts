import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkStructure() {
  console.log('🔍 Verificando estrutura da tabela aura_jobs_vagas...\n')

  // Tentar buscar uma vaga para ver quais campos retornam
  const { data, error } = await supabase
    .from('aura_jobs_vagas')
    .select('*')
    .limit(1)
    .single()

  if (error) {
    console.error('❌ Erro ao buscar vaga:', error)
    return
  }

  console.log('✅ Campos disponíveis na tabela:')
  console.log(Object.keys(data || {}))
  console.log('\n📋 Dados de exemplo:')
  console.log(data)

  // Verificar se prazo_case_dias existe
  if (data && 'prazo_case_dias' in data) {
    console.log('\n✅ Campo prazo_case_dias EXISTE')
    console.log(`   Valor: ${data.prazo_case_dias}`)
  } else {
    console.log('\n❌ Campo prazo_case_dias NÃO EXISTE')
  }
}

checkStructure()
