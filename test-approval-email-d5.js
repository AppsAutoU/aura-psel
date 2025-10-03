const nodemailer = require('nodemailer')
require('dotenv').config()

// Create transporter
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
})

// Calculate D+5 deadline
const calculateDeadline = () => {
  const prazo = new Date()
  prazo.setDate(prazo.getDate() + 5) // 5 days from today
  prazo.setHours(23, 59, 59, 999)

  return prazo.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Email template for approval
const createApprovalEmail = (nome, vagaTitulo, prazoCase, linkCase) => ({
  subject: `🎉 Parabéns! Você foi aprovado - ${vagaTitulo}`,
  html: `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 10px 10px 0 0;
            text-align: center;
          }
          .content {
            background: white;
            padding: 30px;
            border: 1px solid #e2e8f0;
            border-radius: 0 0 10px 10px;
          }
          .alert-box {
            background: #fffaf0;
            border: 2px solid #f6ad55;
            padding: 15px;
            margin: 20px 0;
            border-radius: 8px;
            text-align: center;
          }
          .button {
            display: inline-block;
            background: #667eea;
            color: white;
            padding: 12px 30px;
            border-radius: 6px;
            text-decoration: none;
            font-weight: 600;
          }
          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
            text-align: center;
            color: #718096;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 style="margin: 0;">🎉 Você foi Aprovado!</h1>
        </div>
        <div class="content">
          <p>Olá <strong>${nome}</strong>,</p>

          <p>Temos ótimas notícias! Nossa análise avaliou seu perfil e <strong>você foi aprovado</strong> para prosseguir no processo seletivo da vaga <strong>${vagaTitulo}</strong>!</p>

          <p>Seu perfil demonstrou excelente alinhamento com os requisitos da vaga. Parabéns! 👏</p>

          <h3>📋 Próxima Etapa: Case Prático</h3>

          <p>Você avançou para a fase do <strong>Case Prático</strong>, onde poderá demonstrar suas habilidades técnicas na prática.</p>

          <div class="alert-box">
            <h3 style="margin: 0 0 10px 0; color: #c05621;">⏰ Prazo de Entrega</h3>
            <p style="margin: 0; font-size: 18px; font-weight: bold;">${prazoCase}</p>
          </div>

          <h3>📝 Instruções:</h3>
          <ol>
            <li>Clique no botão abaixo para acessar o case prático</li>
            <li>Leia atentamente todas as instruções</li>
            <li>Desenvolva sua solução com atenção aos detalhes</li>
            <li>Envie sua resposta dentro do prazo estabelecido</li>
          </ol>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${linkCase}" class="button" style="font-size: 16px; padding: 15px 40px;">
              Acessar Case Prático
            </a>
          </div>

          <p style="text-align: center; font-size: 14px; color: #718096;">
            Link do case: <a href="${linkCase}" style="color: #667eea;">${linkCase}</a>
          </p>

          <p><strong>💡 Dicas importantes:</strong></p>
          <ul>
            <li>Leia todas as instruções cuidadosamente</li>
            <li>Foque na qualidade da solução</li>
            <li>Documente seu raciocínio</li>
            <li>Teste antes de enviar</li>
          </ul>

          <p>Estamos ansiosos para ver sua solução! Boa sorte! 🚀</p>
        </div>
        <div class="footer">
          <p>
            Em caso de dúvidas, entre em contato: <a href="mailto:rh@aura.com.br">rh@aura.com.br</a>
          </p>
          <p style="margin-top: 20px; font-size: 12px;">
            © ${new Date().getFullYear()} Aura. Todos os direitos reservados.
          </p>
        </div>
      </body>
    </html>
  `
})

async function sendTestEmail() {
  const toEmail = 'paulabasilonemannarino@gmail.com'
  const nome = 'Paula'
  const vagaTitulo = 'Desenvolvedor Full Stack Pleno'
  const prazoCase = calculateDeadline() // D+5
  const linkCase = 'https://www.notion.so/autou-digital/Case-Pr-tico-AutoU-Desenvolvimento-18836ce78e5580d0b59bcf9610b27769'

  console.log('📤 Enviando email de aprovação (D+5) para:', toEmail)
  console.log('📤 From:', process.env.EMAIL_FROM)
  console.log('📅 Prazo calculado (D+5):', prazoCase)

  const emailData = createApprovalEmail(nome, vagaTitulo, prazoCase, linkCase)

  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: toEmail,
      subject: emailData.subject,
      html: emailData.html
    })

    console.log('✅ Email enviado com sucesso!')
    console.log('📧 Message ID:', info.messageId)
    console.log('')
    console.log('Detalhes do email:')
    console.log('  - Subject:', emailData.subject)
    console.log('  - To:', toEmail)
    console.log('  - From:', process.env.EMAIL_FROM)
    console.log('  - Prazo:', prazoCase)
  } catch (error) {
    console.error('❌ Erro ao enviar email:', error.message)
    console.error('Detalhes:', error)
  }
}

sendTestEmail()
