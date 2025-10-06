import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/email/resend'
import { sendEmailWithNodemailer } from '@/lib/email/nodemailer'
import { emailTemplates } from '@/lib/email/templates'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { candidaturaId, tipo, dados, to, type, data } = body

    // Suportar dois formatos: antigo (candidaturaId, tipo, dados) e novo (to, type, data)
    const emailType = type || tipo
    const emailData = data || dados
    let emailRecipient = to

    if (!emailType) {
      return NextResponse.json(
        { error: 'tipo/type é obrigatório' },
        { status: 400 }
      )
    }

    let emailTemplate

    // Se tiver candidaturaId, buscar dados do banco
    if (candidaturaId) {
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

      emailRecipient = candidatura.email
      const vagaTitulo = (candidatura.aura_jobs_vagas as any).titulo

      // Preparar dados do email baseado no tipo
      switch (emailType) {
        case 'confirmacao':
          emailTemplate = emailTemplates.candidaturaConfirmacao({
            nome: candidatura.nome_completo,
            vagaTitulo,
            consultaToken: candidatura.consulta_token,
            dataInscricao: new Date(candidatura.data_inscricao).toLocaleDateString('pt-BR')
          })
          break

        case 'status_atualizado':
          emailTemplate = emailTemplates.statusAtualizado({
            nome: candidatura.nome_completo,
            vagaTitulo,
            novoStatus: emailData.novoStatus,
            mensagemStatus: emailData.mensagemStatus
          })
          break

        case 'case_enviado':
          emailTemplate = emailTemplates.caseEnviado({
            nome: candidatura.nome_completo,
            vagaTitulo,
            prazoEntrega: emailData.prazoEntrega,
            linkCase: emailData.linkCase
          })
          break

        case 'entrevista_agendada':
          emailTemplate = emailTemplates.entrevistaAgendada({
            nome: candidatura.nome_completo,
            vagaTitulo,
            tipoEntrevista: emailData.tipoEntrevista,
            dataHora: emailData.dataHora,
            local: emailData.local,
            entrevistador: emailData.entrevistador
          })
          break

        case 'aprovacao_final':
          emailTemplate = emailTemplates.aprovacaoFinal({
            nome: candidatura.nome_completo,
            vagaTitulo,
            proximosPassos: emailData.proximosPassos || 'Em breve entraremos em contato com mais detalhes.'
          })
          break

        default:
          return NextResponse.json(
            { error: 'Tipo de notificação inválido' },
            { status: 400 }
          )
      }
    } else {
      // Modo direto: usar dados fornecidos diretamente
      if (!emailRecipient || !emailData) {
        return NextResponse.json(
          { error: 'to e data são obrigatórios quando não há candidaturaId' },
          { status: 400 }
        )
      }

      switch (emailType) {
        case 'aprovacaoCase':
          emailTemplate = emailTemplates.aprovacaoCase(emailData)
          break

        case 'reprovacaoCase':
          emailTemplate = emailTemplates.reprovacaoCase(emailData)
          break

        case 'aprovacaoIA':
          emailTemplate = emailTemplates.aprovacaoIA(emailData)
          break

        case 'reprovacaoIA':
          emailTemplate = emailTemplates.reprovacaoIA(emailData)
          break

        case 'aprovacaoEntrevistaTecnica':
          emailTemplate = emailTemplates.aprovacaoEntrevistaTecnica(emailData)
          break

        case 'reprovacaoEntrevistaTecnica':
          emailTemplate = emailTemplates.reprovacaoEntrevistaTecnica(emailData)
          break

        case 'aprovacaoContratacao':
          emailTemplate = emailTemplates.aprovacaoContratacao(emailData)
          break

        case 'reprovacaoSocios':
          emailTemplate = emailTemplates.reprovacaoSocios(emailData)
          break

        default:
          return NextResponse.json(
            { error: 'Tipo de notificação inválido' },
            { status: 400 }
          )
      }
    }

    // Enviar email - usar Gmail (Nodemailer) se for modo direto, senão Resend
    let result
    if (candidaturaId) {
      // Modo antigo: usa Resend
      result = await sendEmail({
        to: emailRecipient,
        subject: emailTemplate.subject,
        html: emailTemplate.html
      })
    } else {
      // Modo novo (aprovação/reprovação case): usa Gmail
      result = await sendEmailWithNodemailer({
        to: emailRecipient,
        subject: emailTemplate.subject,
        html: emailTemplate.html
      })
    }

    if (!result.success) {
      console.error('Erro ao enviar email:', result.error)
      return NextResponse.json(
        { error: 'Erro ao enviar email' },
        { status: 500 }
      )
    }

    // Registrar envio no banco (opcional - criar tabela de logs)
    if (candidaturaId) {
      const supabase = createClient()
      await supabase
        .from('email_logs')
        .insert({
          candidatura_id: candidaturaId,
          tipo: emailType,
          destinatario: emailRecipient,
          assunto: emailTemplate.subject,
          enviado_em: new Date().toISOString()
        })
        .select()
    }

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