import { Resend } from 'resend'

// Inicializar Resend com a API key
const resend = new Resend(process.env.RESEND_API_KEY)

export interface EmailTemplate {
  to: string
  subject: string
  html: string
  from?: string
}

export async function sendEmail({ to, subject, html, from = 'AutoU <noreply@autou.com.br>' }: EmailTemplate) {
  try {
    const data = await resend.emails.send({
      from,
      to,
      subject,
      html,
    })

    return { success: true, data }
  } catch (error) {
    console.error('Erro ao enviar email:', error)
    return { success: false, error }
  }
}

export default resend