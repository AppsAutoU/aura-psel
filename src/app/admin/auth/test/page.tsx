'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function TestAdminAuth() {
  const [result, setResult] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const hashPassword = async (password: string): Promise<string> => {
    const encoder = new TextEncoder()
    const data = encoder.encode(password)
    const hash = await crypto.subtle.digest('SHA-256', data)
    return Array.from(new Uint8Array(hash))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
  }

  const testDatabase = async () => {
    setLoading(true)
    setResult('Testando conexão com banco...\n')
    
    try {
      const supabase = createClient()
      
      // 1. Verificar se a tabela existe
      const { data: usuarios, error: userError } = await supabase
        .from('aura_jobs_usuarios')
        .select('id, email, nome_completo, role, ativo, password_hash')
        .limit(5)
      
      if (userError) {
        setResult(prev => prev + `❌ Erro ao acessar tabela aura_jobs_usuarios: ${userError.message}\n`)
      } else {
        setResult(prev => prev + `✅ Tabela aura_jobs_usuarios acessível\n`)
        setResult(prev => prev + `   Encontrados ${usuarios?.length || 0} usuários\n`)
        
        usuarios?.forEach(u => {
          setResult(prev => prev + `   - ${u.email} (${u.role}) - Ativo: ${u.ativo} - Tem senha: ${!!u.password_hash}\n`)
        })
      }

      // 2. Verificar se a tabela de sessões existe
      const { error: sessionError } = await supabase
        .from('aura_jobs_admin_sessions')
        .select('id')
        .limit(1)
      
      if (sessionError) {
        setResult(prev => prev + `\n❌ Tabela aura_jobs_admin_sessions não existe ou não está acessível\n`)
        setResult(prev => prev + `   Execute o script SQL para criar a tabela\n`)
      } else {
        setResult(prev => prev + `\n✅ Tabela aura_jobs_admin_sessions existe\n`)
      }

      // 3. Testar hash de senha
      const testPassword = 'admin123456'
      const hash = await hashPassword(testPassword)
      setResult(prev => prev + `\n📝 Hash da senha "admin123456":\n   ${hash}\n`)
      
      // 4. Verificar usuário admin específico
      const { data: adminUser, error: adminError } = await supabase
        .from('aura_jobs_usuarios')
        .select('*')
        .eq('email', 'admin@autou.com.br')
        .single()
      
      if (adminError) {
        setResult(prev => prev + `\n❌ Usuário admin@autou.com.br não encontrado\n`)
        
        // Tentar criar
        setResult(prev => prev + `\n🔧 Tentando criar usuário admin...\n`)
        const { error: createError } = await supabase
          .from('aura_jobs_usuarios')
          .insert([{
            email: 'admin@autou.com.br',
            nome_completo: 'Administrador',
            password_hash: hash,
            role: 'admin',
            departamento: 'TI',
            cargo: 'Administrador',
            ativo: true
          }])
        
        if (createError) {
          setResult(prev => prev + `❌ Erro ao criar admin: ${createError.message}\n`)
        } else {
          setResult(prev => prev + `✅ Admin criado com sucesso!\n`)
          setResult(prev => prev + `   Email: admin@autou.com.br\n`)
          setResult(prev => prev + `   Senha: admin123456\n`)
        }
      } else {
        setResult(prev => prev + `\n✅ Usuário admin encontrado:\n`)
        setResult(prev => prev + `   Email: ${adminUser.email}\n`)
        setResult(prev => prev + `   Nome: ${adminUser.nome_completo}\n`)
        setResult(prev => prev + `   Role: ${adminUser.role}\n`)
        setResult(prev => prev + `   Ativo: ${adminUser.ativo}\n`)
        setResult(prev => prev + `   Tem senha: ${!!adminUser.password_hash}\n`)
        
        if (!adminUser.password_hash) {
          // Atualizar senha
          setResult(prev => prev + `\n🔧 Atualizando senha do admin...\n`)
          const { error: updateError } = await supabase
            .from('aura_jobs_usuarios')
            .update({ password_hash: hash })
            .eq('id', adminUser.id)
          
          if (updateError) {
            setResult(prev => prev + `❌ Erro ao atualizar senha: ${updateError.message}\n`)
          } else {
            setResult(prev => prev + `✅ Senha atualizada!\n`)
          }
        }
      }
      
    } catch (error: any) {
      setResult(prev => prev + `\n❌ Erro geral: ${error.message}\n`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Teste de Autenticação Admin</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <button
            onClick={testDatabase}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Testando...' : 'Testar Banco de Dados'}
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Resultado:</h2>
          <pre className="whitespace-pre-wrap font-mono text-sm bg-gray-100 p-4 rounded">
            {result || 'Clique no botão acima para iniciar o teste'}
          </pre>
        </div>

        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-900 mb-2">Instruções:</h3>
          <ol className="list-decimal list-inside text-sm text-yellow-800 space-y-1">
            <li>Execute este teste primeiro para verificar o estado do banco</li>
            <li>Se houver erros, execute o script SQL: fix_admin_auth.sql</li>
            <li>O sistema criará automaticamente o usuário admin se não existir</li>
            <li>Use admin@autou.com.br / admin123456 para fazer login</li>
          </ol>
        </div>
      </div>
    </div>
  )
}