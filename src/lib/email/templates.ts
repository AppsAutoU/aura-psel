interface CandidaturaConfirmacaoData {
  nome: string
  vagaTitulo: string
  consultaToken: string
  dataInscricao: string
}

interface StatusAtualizadoData {
  nome: string
  vagaTitulo: string
  novoStatus: string
  mensagemStatus: string
}

interface CaseEnviadoData {
  nome: string
  vagaTitulo: string
  prazoEntrega: string
  linkCase: string
}

interface EntrevistaAgendadaData {
  nome: string
  vagaTitulo: string
  tipoEntrevista: string
  dataHora: string
  local: string
  entrevistador?: string
}

interface AprovacaoFinalData {
  nome: string
  vagaTitulo: string
  proximosPassos: string
}

interface AprovacaoIAData {
  nome: string
  vagaTitulo: string
  score: number
  prazoCase: string
  linkCase: string
}

interface ReprovacaoIAData {
  nome: string
  vagaTitulo: string
  score: number
  feedback: string
}

interface AprovacaoCaseData {
  nome: string
  vagaTitulo: string
  feedback?: string
}

interface ReprovacaoCaseData {
  nome: string
  vagaTitulo: string
  feedback?: string
}

interface AprovacaoEntrevistaTecnicaData {
  nome: string
  vagaTitulo: string
}

interface ReprovacaoEntrevistaTecnicaData {
  nome: string
  vagaTitulo: string
}

interface AprovacaoContratacaoData {
  nome: string
  vagaTitulo: string
  proximosPassos?: string
}

interface ReprovacaoSociosData {
  nome: string
  vagaTitulo: string
}

