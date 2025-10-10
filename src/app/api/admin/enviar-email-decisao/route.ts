import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendEmailWithNodemailer } from '@/lib/email/nodemailer'
import { emailTemplates } from '@/lib/email/templates'

export async function POST(request: NextRequest) {
  try {
    const { candidato_id, decisao } = await request.json()

    if (!candidato_id || !decisao) {
      return NextResponse.json(
        { error: 'candidato_id e decisao são obrigatórios' },
        { status: 400 }
      )
    }

    if (!['aprovado', 'reprovado'].includes(decisao)) {
      return NextResponse.json(
        { error: 'decisao deve ser "aprovado" ou "reprovado"' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Buscar dados do candidato
    const { data: candidato, error: candidatoError } = await supabase
      .from('aura_jobs_candidatos')
      .select('*')
      .eq('id', candidato_id)
      .single()

    if (candidatoError || !candidato) {
      return NextResponse.json(
        { error: 'Candidato não encontrado' },
        { status: 404 }
      )
    }

    // Buscar dados da vaga
    let vaga = null
    if (candidato.vaga_id) {
      const { data: vagaData } = await supabase
        .from('aura_jobs_vagas')
        .select('titulo, vaga_key, prazo_case_dias')
        .eq('id', candidato.vaga_id)
        .single()

      if (vagaData) vaga = vagaData
    }

    const emailDestino = candidato.email

    if (decisao === 'aprovado') {
      // Calcular prazo do case (próximo domingo às 23:59)
      const prazo = new Date()
      const currentDay = prazo.getDay() // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
      const daysUntilSunday = currentDay === 0 ? 7 : 7 - currentDay // If today is Sunday, go to next Sunday
      prazo.setDate(prazo.getDate() + daysUntilSunday)
      prazo.setHours(23, 59, 59, 999) // Set to 23:59:59
      const prazoFormatado = prazo.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })

      // Determinar link do case baseado no título da vaga
      const getCaseLink = (vagaTitulo: string): string => {
        const titulo = vagaTitulo.toLowerCase()

        if (titulo.includes('product designer') || titulo.includes('designer') || titulo.includes('po') || titulo.includes('product owner')) {
          return 'https://www.notion.so/autou-digital/Case-Pr-tico-AutoU-Product-Designer-PO-20d36ce78e5580a5a8f7ce7693d4bfce'
        }

        if (titulo.includes('desenvolvedor') || titulo.includes('developer') || titulo.includes('frontend') || titulo.includes('backend') || titulo.includes('full stack')) {
          return 'https://www.notion.so/autou-digital/Case-Pr-tico-AutoU-Desenvolvimento-18836ce78e5580d0b59bcf9610b27769'
        }

        if (titulo.includes('consultor') || titulo.includes('negócio') || titulo.includes('negocio') || titulo.includes('business')) {
          return 'https://www.notion.so/autou-digital/Case-Pr-tico-AutoU-Consultoria-1ff36ce78e5580f5a410c5393d227bfe'
        }

        // Default: link de desenvolvimento
        return 'https://www.notion.so/autou-digital/Case-Pr-tico-AutoU-Desenvolvimento-18836ce78e5580d0b59bcf9610b27769'
      }

      const linkCase = getCaseLink(vaga?.titulo || '')

      // Montar link do formulário de entrega usando vaga_key
      const linkFormulario = vaga?.vaga_key
        ? `${process.env.NEXT_PUBLIC_APP_URL}/case/entregar/${vaga.vaga_key}`
        : `${process.env.NEXT_PUBLIC_APP_URL}/case/entregar`

      // USAR O NOVO TEMPLATE caseEnviado com DOIS BOTÕES
      const emailData = emailTemplates.caseEnviado({
        nome: candidato.nome_completo,
        vagaTitulo: vaga?.titulo || 'Vaga',
        prazoEntrega: prazo.toISOString(),
        linkCase: linkCase,
        linkFormulario: linkFormulario
      })

      await sendEmailWithNodemailer({
        to: emailDestino,
        subject: emailData.subject,
        html: emailData.html
      })

      // Atualizar prazo do case no banco
      await supabase
        .from('aura_jobs_candidatos')
        .update({ prazo_case: prazo.toISOString() })
        .eq('id', candidato_id)

      console.log(`✅ Email de aprovação manual enviado para ${emailDestino}`)
    } else {
      // REPROVADO
      const feedbackText = 'Após análise detalhada, identificamos que seu perfil não atende completamente aos requisitos específicos desta vaga no momento.'

      const emailData = emailTemplates.reprovacaoIA({
        nome: candidato.nome_completo,
        vagaTitulo: vaga?.titulo || 'Vaga',
        score: candidato.score_ia || 5, // Default 5 para reprovação manual
        feedback: feedbackText
      })

      await sendEmailWithNodemailer({
        to: emailDestino,
        subject: emailData.subject,
        html: emailData.html
      })

      console.log(`📧 Email de reprovação manual enviado para ${emailDestino}`)
    }

    return NextResponse.json({
      success: true,
      message: `Email de ${decisao === 'aprovado' ? 'aprovação' : 'reprovação'} enviado com sucesso`
    })
  } catch (error) {
    console.error('Erro ao enviar email:', error)
    return NextResponse.json(
      { error: 'Erro ao enviar email', details: error instanceof Error ? error.message : 'Erro desconhecido' },
      { status: 500 }
    )
  }
}
