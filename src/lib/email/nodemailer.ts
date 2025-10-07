import nodemailer from 'nodemailer'

// Create transporter with Gmail SMTP
// You can also use other providers like Outlook, Yahoo, etc.
const transporter = nodemailer.createTransport({
  service: 'gmail', // or 'hotmail', 'yahoo', etc.
  auth: {
    user: process.env.EMAIL_USER, // Your email address
    pass: process.env.EMAIL_PASSWORD, // Your app password (NOT regular password)
  },
})

interface EmailOptions {
  to: string
  subject: string
  html: string
  from?: string
  bcc?: string
}

export async function sendEmailWithNodemailer({ to, subject, html, from, bcc }: EmailOptions) {
  try {
    const fromAddress = from || process.env.EMAIL_FROM || `AutoU <${process.env.EMAIL_USER}>`
    const bccAddress = bcc || 'admin@autou.io'

    console.log(`📤 Tentando enviar email para: ${to}`)
    console.log(`📤 From: ${fromAddress}`)
    console.log(`📤 BCC: ${bccAddress}`)
    console.log(`📤 Subject: ${subject}`)

    const info = await transporter.sendMail({
      from: fromAddress,
      to,
      bcc: bccAddress,
      subject,
      html,
    })

    console.log('✅ Email enviado com sucesso! Message ID:', info.messageId)
    return { success: true, data: info }
  } catch (error: any) {
    console.error('❌ ERRO ao enviar email:', error)
    console.error('❌ Error details:', JSON.stringify(error, null, 2))
    return { success: false, error }
  }
}
