import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Missing Supabase credentials' },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    console.log('🔧 Executing migration: Adding nivel_ingles column...')

    // Execute SQL directly using Supabase's SQL execution
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `ALTER TABLE aura_jobs_candidatos ADD COLUMN IF NOT EXISTS nivel_ingles TEXT;`
    })

    if (error) {
      // If exec_sql function doesn't exist, try alternative approach
      console.log('exec_sql not available, checking if column exists...')

      // Try to select the column to see if it exists
      const { error: checkError } = await supabase
        .from('aura_jobs_candidatos')
        .select('nivel_ingles')
        .limit(1)

      if (checkError) {
        if (checkError.code === '42703') {
          // Column doesn't exist
          return NextResponse.json(
            {
              error: 'Column does not exist and exec_sql is not available',
              message: 'Please run this SQL in Supabase dashboard: ALTER TABLE aura_jobs_candidatos ADD COLUMN IF NOT EXISTS nivel_ingles TEXT;',
              originalError: error.message
            },
            { status: 500 }
          )
        }
        return NextResponse.json(
          { error: 'Error checking column', details: checkError.message },
          { status: 500 }
        )
      }

      // Column exists
      return NextResponse.json({
        success: true,
        message: 'Column nivel_ingles already exists!'
      })
    }

    console.log('✅ Migration executed successfully!')

    return NextResponse.json({
      success: true,
      message: 'Column nivel_ingles added successfully!',
      data
    })

  } catch (error: any) {
    console.error('❌ Migration error:', error)
    return NextResponse.json(
      {
        error: 'Migration failed',
        message: error.message,
        sqlToRun: 'ALTER TABLE aura_jobs_candidatos ADD COLUMN IF NOT EXISTS nivel_ingles TEXT;'
      },
      { status: 500 }
    )
  }
}

// GET endpoint to check if column exists
export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Missing Supabase credentials' },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Try to select the column
    const { error } = await supabase
      .from('aura_jobs_candidatos')
      .select('nivel_ingles')
      .limit(1)

    if (error) {
      if (error.code === '42703') {
        return NextResponse.json({
          exists: false,
          message: 'Column nivel_ingles does not exist',
          needsMigration: true
        })
      }
      return NextResponse.json(
        { error: 'Error checking column', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      exists: true,
      message: 'Column nivel_ingles exists!',
      needsMigration: false
    })

  } catch (error: any) {
    return NextResponse.json(
      { error: 'Check failed', message: error.message },
      { status: 500 }
    )
  }
}
