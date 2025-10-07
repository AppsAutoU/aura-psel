import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import OpenAI from 'openai'
import { sendEmailWithNodemailer } from '@/lib/email/nodemailer'
import { emailTemplates } from '@/lib/email/templates'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    // Validar chave da OpenAI
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_api_key') {
      console.error('OPENAI_API_KEY não configurada corretamente')
      return NextResponse.json({
        error: 'Chave da API OpenAI não configurada',
        details: 'Configure OPENAI_API_KEY no arquivo .env.local'
      }, { status: 500 })
    }

    const { candidato_id } = await request.json()

    if (!candidato_id) {
      return NextResponse.json({ error: 'candidato_id is required' }, { status: 400 })
    }

    const supabase = await createClient()

    // Buscar dados do candidato
    const { data: candidato, error: candidatoError } = await supabase
      .from('aura_jobs_candidatos')
      .select('*')
      .eq('id', candidato_id)
      .single()

    if (candidatoError || !candidato) {
      console.error('Erro ao buscar candidato:', candidatoError)
      return NextResponse.json({
        error: 'Candidato não encontrado',
        details: candidatoError?.message
      }, { status: 404 })
    }

    // Buscar dados da vaga separadamente (incluindo prazo_case_dias)
    let vaga = null
    if (candidato.vaga_id) {
      const { data: vagaData, error: vagaError } = await supabase
        .from('aura_jobs_vagas')
        .select('titulo, descricao, requisitos, prazo_case_dias')
        .eq('id', candidato.vaga_id)
        .single()

      if (vagaError) {
        console.error('Erro ao buscar vaga:', vagaError)
      } else {
        vaga = vagaData
      }
    }

    // Atualizar status para em avaliação
    await supabase
      .from('aura_jobs_candidatos')
      .update({
        status: 'em_avaliacao_ia',
        fase_atual: 'avaliacao_ia'
      })
      .eq('id', candidato_id)

    // Preparar informações de links profissionais
    const linksInfo = []
    if (candidato.linkedin) {
      linksInfo.push(`- LinkedIn: ${candidato.linkedin}`)
    }
    if (candidato.github) {
      linksInfo.push(`- GitHub: ${candidato.github}`)
    }
    if (candidato.portfolio) {
      linksInfo.push(`- Portfolio: ${candidato.portfolio}`)
    }

    // Preparar contexto para a IA
    const prompt = `
    Você é um recrutador experiente avaliando um candidato para a vaga de "${vaga?.titulo || 'Sem título'}" na Aura.

    Descrição da vaga: ${vaga?.descricao || 'Não informada'}
    Requisitos: ${vaga?.requisitos ? JSON.stringify(vaga.requisitos) : 'Não informados'}

    Informações do candidato:
    - Nome: ${candidato.nome_completo}
    - Email: ${candidato.email}
    - Formação: ${candidato.nivel_escolaridade || 'Não informada'} - ${candidato.curso || ''} (${candidato.instituicao || ''})
    - Experiência: ${candidato.experiencia_anos || 0} anos como ${candidato.cargo_atual || 'Não informado'} em ${candidato.empresa_atual || 'Não informada'}
    - Skills: ${candidato.principais_skills || 'Não informado'}
    - Cidade: ${candidato.cidade || 'Não informada'}, ${candidato.estado || ''}
    - Motivação: ${candidato.motivacao || 'Não informada'}
    - Disponibilidade: ${candidato.disponibilidade || 'Não informada'}
    - Salário pretendido: ${candidato.salario_pretendido ? `R$ ${candidato.salario_pretendido}` : 'Não informado'}

    Links Profissionais (IMPORTANTE: Acesse e analise estes links para obter mais informações):
    ${linksInfo.length > 0 ? linksInfo.join('\n    ') : '- Nenhum link fornecido'}

    ${linksInfo.length > 0 ? `
    INSTRUÇÕES IMPORTANTES:
    - Acesse o perfil do LinkedIn para verificar histórico profissional, recomendações, certificações e conexões
    - Analise o GitHub para avaliar qualidade do código, projetos, frequência de commits e tecnologias usadas
    - Revise o portfolio para entender trabalhos anteriores, design, e capacidade técnica
    - Use estas informações adicionais para complementar sua avaliação
    ` : ''}
    
    Avalie o candidato considerando:
    1. Adequação técnica aos requisitos da vaga
    2. Experiência relevante
    3. Potencial de crescimento
    4. Fit cultural baseado na motivação
    
    Retorne um JSON com:
    {
      "score": número de 0 a 10 (seja criterioso, scores acima de 7 devem ser para candidatos excepcionais),
      "pontos_fortes": ["lista de pontos fortes"],
      "pontos_melhoria": ["lista de pontos a melhorar"],
      "adequacao_vaga": "texto explicando a adequação à vaga",
      "recomendacao": "aprovar" ou "reprovar",
      "justificativa": "justificativa detalhada da decisão"
    }
    `

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Você é um recrutador experiente que avalia candidatos de forma justa e criteriosa. Quando fornecido com URLs de perfis profissionais (LinkedIn, GitHub, Portfolio), você deve considerar essas informações na sua avaliação, extraindo insights sobre experiência, habilidades técnicas, projetos e recomendações."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 1500,
    })

    const analise = JSON.parse(completion.choices[0].message.content || '{}')
    
    // Determinar próximo status baseado no score
    const novoStatus = analise.score >= 7 ? 'case_enviado' : 'reprovado_ia'
    const novaFase = analise.score >= 7 ? 'case_pratico' : 'inscricao'
    
    // Calcular prazo do case (baseado na configuração da vaga ou D+5 como padrão)
    let prazoCase = null
    if (analise.score >= 7) {
      // Usar prazo configurado na vaga ou padrão de 5 dias
      const prazoDias = vaga?.prazo_case_dias ?? 5

      // Validar o prazo (segurança extra)
      const diasValidados = (prazoDias > 0 && prazoDias <= 30) ? prazoDias : 5

      const prazo = new Date()
      prazo.setDate(prazo.getDate() + diasValidados) // Dias dinâmicos por vaga
      prazo.setHours(23, 59, 59, 999) // Set to 23:59:59
      prazoCase = prazo.toISOString()

      console.log(`📅 Prazo do case calculado: D+${diasValidados} para vaga "${vaga?.titulo}"`)
    }

    // Atualizar candidato com resultado
    await supabase
      .from('aura_jobs_candidatos')
      .update({
        score_ia: analise.score,
        analise_ia_completa: analise,
        status: novoStatus,
        fase_atual: novaFase,
        prazo_case: prazoCase
      })
      .eq('id', candidato_id)

    // Enviar email baseado no resultado
    try {
      // Now sending directly to candidate's email using nodemailer
      const emailDestino = candidato.email

      if (analise.score >= 7) {
        // APROVADO: Enviar email de aprovação
        const prazoFormatado = prazoCase
          ? new Date(prazoCase).toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })
          : 'A definir'

        // Determinar link do case baseado no título da vaga
        const getCaseLink = (vagaTitulo: string): string => {
          const titulo = vagaTitulo.toLowerCase()

          // Product Designer ou PO
          if (titulo.includes('product designer') || titulo.includes('designer') || titulo.includes('po') || titulo.includes('product owner')) {
            return 'https://www.notion.so/autou-digital/Case-Pr-tico-AutoU-Product-Designer-PO-20d36ce78e5580a5a8f7ce7693d4bfce'
          }

          // Desenvolvedor (Frontend, Backend, Full Stack, etc)
          if (titulo.includes('desenvolvedor') || titulo.includes('developer') || titulo.includes('frontend') || titulo.includes('backend') || titulo.includes('full stack')) {
            return 'https://www.notion.so/autou-digital/Case-Pr-tico-AutoU-Desenvolvimento-18836ce78e5580d0b59bcf9610b27769'
          }

          // Consultor de Negócios
          if (titulo.includes('consultor') || titulo.includes('negócio') || titulo.includes('negocio') || titulo.includes('business')) {
            return 'https://www.notion.so/autou-digital/Case-Pr-tico-AutoU-Consultoria-1ff36ce78e5580f5a410c5393d227bfe'
          }

          // Default: link de desenvolvimento
          return 'https://www.notion.so/autou-digital/Case-Pr-tico-AutoU-Desenvolvimento-18836ce78e5580d0b59bcf9610b27769'
        }

        const linkCase = getCaseLink(vaga?.titulo || '')

        const emailData = emailTemplates.aprovacaoIA({
          nome: candidato.nome_completo,
          vagaTitulo: vaga?.titulo || 'Vaga',
          score: analise.score,
          prazoCase: prazoFormatado,
          linkCase: linkCase
        })

        await sendEmailWithNodemailer({
          to: emailDestino,
          subject: emailData.subject,
          html: emailData.html
        })

        console.log(`✅ Email de aprovação enviado para ${emailDestino}`)
      } else {
        // REPROVADO: Enviar email de rejeição
        const feedbackText = analise.justificativa ||
          'Após análise detalhada, identificamos que seu perfil não atende completamente aos requisitos específicos desta vaga no momento.'

        const emailData = emailTemplates.reprovacaoIA({
          nome: candidato.nome_completo,
          vagaTitulo: vaga?.titulo || 'Vaga',
          score: analise.score,
          feedback: feedbackText
        })

        await sendEmailWithNodemailer({
          to: emailDestino,
          subject: emailData.subject,
          html: emailData.html
        })

        console.log(`📧 Email de rejeição enviado para ${emailDestino}`)
      }
    } catch (emailError) {
      // Não falhar a requisição se o email falhar
      console.error('Erro ao enviar email:', emailError)
    }

    return NextResponse.json({ 
      success: true, 
      score: analise.score,
      status: novoStatus,
      analise 
    })

  } catch (error: any) {
    console.error('Erro ao avaliar candidato:', error)
    const errorMessage = error?.message || error?.toString() || 'Erro ao processar avaliação'
    return NextResponse.json(
      {
        error: 'Erro ao processar avaliação',
        details: errorMessage,
        stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined
      },
      { status: 500 }
    )
  }
}