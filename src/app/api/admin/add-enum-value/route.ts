import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const supabase = await createClient()

    // Verificar valores atuais do enum
    const { data: currentValues, error: checkError } = await supabase.rpc('get_enum_values', {
      enum_name: 'candidato_status'
    })

    console.log('📋 Valores atuais do enum:', currentValues)

    // Adicionar 'reprovado_socios' ao enum se não existir
    const { data, error } = await supabase.rpc('add_enum_value_if_not_exists', {
      enum_name: 'candidato_status',
      new_value: 'reprovado_socios'
    })

    if (error) {
      console.error('❌ Erro ao adicionar enum:', error)
      return NextResponse.json({
        success: false,
        error: error.message,
        details: error
      }, { status: 500 })
    }

    // Verificar novamente
    const { data: updatedValues } = await supabase.rpc('get_enum_values', {
      enum_name: 'candidato_status'
    })

    return NextResponse.json({
      success: true,
      message: 'Enum value added successfully',
      currentValues,
      updatedValues,
      data
    })

  } catch (error: any) {
    console.error('❌ Erro geral:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