export const emailTemplates = {
  candidaturaConfirmacao: (data: CandidaturaConfirmacaoData) => ({
    subject: `Confirmação de Candidatura - ${data.vagaTitulo}`,
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
            .token-box {
              background: #f7fafc;
              border: 2px dashed #667eea;
              border-radius: 8px;
              padding: 20px;
              margin: 20px 0;
              text-align: center;
            }
            .token {
              font-family: 'Courier New', monospace;
              font-size: 24px;
              font-weight: bold;
              color: #667eea;
              letter-spacing: 2px;
            }
            .button {
              display: inline-block;
              background: #667eea;
              color: white;
              padding: 12px 30px;
              border-radius: 6px;
              text-decoration: none;
              font-weight: 600;
              margin: 10px 5px;
            }
            .footer {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #e2e8f0;
              text-align: center;
              color: #718096;
              font-size: 14px;
            }
            .steps {
              background: #f7fafc;
              border-radius: 8px;
              padding: 20px;
              margin: 20px 0;
            }
            .step {
              display: flex;
              align-items: center;
              margin: 10px 0;
            }
            .step-number {
              background: #667eea;
              color: white;
              width: 30px;
              height: 30px;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              margin-right: 15px;
              font-weight: bold;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 style="margin: 0;">✨ Candidatura Recebida!</h1>
          </div>
          <div class="content">
            <p>Olá <strong>${data.nome}</strong>,</p>
            
            <p>Recebemos sua candidatura para a vaga de <strong>${data.vagaTitulo}</strong> e ficamos muito felizes com seu interesse em fazer parte do nosso time!</p>
            
            <div class="token-box">
              <p style="margin: 0 0 10px 0; color: #718096;">Seu código de acompanhamento:</p>
              <div class="token">${data.consultaToken}</div>
              <p style="margin: 10px 0 0 0; color: #718096; font-size: 12px;">
                Guarde este código para consultar o status da sua candidatura
              </p>
            </div>
            
            <h3>🚀 Próximas Etapas do Processo:</h3>
            <div class="steps">
              <div class="step">
                <div class="step-number">1</div>
                <div>
                  <strong>Análise de Perfil</strong><br>
                  <small>Nossa IA avaliará seu perfil em até 48 horas</small>
                </div>
              </div>
              <div class="step">
                <div class="step-number">2</div>
                <div>
                  <strong>Case Prático</strong><br>
                  <small>Se aprovado, você receberá um desafio técnico</small>
                </div>
              </div>
              <div class="step">
                <div class="step-number">3</div>
                <div>
                  <strong>Entrevistas</strong><br>
                  <small>Conversas com o time técnico e gestores</small>
                </div>
              </div>
              <div class="step">
                <div class="step-number">4</div>
                <div>
                  <strong>Decisão Final</strong><br>
                  <small>Feedback sobre o resultado do processo</small>
                </div>
              </div>
            </div>
            
            <p><strong>📊 Acompanhe sua candidatura:</strong></p>
            <div style="text-align: center; margin: 20px 0;">
              <a href="https://autou.com.br/candidato/consulta" class="button">
                Consultar Status
              </a>
              <a href="https://autou.com.br/candidato/auth/signup" class="button" style="background: #48bb78;">
                Criar Conta
              </a>
            </div>
            
            <p style="margin-top: 30px;">
              <strong>💡 Dica:</strong> Crie uma conta para acompanhar todas suas candidaturas em um só lugar e receber notificações em tempo real sobre atualizações.
            </p>
          </div>
          <div class="footer">
            <p>
              Este é um email automático. Por favor, não responda.<br>
              Em caso de dúvidas, entre em contato: <a href="mailto:rh@autou.com.br">rh@autou.com.br</a>
            </p>
            <p style="margin-top: 20px; font-size: 12px;">
              © ${new Date().getFullYear()} AutoU. Todos os direitos reservados.
            </p>
          </div>
        </body>
      </html>
    `
  }),

  statusAtualizado: (data: StatusAtualizadoData) => ({
    subject: `Atualização na sua candidatura - ${data.vagaTitulo}`,
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
            .status-box {
              background: #f0fff4;
              border-left: 4px solid #48bb78;
              padding: 15px;
              margin: 20px 0;
              border-radius: 4px;
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
            <h1 style="margin: 0;">📢 Atualização do Processo Seletivo</h1>
          </div>
          <div class="content">
            <p>Olá <strong>${data.nome}</strong>,</p>
            
            <p>Temos uma atualização sobre sua candidatura para a vaga de <strong>${data.vagaTitulo}</strong>.</p>
            
            <div class="status-box">
              <h3 style="margin: 0 0 10px 0; color: #22543d;">Novo Status: ${data.novoStatus}</h3>
              <p style="margin: 0;">${data.mensagemStatus}</p>
            </div>
            
            <p>Continue acompanhando o status completo da sua candidatura:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://autou.com.br/candidato/consulta" class="button">
                Ver Status Completo
              </a>
            </div>
            
            <p>Qualquer dúvida, estamos à disposição!</p>
          </div>
          <div class="footer">
            <p>
              Este é um email automático. Por favor, não responda.<br>
              Em caso de dúvidas, entre em contato: <a href="mailto:rh@autou.com.br">rh@autou.com.br</a>
            </p>
            <p style="margin-top: 20px; font-size: 12px;">
              © ${new Date().getFullYear()} AutoU. Todos os direitos reservados.
            </p>
          </div>
        </body>
      </html>
    `
  }),

  caseEnviado: (data: CaseEnviadoData) => ({
    subject: `Case Prático - ${data.vagaTitulo}`,
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
              background: linear-gradient(135deg, #f6d365 0%, #fda085 100%);
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
              background: #f6ad55;
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
            <h1 style="margin: 0;">🎯 Case Prático Disponível!</h1>
          </div>
          <div class="content">
            <p>Olá <strong>${data.nome}</strong>,</p>
            
            <p>Parabéns! Você avançou para a próxima etapa do processo seletivo para <strong>${data.vagaTitulo}</strong>!</p>
            
            <div class="alert-box">
              <h3 style="margin: 0 0 10px 0; color: #c05621;">⏰ Prazo de Entrega</h3>
              <p style="margin: 0; font-size: 18px; font-weight: bold;">${data.prazoEntrega}</p>
            </div>
            
            <h3>📝 Instruções:</h3>
            <ol>
              <li>Acesse o link abaixo para ver os detalhes do case</li>
              <li>Leia atentamente todas as instruções</li>
              <li>Desenvolva sua solução com calma e atenção</li>
              <li>Envie dentro do prazo estipulado</li>
            </ol>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.linkCase}" class="button">
                Acessar Case Prático
              </a>
            </div>
            
            <p><strong>💡 Dicas importantes:</strong></p>
            <ul>
              <li>Foque na qualidade, não apenas na velocidade</li>
              <li>Documente seu processo de pensamento</li>
              <li>Teste sua solução antes de enviar</li>
              <li>Em caso de dúvidas, entre em contato conosco</li>
            </ul>
            
            <p>Boa sorte! Estamos ansiosos para ver sua solução.</p>
          </div>
          <div class="footer">
            <p>
              Em caso de dúvidas sobre o case, responda este email.<br>
              Contato: <a href="mailto:rh@autou.com.br">rh@autou.com.br</a>
            </p>
            <p style="margin-top: 20px; font-size: 12px;">
              © ${new Date().getFullYear()} AutoU. Todos os direitos reservados.
            </p>
          </div>
        </body>
      </html>
    `
  }),

  entrevistaAgendada: (data: EntrevistaAgendadaData) => ({
    subject: `Entrevista Agendada - ${data.vagaTitulo}`,
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
            .meeting-box {
              background: #edf2f7;
              border-radius: 8px;
              padding: 20px;
              margin: 20px 0;
            }
            .meeting-detail {
              display: flex;
              align-items: center;
              margin: 10px 0;
            }
            .icon {
              width: 24px;
              margin-right: 10px;
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
            <h1 style="margin: 0;">🎉 Entrevista Agendada!</h1>
          </div>
          <div class="content">
            <p>Olá <strong>${data.nome}</strong>,</p>
            
            <p>Temos o prazer de informar que sua <strong>${data.tipoEntrevista}</strong> para a vaga de <strong>${data.vagaTitulo}</strong> está confirmada!</p>
            
            <div class="meeting-box">
              <h3 style="margin: 0 0 15px 0;">📅 Detalhes da Entrevista</h3>
              
              <div class="meeting-detail">
                <span class="icon">📆</span>
                <div>
                  <strong>Data e Hora:</strong><br>
                  ${data.dataHora}
                </div>
              </div>
              
              <div class="meeting-detail">
                <span class="icon">📍</span>
                <div>
                  <strong>Local/Link:</strong><br>
                  ${data.local}
                </div>
              </div>
              
              ${data.entrevistador ? `
              <div class="meeting-detail">
                <span class="icon">👤</span>
                <div>
                  <strong>Entrevistador(a):</strong><br>
                  ${data.entrevistador}
                </div>
              </div>
              ` : ''}
            </div>
            
            <h3>📝 Como se preparar:</h3>
            <ul>
              <li>Revise seu currículo e experiências relevantes</li>
              <li>Pesquise sobre a AutoU e nossos valores</li>
              <li>Prepare perguntas sobre a vaga e a empresa</li>
              <li>Teste sua conexão e equipamentos (se for online)</li>
              <li>Vista-se adequadamente, mesmo em entrevistas virtuais</li>
            </ul>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://autou.com.br/candidato/consulta" class="button">
                Ver Detalhes Completos
              </a>
            </div>
            
            <p>
              <strong>⚠️ Importante:</strong> Em caso de imprevisto, avise-nos com pelo menos 24h de antecedência para reagendarmos.
            </p>
            
            <p>Boa sorte! Estamos ansiosos para conhecê-lo melhor.</p>
          </div>
          <div class="footer">
            <p>
              Confirme sua presença respondendo este email.<br>
              Contato: <a href="mailto:rh@autou.com.br">rh@autou.com.br</a>
            </p>
            <p style="margin-top: 20px; font-size: 12px;">
              © ${new Date().getFullYear()} AutoU. Todos os direitos reservados.
            </p>
          </div>
        </body>
      </html>
    `
  }),

  aprovacaoFinal: (data: AprovacaoFinalData) => ({
    subject: `🎊 Parabéns! Você foi aprovado(a) - ${data.vagaTitulo}`,
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
              padding: 40px;
              border-radius: 10px 10px 0 0;
              text-align: center;
            }
            .celebration {
              font-size: 48px;
              margin: 20px 0;
            }
            .content {
              background: white;
              padding: 30px;
              border: 1px solid #e2e8f0;
              border-radius: 0 0 10px 10px;
            }
            .success-box {
              background: #f0fff4;
              border: 2px solid #48bb78;
              padding: 20px;
              margin: 20px 0;
              border-radius: 8px;
              text-align: center;
            }
            .button {
              display: inline-block;
              background: #48bb78;
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
            <div class="celebration">🎉🎊🥳</div>
            <h1 style="margin: 0; font-size: 32px;">Parabéns, ${data.nome}!</h1>
            <p style="margin: 10px 0 0 0; font-size: 18px;">Você foi aprovado(a)!</p>
          </div>
          <div class="content">
            <p>Olá <strong>${data.nome}</strong>,</p>
            
            <p>É com grande alegria que informamos sua <strong>aprovação</strong> no processo seletivo para a vaga de <strong>${data.vagaTitulo}</strong>!</p>
            
            <div class="success-box">
              <h2 style="margin: 0 0 10px 0; color: #22543d;">🌟 Bem-vindo(a) ao time AutoU!</h2>
              <p style="margin: 0;">Você foi selecionado(a) entre muitos candidatos talentosos.</p>
            </div>
            
            <h3>🚀 Próximos Passos:</h3>
            <p>${data.proximosPassos}</p>
            
            <p>Em breve, nossa equipe de RH entrará em contato para:</p>
            <ul>
              <li>Discutir a proposta de trabalho</li>
              <li>Esclarecer dúvidas sobre benefícios</li>
              <li>Definir a data de início</li>
              <li>Orientar sobre a documentação necessária</li>
            </ul>
            
            <p>
              <strong>Estamos muito animados</strong> para tê-lo(a) em nosso time e mal podemos esperar para ver todas as contribuições incríveis que você trará para a AutoU!
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <p style="font-size: 24px; margin: 20px 0;">🎯 🚗 💜</p>
              <p style="color: #667eea; font-weight: bold;">Juntos, vamos revolucionar o setor automotivo!</p>
            </div>
            
            <p>Qualquer dúvida, não hesite em nos contatar. Estamos aqui para tornar sua jornada conosco incrível desde o primeiro dia!</p>
            
            <p>
              Atenciosamente,<br>
              <strong>Equipe AutoU</strong>
            </p>
          </div>
          <div class="footer">
            <p>
              Este email requer confirmação. Por favor, responda confirmando o recebimento.<br>
              Contato: <a href="mailto:rh@autou.com.br">rh@autou.com.br</a>
            </p>
            <p style="margin-top: 20px; font-size: 12px;">
              © ${new Date().getFullYear()} AutoU. Todos os direitos reservados.
            </p>
          </div>
        </body>
      </html>
    `
  }),

  aprovacaoIA: (data: AprovacaoIAData) => ({
    subject: `🎉 Parabéns! Você foi aprovado - ${data.vagaTitulo}`,
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
            <p>Olá <strong>${data.nome}</strong>,</p>

            <p>Temos ótimas notícias! Nossa análise avaliou seu perfil e <strong>você foi aprovado</strong> para prosseguir no processo seletivo da vaga <strong>${data.vagaTitulo}</strong>!</p>

            <p>Seu perfil demonstrou excelente alinhamento com os requisitos da vaga. Parabéns! 👏</p>

            <h3>📋 Próxima Etapa: Case Prático</h3>

            <p>Você avançou para a fase do <strong>Case Prático</strong>, onde poderá demonstrar suas habilidades técnicas na prática.</p>

            <div class="alert-box">
              <h3 style="margin: 0 0 10px 0; color: #c05621;">⏰ Prazo de Entrega</h3>
              <p style="margin: 0; font-size: 18px; font-weight: bold;">${data.prazoCase}</p>
            </div>

            <h3>📝 Instruções:</h3>
            <ol>
              <li>Clique no botão abaixo para acessar o case prático</li>
              <li>Leia atentamente todas as instruções</li>
              <li>Desenvolva sua solução com atenção aos detalhes</li>
              <li>Envie sua resposta dentro do prazo estabelecido</li>
            </ol>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.linkCase}" class="button" style="font-size: 16px; padding: 15px 40px;">
                Acessar Case Prático
              </a>
            </div>

            <p style="text-align: center; font-size: 14px; color: #718096;">
              Link do case: <a href="${data.linkCase}" style="color: #667eea;">${data.linkCase}</a>
            </p>

            <p><strong>💡 Dicas importantes:</strong></p>
            <ul>
              <li>Leia todas as instruções cuidadosamente</li>
              <li>Foque na qualidade da solução</li>
              <li>Documente seu raciocínio</li>
              <li>Teste antes de enviar</li>
            </ul>

            <p>Estamos ansiosos para ver sua solução! Boa sorte! 🚀</p>

            <p>
              Atenciosamente,<br>
              <strong>Equipe AutoU</strong>
            </p>
          </div>
          <div class="footer">
            <p>
              Em caso de dúvidas, entre em contato: <a href="mailto:rh@autou.com.br">rh@autou.com.br</a>
            </p>
            <p style="margin-top: 20px; font-size: 12px;">
              © ${new Date().getFullYear()} AutoU. Todos os direitos reservados.
            </p>
          </div>
        </body>
      </html>
    `
  }),

  reprovacaoIA: (data: ReprovacaoIAData) => ({
    subject: `Processo Seletivo - ${data.vagaTitulo}`,
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
            .info-box {
              background: #f7fafc;
              border-left: 4px solid #667eea;
              padding: 15px;
              margin: 20px 0;
              border-radius: 4px;
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
            <h1 style="margin: 0;">Processo Seletivo - Atualização</h1>
          </div>
          <div class="content">
            <p>Olá <strong>${data.nome}</strong>,</p>

            <p>Agradecemos imensamente seu interesse em fazer parte do time AutoU e pelo tempo dedicado ao nosso processo seletivo para a vaga de <strong>${data.vagaTitulo}</strong>.</p>

            <p>Após uma análise cuidadosa de seu perfil, infelizmente, <strong>não poderemos prosseguir</strong> com sua candidatura neste momento. Esta decisão foi baseada em uma avaliação criteriosa que considera múltiplos fatores de compatibilidade com a posição.</p>

            <p><strong>Isso não é o fim!</strong> Queremos que você saiba que:</p>
            <ul>
              <li>Esta decisão não reflete sua competência profissional</li>
              <li>Processos seletivos são complexos e envolvem diversos critérios</li>
              <li>Incentivamos você a se candidatar a outras vagas que possam se alinhar melhor ao seu perfil</li>
              <li>Seu currículo permanecerá em nosso banco de talentos para futuras oportunidades</li>
            </ul>

            <h3>🚀 Continue Crescendo:</h3>
            <p>Aproveite este momento como uma oportunidade de crescimento:</p>
            <ul>
              <li>Continue desenvolvendo suas habilidades técnicas</li>
              <li>Busque novos projetos e experiências</li>
              <li>Mantenha-se atualizado com as tendências do mercado</li>
              <li>Não desista de seus objetivos profissionais</li>
            </ul>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/candidato/vagas" class="button">
                Ver Outras Vagas Abertas
              </a>
            </div>

            <p>Desejamos muito sucesso em sua jornada profissional e esperamos que nossos caminhos possam se cruzar novamente no futuro!</p>

            <p>
              Atenciosamente,<br>
              <strong>Equipe AutoU</strong>
            </p>
          </div>
          <div class="footer">
            <p>
              Em caso de dúvidas, entre em contato: <a href="mailto:rh@autou.com.br">rh@autou.com.br</a>
            </p>
            <p style="margin-top: 20px; font-size: 12px;">
              © ${new Date().getFullYear()} AutoU. Todos os direitos reservados.
            </p>
          </div>
        </body>
      </html>
    `
  }),

  aprovacaoCase: (data: AprovacaoCaseData) => ({
    subject: `🎉 Case Aprovado! Próxima Etapa: Entrevista Técnica - ${data.vagaTitulo}`,
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
              background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
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
            .success-box {
              background: #f0fff4;
              border: 2px solid #48bb78;
              padding: 20px;
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
            <h1 style="margin: 0;">🎉 Parabéns!</h1>
            <p style="margin: 10px 0 0 0; font-size: 18px;">Seu case foi aprovado!</p>
          </div>
          <div class="content">
            <p>Olá <strong>${data.nome}</strong>,</p>

            <p>É com grande satisfação que informamos que <strong>seu case prático foi aprovado</strong> para a vaga de <strong>${data.vagaTitulo}</strong>! 🎊</p>

            <div class="success-box">
              <h2 style="margin: 0 0 10px 0; color: #22543d;">✅ Case Aprovado</h2>
              <p style="margin: 0;">Sua solução demonstrou excelente qualidade técnica e atenção aos detalhes!</p>
            </div>

            <h3>🎯 Próxima Etapa: Entrevista Técnica</h3>
            <p>Você avançou para a fase de <strong>Entrevista Técnica</strong>, onde teremos a oportunidade de conhecê-lo melhor e discutir aspectos técnicos mais aprofundados.</p>

            <h3>📅 O que esperar:</h3>
            <ul>
              <li><strong>Formato:</strong> Conversa técnica com nossa equipe</li>
              <li><strong>Duração:</strong> Aproximadamente 60 minutos</li>
              <li><strong>Temas:</strong> Discussão sobre suas experiências, tecnologias e o case desenvolvido</li>
              <li><strong>Agendamento:</strong> Em breve entraremos em contato para agendar um horário</li>
            </ul>

            <h3>💡 Como se preparar:</h3>
            <ul>
              <li>Revise a solução que você desenvolveu no case prático</li>
              <li>Prepare-se para explicar suas decisões técnicas</li>
              <li>Pesquise sobre a AutoU e nossas tecnologias</li>
              <li>Prepare perguntas sobre a vaga e o time</li>
              <li>Teste sua conexão de internet e equipamentos</li>
            </ul>

            <div style="text-align: center; margin: 30px 0;">
              <a href="https://autou.com.br/candidato/consulta" class="button">
                Acompanhar Status
              </a>
            </div>

            <p>Estamos muito animados para conversar com você! Continue assim! 🚀</p>

            <p>
              Atenciosamente,<br>
              <strong>Equipe AutoU</strong>
            </p>
          </div>
          <div class="footer">
            <p>
              Em caso de dúvidas, entre em contato: <a href="mailto:rh@autou.com.br">rh@autou.com.br</a>
            </p>
            <p style="margin-top: 20px; font-size: 12px;">
              © ${new Date().getFullYear()} AutoU. Todos os direitos reservados.
            </p>
          </div>
        </body>
      </html>
    `
  }),

  reprovacaoCase: (data: ReprovacaoCaseData) => ({
    subject: `Processo Seletivo - ${data.vagaTitulo}`,
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
            .info-box {
              background: #f7fafc;
              border-left: 4px solid #667eea;
              padding: 15px;
              margin: 20px 0;
              border-radius: 4px;
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
            <h1 style="margin: 0;">Processo Seletivo - Atualização</h1>
          </div>
          <div class="content">
            <p>Olá <strong>${data.nome}</strong>,</p>

            <p>Agradecemos imensamente pelo tempo e dedicação que você investiu no case prático para a vaga de <strong>${data.vagaTitulo}</strong>.</p>

            <p>Após uma análise cuidadosa de sua solução, infelizmente, <strong>não poderemos prosseguir</strong> com sua candidatura neste momento. Esta decisão foi baseada em critérios técnicos específicos da vaga e nas competências que buscamos para esta posição.</p>

            <div class="info-box">
              <p style="margin: 0;"><strong>💡 Importante:</strong> Reconhecemos o esforço que você dedicou ao case prático. A decisão não invalida suas habilidades profissionais, apenas reflete que buscamos um perfil específico para esta oportunidade em particular.</p>
            </div>

            <h3>🚀 Continue Crescendo:</h3>
            <p>Queremos encorajá-lo a continuar se desenvolvendo:</p>
            <ul>
              <li>Continue praticando e aprimorando suas habilidades técnicas</li>
              <li>Busque feedback em seus projetos e cases</li>
              <li>Participe de comunidades e eventos da área</li>
              <li>Mantenha-se atualizado com as tendências do mercado</li>
              <li>Não desista de seus objetivos profissionais</li>
            </ul>

            <p><strong>Fique de olho!</strong> Novas oportunidades surgem constantemente:</p>
            <ul>
              <li>Seu currículo permanecerá em nosso banco de talentos</li>
              <li>Incentivamos você a se candidatar a outras vagas que possam se alinhar melhor ao seu perfil</li>
              <li>Acompanhe nossas redes sociais para ficar por dentro de novas vagas</li>
            </ul>

            <div style="text-align: center; margin: 30px 0;">
              <a href="https://autou.com.br/candidato/vagas" class="button">
                Ver Outras Vagas Abertas
              </a>
            </div>

            <p>Desejamos muito sucesso em sua jornada profissional e esperamos que nossos caminhos possam se cruzar novamente no futuro!</p>

            <p>
              Atenciosamente,<br>
              <strong>Equipe AutoU</strong>
            </p>
          </div>
          <div class="footer">
            <p>
              Em caso de dúvidas, entre em contato: <a href="mailto:rh@autou.com.br">rh@autou.com.br</a>
            </p>
            <p style="margin-top: 20px; font-size: 12px;">
              © ${new Date().getFullYear()} AutoU. Todos os direitos reservados.
            </p>
          </div>
        </body>
      </html>
    `
  }),

  aprovacaoEntrevistaTecnica: (data: AprovacaoEntrevistaTecnicaData) => ({
    subject: `🎉 Parabéns! Você foi aprovado na Entrevista Técnica - ${data.vagaTitulo}`,
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
              background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
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
            .success-box {
              background: #f0fff4;
              border: 2px solid #48bb78;
              padding: 20px;
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
            <h1 style="margin: 0;">🎉 Parabéns!</h1>
            <p style="margin: 10px 0 0 0; font-size: 18px;">Você foi aprovado na Entrevista Técnica!</p>
          </div>
          <div class="content">
            <p>Olá <strong>${data.nome}</strong>,</p>

            <p>É com grande satisfação que informamos que <strong>você foi aprovado na Entrevista Técnica</strong> para a vaga de <strong>${data.vagaTitulo}</strong>! 🎊</p>

            <div class="success-box">
              <h2 style="margin: 0 0 10px 0; color: #22543d;">✅ Entrevista Técnica Aprovada</h2>
              <p style="margin: 0;">Sua performance foi excelente e demonstrou grande domínio técnico!</p>
            </div>

            <h3>🎯 Próxima Etapa: Entrevista com Sócios</h3>
            <p>Você avançou para a última etapa do nosso processo seletivo: <strong>Entrevista com os Sócios</strong>.</p>

            <h3>📅 O que esperar:</h3>
            <ul>
              <li><strong>Formato:</strong> Conversa com os sócios da empresa</li>
              <li><strong>Duração:</strong> Aproximadamente 45-60 minutos</li>
              <li><strong>Temas:</strong> Visão de carreira, alinhamento cultural, expectativas mútuas</li>
              <li><strong>Agendamento:</strong> Em breve entraremos em contato para agendar</li>
            </ul>

            <h3>💡 Como se preparar:</h3>
            <ul>
              <li>Pesquise sobre a história e valores da AutoU</li>
              <li>Prepare perguntas sobre a cultura da empresa</li>
              <li>Reflita sobre seus objetivos de carreira</li>
              <li>Pense em como você pode contribuir para a empresa</li>
              <li>Vista-se adequadamente e seja pontual</li>
            </ul>

            <div style="text-align: center; margin: 30px 0;">
              <a href="https://autou.com.br/candidato/consulta" class="button">
                Acompanhar Status
              </a>
            </div>

            <p>Estamos muito empolgados com sua participação no processo! Continue assim! 🚀</p>

            <p>
              Atenciosamente,<br>
              <strong>Equipe AutoU</strong>
            </p>
          </div>
          <div class="footer">
            <p>
              Em caso de dúvidas, entre em contato: <a href="mailto:rh@autou.com.br">rh@autou.com.br</a>
            </p>
            <p style="margin-top: 20px; font-size: 12px;">
              © ${new Date().getFullYear()} AutoU. Todos os direitos reservados.
            </p>
          </div>
        </body>
      </html>
    `
  }),

  reprovacaoEntrevistaTecnica: (data: ReprovacaoEntrevistaTecnicaData) => ({
    subject: `Processo Seletivo - ${data.vagaTitulo}`,
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
            .info-box {
              background: #f7fafc;
              border-left: 4px solid #667eea;
              padding: 15px;
              margin: 20px 0;
              border-radius: 4px;
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
            <h1 style="margin: 0;">Processo Seletivo - Atualização</h1>
          </div>
          <div class="content">
            <p>Olá <strong>${data.nome}</strong>,</p>

            <p>Agradecemos imensamente pelo tempo e dedicação que você investiu em nosso processo seletivo para a vaga de <strong>${data.vagaTitulo}</strong>.</p>

            <p>Após uma análise cuidadosa da entrevista técnica, infelizmente, <strong>não poderemos prosseguir</strong> com sua candidatura neste momento. Esta decisão foi baseada em critérios específicos que buscamos para esta posição.</p>

            <div class="info-box">
              <p style="margin: 0;"><strong>💡 Importante:</strong> Reconhecemos suas habilidades técnicas e seu desempenho ao longo do processo. A decisão não invalida suas competências profissionais, apenas reflete que buscamos um perfil específico para esta oportunidade em particular.</p>
            </div>

            <h3>🚀 Continue Crescendo:</h3>
            <p>Queremos encorajá-lo a continuar se desenvolvendo:</p>
            <ul>
              <li>Continue aprimorando suas habilidades técnicas e comportamentais</li>
              <li>Busque feedback em entrevistas e processos seletivos</li>
              <li>Participe de comunidades e eventos da área</li>
              <li>Mantenha-se atualizado com as tendências do mercado</li>
              <li>Não desista de seus objetivos profissionais</li>
            </ul>

            <p><strong>Fique de olho!</strong> Novas oportunidades surgem constantemente:</p>
            <ul>
              <li>Seu currículo permanecerá em nosso banco de talentos</li>
              <li>Incentivamos você a se candidatar a outras vagas que possam se alinhar melhor ao seu perfil</li>
              <li>Acompanhe nossas redes sociais para ficar por dentro de novas vagas</li>
            </ul>

            <div style="text-align: center; margin: 30px 0;">
              <a href="https://autou.com.br/candidato/vagas" class="button">
                Ver Outras Vagas Abertas
              </a>
            </div>

            <p>Desejamos muito sucesso em sua jornada profissional e esperamos que nossos caminhos possam se cruzar novamente no futuro!</p>

            <p>
              Atenciosamente,<br>
              <strong>Equipe AutoU</strong>
            </p>
          </div>
          <div class="footer">
            <p>
              Em caso de dúvidas, entre em contato: <a href="mailto:rh@autou.com.br">rh@autou.com.br</a>
            </p>
            <p style="margin-top: 20px; font-size: 12px;">
              © ${new Date().getFullYear()} AutoU. Todos os direitos reservados.
            </p>
          </div>
        </body>
      </html>
    `
  }),

  aprovacaoContratacao: (data: AprovacaoContratacaoData) => ({
    subject: `🎊 Parabéns! Você foi contratado(a) - ${data.vagaTitulo}`,
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
              background: linear-gradient(135deg, #10b981 0%, #059669 100%);
              color: white;
              padding: 40px;
              border-radius: 10px 10px 0 0;
              text-align: center;
            }
            .celebration {
              font-size: 48px;
              margin: 20px 0;
            }
            .content {
              background: white;
              padding: 30px;
              border: 1px solid #e2e8f0;
              border-radius: 0 0 10px 10px;
            }
            .success-box {
              background: #f0fdf4;
              border: 2px solid #10b981;
              padding: 20px;
              margin: 20px 0;
              border-radius: 8px;
              text-align: center;
            }
            .button {
              display: inline-block;
              background: #10b981;
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
            <div class="celebration">🎉🎊🥳🎈</div>
            <h1 style="margin: 0; font-size: 32px;">Parabéns, ${data.nome}!</h1>
            <p style="margin: 10px 0 0 0; font-size: 18px;">Você foi contratado(a)!</p>
          </div>
          <div class="content">
            <p>Olá <strong>${data.nome}</strong>,</p>

            <p>É com imensa alegria que informamos sua <strong>contratação</strong> para a vaga de <strong>${data.vagaTitulo}</strong> na AutoU!</p>

            <div class="success-box">
              <h2 style="margin: 0 0 10px 0; color: #065f46;">🌟 Bem-vindo(a) à família AutoU!</h2>
              <p style="margin: 0;">Você foi selecionado(a) entre muitos candidatos talentosos e demonstrou excelência em todas as etapas do processo.</p>
            </div>

            <h3>🚀 Próximos Passos:</h3>
            <p>${data.proximosPassos || 'Em breve, nossa equipe de RH entrará em contato com você para discutir os próximos passos.'}</p>

            <p>Nossa equipe de Recursos Humanos entrará em contato em breve para:</p>
            <ul>
              <li>📋 Apresentar a proposta formal de trabalho</li>
              <li>💼 Esclarecer detalhes sobre benefícios e remuneração</li>
              <li>📅 Definir a data de início</li>
              <li>📄 Orientar sobre a documentação necessária</li>
              <li>🏢 Compartilhar informações sobre onboarding</li>
            </ul>

            <p>
              <strong>Estamos extremamente animados</strong> para tê-lo(a) em nosso time! Mal podemos esperar para ver todas as contribuições incríveis que você trará para a AutoU e para nosso objetivo de revolucionar o setor automotivo!
            </p>

            <div style="text-align: center; margin: 30px 0;">
              <p style="font-size: 24px; margin: 20px 0;">🎯 🚗 💜</p>
              <p style="color: #10b981; font-weight: bold; font-size: 18px;">Juntos, vamos mais longe!</p>
            </div>

            <p>Qualquer dúvida, não hesite em nos contatar. Estamos aqui para tornar sua jornada conosco incrível desde o primeiro dia!</p>

            <p>
              Atenciosamente,<br>
              <strong>Equipe AutoU</strong>
            </p>
          </div>
          <div class="footer">
            <p>
              Este email requer confirmação. Por favor, responda confirmando o recebimento.<br>
              Contato: <a href="mailto:rh@autou.com.br">rh@autou.com.br</a>
            </p>
            <p style="margin-top: 20px; font-size: 12px;">
              © ${new Date().getFullYear()} AutoU. Todos os direitos reservados.
            </p>
          </div>
        </body>
      </html>
    `
  }),

  reprovacaoSocios: (data: ReprovacaoSociosData) => ({
    subject: `Processo Seletivo - ${data.vagaTitulo}`,
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
            .info-box {
              background: #f7fafc;
              border-left: 4px solid #667eea;
              padding: 15px;
              margin: 20px 0;
              border-radius: 4px;
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
            <h1 style="margin: 0;">Processo Seletivo - Atualização</h1>
          </div>
          <div class="content">
            <p>Olá <strong>${data.nome}</strong>,</p>

            <p>Agradecemos imensamente pelo tempo e dedicação que você investiu em nosso processo seletivo para a vaga de <strong>${data.vagaTitulo}</strong>.</p>

            <p>Após cuidadosa análise e entrevistas com nossa liderança, infelizmente, <strong>decidimos não prosseguir</strong> com sua candidatura neste momento. Esta decisão foi baseada em um conjunto de critérios estratégicos e de alinhamento cultural que buscamos para esta posição específica.</p>

            <div class="info-box">
              <p style="margin: 0;"><strong>💡 Importante:</strong> Reconhecemos seu talento, suas habilidades técnicas e comportamentais demonstradas ao longo de todo o processo. Esta decisão não invalida suas competências profissionais, apenas reflete que, neste momento específico, buscamos um perfil com características particulares para esta oportunidade.</p>
            </div>

            <h3>🌟 Você chegou longe:</h3>
            <p>É importante reconhecer que você passou por diversas etapas desafiadoras:</p>
            <ul>
              <li>✅ Aprovação na análise de perfil</li>
              <li>✅ Sucesso no case prático</li>
              <li>✅ Excelente desempenho na entrevista técnica</li>
              <li>✅ Entrevista com a liderança</li>
            </ul>
            <p>Isso demonstra a qualidade do seu trabalho e do seu perfil profissional!</p>

            <h3>🚀 Continue Crescendo:</h3>
            <p>Queremos encorajá-lo a continuar se desenvolvendo:</p>
            <ul>
              <li>Continue aprimorando suas habilidades técnicas e de liderança</li>
              <li>Busque feedback em todos os processos que participar</li>
              <li>Mantenha-se conectado a comunidades profissionais</li>
              <li>Não desista de seus objetivos de carreira</li>
            </ul>

            <p><strong>Fique de olho!</strong> Novas oportunidades surgem constantemente:</p>
            <ul>
              <li>Seu currículo permanecerá em nosso banco de talentos prioritário</li>
              <li>Incentivamos você a se candidatar a futuras vagas que possam se alinhar ao seu perfil</li>
              <li>Acompanhe nossas redes sociais e página de carreiras</li>
            </ul>

            <div style="text-align: center; margin: 30px 0;">
              <a href="https://autou.com.br/candidato/vagas" class="button">
                Ver Outras Vagas Abertas
              </a>
            </div>

            <p>Desejamos muito sucesso em sua jornada profissional e esperamos sinceramente que nossos caminhos possam se cruzar novamente no futuro!</p>

            <p>
              Atenciosamente,<br>
              <strong>Equipe AutoU</strong>
            </p>
          </div>
          <div class="footer">
            <p>
              Em caso de dúvidas, entre em contato: <a href="mailto:rh@autou.com.br">rh@autou.com.br</a>
            </p>
            <p style="margin-top: 20px; font-size: 12px;">
              © ${new Date().getFullYear()} AutoU. Todos os direitos reservados.
            </p>
          </div>
        </body>
      </html>
    `
  })
}