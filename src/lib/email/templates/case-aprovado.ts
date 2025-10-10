/**
 * Template de email para candidatos aprovados pela IA
 * Enviado quando o candidato passa na avaliação inicial e deve fazer o case prático
 */

interface CaseAprovadoParams {
  nome: string
  vagaTitulo: string
  linkCaseNotion: string
  linkFormularioEntrega: string
  prazoFormatado: string // Ex: "15 de Janeiro de 2025"
  diasPrazo: number // Ex: 5
}

export function caseAprovadoTemplate({
  nome,
  vagaTitulo,
  linkCaseNotion,
  linkFormularioEntrega,
  prazoFormatado,
  diasPrazo
}: CaseAprovadoParams): string {
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Você foi aprovado! 🎉</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f7; color: #1d1d1f;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f7; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">

          <!-- Header com gradiente -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700;">
                🎉 Parabéns, ${nome}!
              </h1>
              <p style="margin: 10px 0 0 0; color: #ffffff; font-size: 18px; opacity: 0.95;">
                Você foi aprovado na primeira etapa!
              </p>
            </td>
          </tr>

          <!-- Conteúdo -->
          <tr>
            <td style="padding: 40px 30px;">

              <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: #1d1d1f;">
                É com grande satisfação que informamos que você passou na <strong>avaliação inicial</strong> para a vaga de:
              </p>

              <div style="background-color: #f5f5f7; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0; font-size: 20px; font-weight: 600; color: #667eea; text-align: center;">
                  ${vagaTitulo}
                </p>
              </div>

              <h2 style="margin: 30px 0 15px 0; font-size: 20px; font-weight: 600; color: #1d1d1f;">
                📋 Próximos Passos
              </h2>

              <div style="background-color: #fff; border-left: 4px solid #667eea; padding: 20px; margin: 15px 0;">
                <h3 style="margin: 0 0 10px 0; font-size: 16px; font-weight: 600; color: #1d1d1f;">
                  1️⃣ Leia o Case Prático
                </h3>
                <p style="margin: 0 0 15px 0; font-size: 14px; line-height: 1.5; color: #6e6e73;">
                  Acesse o enunciado completo do case no Notion e entenda bem o desafio proposto.
                </p>
                <a href="${linkCaseNotion}"
                   style="display: inline-block; background-color: #667eea; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; font-size: 14px;">
                  📖 Acessar Enunciado no Notion
                </a>
              </div>

              <div style="background-color: #fff; border-left: 4px solid #51cf66; padding: 20px; margin: 15px 0;">
                <h3 style="margin: 0 0 10px 0; font-size: 16px; font-weight: 600; color: #1d1d1f;">
                  2️⃣ Desenvolva sua Solução
                </h3>
                <p style="margin: 0; font-size: 14px; line-height: 1.5; color: #6e6e73;">
                  Você tem <strong>${diasPrazo} dias</strong> para desenvolver e entregar sua solução.
                </p>
              </div>

              <div style="background-color: #fff; border-left: 4px solid #ff6b6b; padding: 20px; margin: 15px 0;">
                <h3 style="margin: 0 0 10px 0; font-size: 16px; font-weight: 600; color: #1d1d1f;">
                  3️⃣ Envie seus Entregáveis
                </h3>
                <p style="margin: 0 0 15px 0; font-size: 14px; line-height: 1.5; color: #6e6e73;">
                  Quando terminar, acesse o formulário de entrega e envie seus links (GitHub, Figma, vídeo, etc).
                </p>
                <a href="${linkFormularioEntrega}"
                   style="display: inline-block; background-color: #ff6b6b; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; font-size: 14px;">
                  📤 Enviar Meu Case
                </a>
              </div>

              <!-- Prazo destacado -->
              <div style="background-color: #fff3cd; border: 2px solid #ffc107; padding: 20px; border-radius: 8px; margin: 30px 0;">
                <p style="margin: 0; font-size: 14px; font-weight: 600; color: #856404; text-align: center;">
                  ⏰ <strong>Prazo de Entrega:</strong> até ${prazoFormatado}
                </p>
              </div>

              <h2 style="margin: 30px 0 15px 0; font-size: 18px; font-weight: 600; color: #1d1d1f;">
                💡 Dicas Importantes
              </h2>

              <ul style="margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.8; color: #6e6e73;">
                <li>Leia o enunciado com atenção e tire todas as dúvidas</li>
                <li>Capriche na apresentação e documentação</li>
                <li>Mostre seu raciocínio e processo criativo</li>
                <li>Entregue dentro do prazo (prioridade importante!)</li>
                <li>Teste bem sua solução antes de enviar</li>
              </ul>

              <div style="margin-top: 40px; padding-top: 30px; border-top: 1px solid #e5e5ea;">
                <p style="margin: 0 0 10px 0; font-size: 14px; color: #6e6e73;">
                  Estamos ansiosos para ver sua solução! 🚀
                </p>
                <p style="margin: 0; font-size: 14px; color: #6e6e73;">
                  <strong>Equipe AutoU</strong><br>
                  <a href="https://autou.com.br" style="color: #667eea; text-decoration: none;">autou.com.br</a>
                </p>
              </div>

            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>
  `.trim()
}
