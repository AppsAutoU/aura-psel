'use client'

import { useState } from 'react'

export default function SetupAvaliadorPage() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const checkTable = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/setup/avaliador-sessions', {
        method: 'POST'
      })
      const data = await response.json()
      setResult(data)
    } catch (error: any) {
      setResult({ success: false, error: error.message })
    } finally {
      setLoading(false)
    }
  }

  const copySQL = () => {
    if (result?.sql) {
      navigator.clipboard.writeText(result.sql)
      alert('SQL copied to clipboard!')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Setup Portal Avaliador</h1>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Create Sessions Table</h2>
          <p className="text-gray-600 mb-4">
            Click the button below to check if the avaliador sessions table exists.
          </p>

          <button
            onClick={checkTable}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Checking...' : 'Check Table'}
          </button>
        </div>

        {result && (
          <div className={`rounded-lg shadow p-6 ${result.success ? 'bg-green-50' : 'bg-red-50'}`}>
            <h3 className="text-lg font-semibold mb-3">
              {result.success ? '✅ Success' : '❌ Table Missing'}
            </h3>

            <p className="mb-4">{result.message}</p>

            {!result.success && result.sql && (
              <div>
                <p className="font-semibold mb-2">Create the table in Supabase:</p>
                <ol className="list-decimal list-inside mb-4 space-y-1">
                  <li>
                    Go to{' '}
                    <a
                      href={result.supabaseUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      Supabase SQL Editor
                    </a>
                  </li>
                  <li>Copy the SQL below</li>
                  <li>Paste and run it in the SQL Editor</li>
                  <li>Come back and click &quot;Check Table&quot; again</li>
                </ol>

                <div className="relative">
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded overflow-x-auto text-sm">
                    {result.sql}
                  </pre>
                  <button
                    onClick={copySQL}
                    className="absolute top-2 right-2 bg-gray-700 text-white px-3 py-1 rounded text-sm hover:bg-gray-600"
                  >
                    Copy SQL
                  </button>
                </div>
              </div>
            )}

            {result.success && (
              <div>
                <p className="font-semibold text-green-700 mb-2">
                  You can now login to the Portal Avaliador!
                </p>
                <a
                  href="/avaliador/auth/login"
                  className="inline-block bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
                >
                  Go to Login
                </a>
                <div className="mt-4 p-3 bg-white rounded border">
                  <p className="text-sm font-mono">
                    <strong>Email:</strong> lucca.scarpa@autou.io<br />
                    <strong>Password:</strong> 123456
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
