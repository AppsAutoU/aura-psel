import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import OpenAI from 'openai'
import { sendEmailWithNodemailer } from '@/lib/email/nodemailer'
import { emailTemplates } from '@/lib/email/templates'
import { scrapeProfileLinks } from '@/lib/scraper/profileScraper'

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

    // 🚀 NOVO: Fazer scraping dos links profissionais
    console.log('🔍 Iniciando scraping dos perfis profissionais...')

    let scrapedContent = {
      linkedinContent: '',
      githubContent: '',
      portfolioContent: '',
      summary: 'Nenhum link profissional fornecido.'
    }

    const hasLinks = candidato.linkedin || candidato.github || candidato.portfolio

    if (hasLinks) {
      try {
        scrapedContent = await scrapeProfileLinks({
          linkedin: candidato.linkedin || undefined,
          github: candidato.github || undefined,
          portfolio: candidato.portfolio || undefined
        })
        console.log('✅ Scraping concluído com sucesso!')
      } catch (error: any) {
        console.error('❌ Erro ao fazer scraping:', error.message)
        scrapedContent.summary = `Erro ao acessar links: ${error.message}`
      }
    }

    // 📄 NOVO: Extrair texto do currículo PDF usando pdf2json
    let curriculoText = ''
    let curriculoInfo = ''

    if (candidato.curriculo_url) {
      console.log('📄 Baixando e extraindo texto do currículo PDF...')
      try {
        // Baixar o PDF do Supabase Storage
        const { data: pdfData, error: downloadError } = await supabase.storage
          .from('candidatos')
          .download(candidato.curriculo_url)

        if (downloadError) {
          curriculoInfo = `⚠️ Erro ao baixar currículo: ${downloadError.message}`
          console.warn('⚠️ Erro ao baixar PDF:', downloadError)
          curriculoText = '[Currículo PDF fornecido mas não pôde ser baixado]'
        } else if (pdfData) {
          // Converter para Buffer
          const arrayBuffer = await pdfData.arrayBuffer()
          const buffer = Buffer.from(arrayBuffer)
          console.log(`📦 PDF baixado: ${buffer.length} bytes`)

          // Salvar temporariamente o PDF para processar
          const fs = await import('fs/promises')
          const path = await import('path')
          const os = await import('os')

          const tempDir = os.tmpdir()
          const tempFilePath = path.join(tempDir, `curriculo_${candidato.id}.pdf`)

          await fs.writeFile(tempFilePath, buffer)
          console.log(`💾 PDF salvo temporariamente: ${tempFilePath}`)

          // Processar PDF com pdf2json
          const PDFParser = (await import('pdf2json')).default

          const extractedText = await new Promise<string>((resolve, reject) => {
            const pdfParser = new PDFParser()

            pdfParser.on('pdfParser_dataReady', (pdfData: any) => {
              try {
                // Extrair texto de todas as páginas
                let text = ''
                if (pdfData.Pages) {
                  pdfData.Pages.forEach((page: any) => {
                    if (page.Texts) {
                      page.Texts.forEach((textItem: any) => {
                        if (textItem.R) {
                          textItem.R.forEach((r: any) => {
                            if (r.T) {
                              text += decodeURIComponent(r.T) + ' '
                            }
                          })
                        }
                      })
                      text += '\n\n'
                    }
                  })
                }
                resolve(text.trim())
              } catch (e: any) {
                reject(e)
              }
            })

            pdfParser.on('pdfParser_dataError', (error: any) => {
              reject(new Error(error.parserError))
            })

            pdfParser.loadPDF(tempFilePath)
          })

          curriculoText = extractedText

          // Limpar arquivo temporário
          try {
            await fs.unlink(tempFilePath)
            console.log('🗑️ Arquivo temporário removido')
          } catch (e) {
            console.warn('⚠️ Não foi possível remover arquivo temporário')
          }

          curriculoInfo = `✅ Currículo PDF extraído com sucesso (${curriculoText.length} caracteres)`
          console.log(`✅ Texto extraído do PDF: ${curriculoText.length} caracteres`)
        } else {
          curriculoInfo = '⚠️ Currículo PDF não encontrado'
          curriculoText = '[Currículo PDF não encontrado no storage]'
          console.warn('⚠️ PDF não encontrado')
        }
      } catch (error: any) {
        console.error('❌ Erro ao processar currículo:', error.message)
        console.error('Stack:', error.stack)
        curriculoInfo = `❌ Erro ao extrair texto do PDF: ${error.message}`
        curriculoText = `[Erro ao processar currículo PDF: ${error.message}]`
      }
    } else {
      curriculoInfo = 'ℹ️ Candidato não enviou currículo em PDF'
      curriculoText = '[Candidato não enviou currículo em PDF]'
      console.log('ℹ️ Candidato não enviou currículo')
    }

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

    // Preparar contexto para a IA com conteúdo REAL dos links
    const prompt = `
    ==========================================
    🎯 VAGA: ${vaga?.titulo || 'Sem título'}
    ==========================================

    DESCRIÇÃO DA VAGA:
    ${vaga?.descricao || 'Não informada'}

    REQUISITOS DA VAGA:
    ${vaga?.requisitos ? vaga.requisitos.map((r: string) => `• ${r}`).join('\n    ') : '• Não informados'}

    ==========================================
    📝 INFORMAÇÕES DO FORMULÁRIO DE INSCRIÇÃO
    ==========================================

    DADOS PESSOAIS:
    • Nome Completo: ${candidato.nome_completo}
    • Email: ${candidato.email}
    • Telefone: ${candidato.telefone || 'Não informado'}
    • Data de Nascimento: ${candidato.data_nascimento || 'Não informada'}
    • Localização: ${candidato.cidade || 'Não informada'}${candidato.estado ? `, ${candidato.estado}` : ''}${candidato.pais ? ` - ${candidato.pais}` : ''}

    FORMAÇÃO ACADÊMICA:
    • Nível de Escolaridade: ${candidato.nivel_escolaridade || 'Não informada'}
    • Curso: ${candidato.curso || 'Não informado'}
    • Instituição: ${candidato.instituicao || 'Não informada'}
    • Ano de Conclusão: ${candidato.ano_conclusao || 'Não informado'}

    EXPERIÊNCIA PROFISSIONAL:
    • Anos de Experiência: ${candidato.experiencia_anos || 0} anos
    • Cargo Atual: ${candidato.cargo_atual || 'Não informado'}
    • Empresa Atual: ${candidato.empresa_atual || 'Não informada'}
    • Salário Pretendido: ${candidato.salario_pretendido ? `R$ ${candidato.salario_pretendido.toLocaleString('pt-BR')}` : 'Não informado'}

    SKILLS E COMPETÊNCIAS:
    ${candidato.principais_skills || 'Não informado'}

    MOTIVAÇÃO PARA A VAGA:
    ${candidato.motivacao || 'Não informada'}

    DISPONIBILIDADE:
    ${candidato.disponibilidade || 'Não informada'}

    LINKS PROFISSIONAIS:
    ${linksInfo.length > 0 ? linksInfo.join('\n    ') : '• Nenhum link fornecido'}

    ==========================================
    📄 CURRÍCULO EM PDF (TEXTO EXTRAÍDO):
    ==========================================

    ${curriculoInfo}

    ${curriculoText && curriculoText !== '[Candidato não enviou currículo em PDF]' ? `
    CONTEÚDO DO CURRÍCULO:
    ${curriculoText.slice(0, 6000)}
    ${curriculoText.length > 6000 ? '\n\n[Currículo muito longo - primeiros 6000 caracteres mostrados]' : ''}
    ` : ''}

    ==========================================
    CONTEÚDO EXTRAÍDO DOS PERFIS PROFISSIONAIS:
    ==========================================

    ${scrapedContent.summary}

    ==========================================

    INSTRUÇÕES DE AVALIAÇÃO:

    🔍 ANÁLISE COMPLETA - USE TODAS AS FONTES DE INFORMAÇÃO:

    1️⃣ FORMULÁRIO DE INSCRIÇÃO (peso alto - informações diretas do candidato):
       - Analise detalhadamente TODAS as informações do formulário acima
       - Dê especial atenção à MOTIVAÇÃO, SKILLS e EXPERIÊNCIA declarada
       - Considere a clareza e profundidade das respostas
       - Avalie se o candidato demonstrou interesse genuíno na vaga

    2️⃣ CURRÍCULO EM PDF (peso altíssimo - documento formal):
       - Analise profundamente TODO o conteúdo do currículo
       - Verifique experiências, projetos, certificações, educação
       - Compare com as informações do formulário para validar consistência

    3️⃣ PERFIS PROFISSIONAIS (peso médio-alto - validação externa):
       - GitHub: qualidade de código, projetos, atividade, linguagens
       - Portfolio: projetos apresentados, qualidade visual/técnica
       - LinkedIn: experiências profissionais, recomendações, skills

    CRITÉRIOS DE AVALIAÇÃO (em ordem de importância):

    1. ADEQUAÇÃO AOS REQUISITOS DA VAGA (40% do score):
       - O candidato possui as skills técnicas requeridas?
       - A experiência profissional é relevante para a vaga?
       - A formação acadêmica é adequada?
       - Analise TANTO o formulário QUANTO o currículo e perfis

    2. EXPERIÊNCIA E QUALIFICAÇÃO (30% do score):
       - Anos de experiência declarados no formulário
       - Empresas e cargos anteriores (formulário + currículo + LinkedIn)
       - Projetos realizados (currículo + GitHub + Portfolio)
       - Certificações e educação continuada

    3. MOTIVAÇÃO E FIT CULTURAL (20% do score):
       - Qualidade da motivação escrita no formulário
       - Demonstração de interesse genuíno na vaga e empresa
       - Alinhamento de valores e objetivos
       - Disponibilidade e expectativas salariais compatíveis

    4. EVIDÊNCIAS TÉCNICAS CONCRETAS (10% do score):
       - Para tech: código no GitHub, projetos no portfolio
       - Para design: portfolio visual, projetos apresentados
       - Para outras áreas: trabalhos, publicações, realizações

    ⚠️ IMPORTANTES:
    - Se o LinkedIn não estiver acessível (requer autenticação), NÃO penalize o candidato
    - Dê GRANDE importância às informações do FORMULÁRIO - são respostas diretas e intencionais
    - A MOTIVAÇÃO escrita no formulário é crucial para avaliar fit e interesse
    - SKILLS declaradas no formulário devem ser levadas a sério, especialmente se validadas no currículo/perfis
    - Compare sempre: formulário ↔ currículo ↔ perfis online (busque consistência)

    Retorne um JSON com:
    {
      "score": número de 0 a 10 (seja equilibrado - considere TODAS as fontes: formulário + currículo + perfis),
      "pontos_fortes": ["lista de pontos fortes baseados no formulário, currículo e perfis - cite as fontes"],
      "pontos_melhoria": ["lista de pontos a melhorar ou lacunas identificadas"],
      "adequacao_vaga": "texto explicando a adequação à vaga, citando informações específicas do formulário, currículo e perfis",
      "recomendacao": "aprovar" ou "reprovar",
      "justificativa": "justificativa detalhada explicando o score, SEMPRE mencionando: 1) O que foi analisado no FORMULÁRIO (motivação, skills, experiência declarada), 2) O que foi encontrado no CURRÍCULO, 3) O que foi validado nos PERFIS ONLINE. Seja específico e cite exemplos concretos de cada fonte."
    }
    `

    // Preparar mensagens para a API - se houver PDF, usar formato multimodal
    const messages: any[] = [
      {
        role: "system",
        content: `Você é um recrutador técnico sênior com expertise em avaliação profunda de candidatos.

        Você recebe CONTEÚDO REAL extraído automaticamente de múltiplas fontes:
        1. 📝 FORMULÁRIO DE INSCRIÇÃO (peso ALTO - informações diretas e intencionais do candidato)
        2. 📄 CURRÍCULO EM PDF (peso ALTÍSSIMO - documento formal completo que você DEVE LER)
        3. 🔗 LinkedIn, GitHub e Portfolio (peso MÉDIO-ALTO - validação externa)

        Sua responsabilidade é analisar TODO o conteúdo fornecido, seguindo esta prioridade:

        🔴 PRIORIDADE MÁXIMA - FORMULÁRIO DE INSCRIÇÃO:
        - Motivação escrita pelo candidato (demonstra interesse genuíno)
        - Skills e competências autodeclaradas
        - Experiência profissional informada
        - Formação acadêmica
        - Disponibilidade e expectativas
        - Respostas específicas sobre a vaga

        🔴 PRIORIDADE MÁXIMA - CURRÍCULO PDF:
        - Experiências profissionais detalhadas
        - Projetos realizados
        - Formação acadêmica completa
        - Certificações e cursos
        - Idiomas e outras qualificações
        - VOCÊ RECEBERÁ O PDF PARA ANÁLISE VISUAL - LEIA TODO O DOCUMENTO

        🟡 VALIDAÇÃO EXTERNA - PERFIS ONLINE:
        - LinkedIn: experiências, educação, skills, recomendações
        - GitHub: repositórios, código, projetos, atividade
        - Portfolio: projetos visuais/técnicos apresentados

        IMPORTANTE: O FORMULÁRIO e o CURRÍCULO são as fontes PRIMÁRIAS de informação.
        Os perfis online servem para VALIDAR e COMPLEMENTAR essas informações.

        Seja equilibrado e justo: avalie com base em TODAS as fontes, dando peso especial ao que o candidato escreveu no formulário e no currículo.`
      }
    ]

    // Adicionar prompt principal
    messages.push({
      role: "user",
      content: prompt
    })

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages,
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 2000,
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