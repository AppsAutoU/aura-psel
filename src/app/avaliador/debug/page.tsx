'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function DebugPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function test() {
      const supabase = createClient()

      // Test 1: Auth
      const { data: { user } } = await supabase.auth.getUser()
      console.log('🔐 AUTH USER:', user)

      // Test 2: Direct query
      const { data: candidatos, error } = await supabase
        .from('aura_jobs_candidatos')
        .select('id, nome_completo, email, status')
        .in('status', ['case_enviado', 'em_avaliacao_case'])

      console.log('📊 CANDIDATOS:', candidatos)
      console.log('❌ ERROR:', error)

      setData({ user, candidatos, error })
      setLoading(false)
    }
    test()
  }, [])

  if (loading) return <div className="p-6">Carregando...</div>

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">DEBUG Portal Avaliador</h1>

      <div className="bg-white p-4 rounded border">
        <h2 className="font-bold mb-2">🔐 Usuário Autenticado:</h2>
        <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
          {JSON.stringify(data?.user, null, 2)}
        </pre>
      </div>

      <div className="bg-white p-4 rounded border">
        <h2 className="font-bold mb-2">📊 Candidatos (Total: {data?.candidatos?.length || 0}):</h2>
        <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-96">
          {JSON.stringify(data?.candidatos, null, 2)}
        </pre>
      </div>

      {data?.error && (
        <div className="bg-red-100 p-4 rounded border border-red-300">
          <h2 className="font-bold mb-2 text-red-700">❌ Erro:</h2>
          <pre className="text-xs text-red-600">
            {JSON.stringify(data.error, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}
