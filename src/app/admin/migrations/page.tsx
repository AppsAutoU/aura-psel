'use client'

import { useState } from 'react'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function MigrationsPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const executeMigration = async () => {
    setLoading(true)
    setResult(null)
    setError(null)

    try {
      const response = await fetch('/api/migrations/add-nivel-ingles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      const data = await response.json()

      if (response.ok) {
        setResult(data.message || 'Migration executed successfully!')
      } else {
        setError(data.error || data.message || 'Migration failed')
      }
    } catch (err: any) {
      setError(`Error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const checkColumnExists = async () => {
    setLoading(true)
    setResult(null)
    setError(null)

    try {
      const response = await fetch('/api/migrations/add-nivel-ingles', {
        method: 'GET'
      })

      const data = await response.json()

      if (response.ok) {
        setResult(data.message)
      } else {
        setError(data.error || 'Check failed')
      }
    } catch (err: any) {
      setError(`Error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Database Migrations</h1>
          <p className="text-gray-600 mt-2">Execute pending database migrations</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Add nivel_ingles Column</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              This migration adds the <code className="bg-gray-100 px-2 py-1 rounded">nivel_ingles</code> column to the <code className="bg-gray-100 px-2 py-1 rounded">aura_jobs_candidatos</code> table.
            </p>

            <div className="flex gap-3">
              <Button
                onClick={checkColumnExists}
                disabled={loading}
                variant="outline"
              >
                {loading ? 'Checking...' : 'Check if Column Exists'}
              </Button>

              <Button
                onClick={executeMigration}
                disabled={loading}
                variant="primary"
              >
                {loading ? 'Executing...' : 'Execute Migration'}
              </Button>
            </div>

            {result && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">✅ {result}</p>
              </div>
            )}

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800 font-semibold">❌ {error}</p>
                <div className="mt-3 p-3 bg-white border border-red-100 rounded">
                  <p className="text-xs font-semibold text-gray-700 mb-2">Manual SQL (run in Supabase Dashboard):</p>
                  <code className="text-xs text-gray-800 block">
                    ALTER TABLE aura_jobs_candidatos ADD COLUMN IF NOT EXISTS nivel_ingles TEXT;
                  </code>
                </div>
              </div>
            )}

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800 font-semibold mb-2">📝 Manual Instructions:</p>
              <p className="text-xs text-blue-700 mb-2">If the automatic migration fails, run this SQL in Supabase Dashboard:</p>
              <ol className="text-xs text-blue-700 space-y-1 ml-4 list-decimal">
                <li>Go to <a href="https://supabase.com/dashboard" target="_blank" className="underline">Supabase Dashboard</a></li>
                <li>Navigate to SQL Editor</li>
                <li>Paste the SQL below and click Run</li>
              </ol>
              <div className="mt-2 p-2 bg-white border border-blue-100 rounded font-mono text-xs">
                ALTER TABLE aura_jobs_candidatos<br />
                ADD COLUMN IF NOT EXISTS nivel_ingles TEXT;
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
