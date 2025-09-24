import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/email/resend'
import { emailTemplates } from '@/lib/email/templates'

export async function POST(request: NextRequest) {
  try {
    const { candidaturaId, tipo, dados } = await request.json()

    if (!candidaturaId || !tipo) {
      return NextResponse.json(
        { error: 'candidaturaId e tipo são obrigatórios' },
        { status: 400 }
      )
    }

    const supabase = createClient()

    // Buscar dados da candidatura
    const { data: candidatura, error } = await supabase
      .from('aura_jobs_candidatos')
      .select(`
        *,
        aura_jobs_vagas!inner(titulo)
      `)
      .eq('id', candidaturaId)
      .single()

    if (error || !candidatura) {
      return NextResponse.json(
        { error: 'Candidatura não encontrada' },
        { status: 404 }
      )
    }

    const vagaTitulo = (candidatura.aura_jobs_vagas as any).titulo
    let emailData

    // Preparar dados do email baseado no tipo
    switch (tipo) {
      case 'confirmacao':
        emailData = emailTemplates.candidaturaConfirmacao({
          nome: candidatura.nome_completo,
          vagaTitulo,
          consultaToken: candidatura.consulta_token,
          dataInscricao: new Date(candidatura.data_inscricao).toLocaleDateString('pt-BR')
        })
        break

      case 'status_atualizado':
        emailData = emailTemplates.statusAtualizado({
          nome: candidatura.nome_completo,
          vagaTitulo,
          novoStatus: dados.novoStatus,
          mensagemStatus: dados.mensagemStatus
        })
        break

      case 'case_enviado':
        emailData = emailTemplates.caseEnviado({
          nome: candidatura.nome_completo,
          vagaTitulo,
          prazoEntrega: dados.prazoEntrega,
          linkCase: dados.linkCase
        })
        break

      case 'entrevista_agendada':
        emailData = emailTemplates.entrevistaAgendada({
          nome: candidatura.nome_completo,
          vagaTitulo,
          tipoEntrevista: dados.tipoEntrevista,
          dataHora: dados.dataHora,
          local: dados.local,
          entrevistador: dados.entrevistador
        })
        break

      case 'aprovacao_final':
        emailData = emailTemplates.aprovacaoFinal({
          nome: candidatura.nome_completo,
          vagaTitulo,
          proximosPassos: dados.proximosPassos || 'Em breve entraremos em contato com mais detalhes.'
        })
        break

      default:
        return NextResponse.json(
          { error: 'Tipo de notificação inválido' },
          { status: 400 }
        )
    }

    // Enviar email
    const result = await sendEmail({
      to: candidatura.email,
      subject: emailData.subject,
      html: emailData.html
    })

    if (!result.success) {
      console.error('Erro ao enviar email:', result.error)
      return NextResponse.json(
        { error: 'Erro ao enviar email' },
        { status: 500 }
      )
    }

    // Registrar envio no banco (opcional - criar tabela de logs)
    await supabase
      .from('email_logs')
      .insert({
        candidatura_id: candidaturaId,
        tipo,
        destinatario: candidatura.email,
        assunto: emailData.subject,
        enviado_em: new Date().toISOString()
      })
      .select()

    return NextResponse.json({
      success: true,
      message: 'Email enviado com sucesso'
    })

  } catch (error) {
    console.error('Erro na API de notificação:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}