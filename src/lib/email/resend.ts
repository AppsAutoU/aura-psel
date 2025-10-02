import { Resend } from 'resend'

// Inicializar Resend com a API key
const resend = new Resend(process.env.RESEND_API_KEY)

export interface EmailTemplate {
  to: string
  subject: string
  html: string
  from?: string
}

export async function sendEmail({ to, subject, html, from = 'Aura RH <onboarding@resend.dev>' }: EmailTemplate) {
  try {
    console.log(`📤 Tentando enviar email para: ${to}`)
    console.log(`📤 From: ${from}`)
    console.log(`📤 Subject: ${subject}`)

    const data = await resend.emails.send({
      from,
      to,
      subject,
      html,
    })

    console.log('✅ Email enviado com sucesso! Response:', JSON.stringify(data))
    return { success: true, data }
  } catch (error: any) {
    console.error('❌ ERRO ao enviar email:', error)
    console.error('❌ Error details:', JSON.stringify(error, null, 2))
    return { success: false, error }
  }
}

export default resend