import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { candidato_id } = await request.json()
    
    if (!candidato_id) {
      return NextResponse.json({ error: 'candidato_id is required' }, { status: 400 })
    }

    const supabase = await createClient()
    
    // Buscar dados do candidato
    const { data: candidato, error } = await supabase
      .from('candidatos')
      .select('*, vagas!inner(titulo, descricao, requisitos)')
      .eq('id', candidato_id)
      .single()

    if (error || !candidato) {
      return NextResponse.json({ error: 'Candidato não encontrado' }, { status: 404 })
    }

    // Atualizar status para em avaliação
    await supabase
      .from('candidatos')
      .update({ 
        status: 'em_avaliacao_ia',
        fase_atual: 'avaliacao_ia'
      })
      .eq('id', candidato_id)

    // Preparar contexto para a IA
    const prompt = `
    Você é um recrutador experiente avaliando um candidato para a vaga de "${candidato.vagas.titulo}" na AutoU.
    
    Descrição da vaga: ${candidato.vagas.descricao}
    Requisitos: ${candidato.vagas.requisitos}
    
    Informações do candidato:
    - Nome: ${candidato.nome_completo}
    - Email: ${candidato.email}
    - Formação: ${candidato.curso_graduacao} em ${candidato.faculdade} (${candidato.status_graduacao})
    - Experiência: ${candidato.tempo_experiencia_total || 0} meses como ${candidato.cargo_atual} em ${candidato.empresa_atual}
    - Competências Técnicas: ${candidato.competencias_tecnicas}
    - Linguagens: ${candidato.linguagens_programacao}
    - Frameworks: ${candidato.frameworks_bibliotecas}
    - Nível de Inglês: ${candidato.nivel_ingles}
    - Experiência Relevante: ${candidato.experiencia_relevante}
    - Projetos: ${candidato.principais_projetos}
    - Motivação: ${candidato.motivacao_vaga}
    
    Currículo:
    ${candidato.curriculo_texto}
    
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
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: "Você é um recrutador experiente que avalia candidatos de forma justa e criteriosa."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 1000,
    })

    const analise = JSON.parse(completion.choices[0].message.content || '{}')
    
    // Determinar próximo status baseado no score
    const novoStatus = analise.score >= 7 ? 'case_enviado' : 'reprovado_ia'
    const novaFase = analise.score >= 7 ? 'case_pratico' : 'inscricao'
    
    // Calcular prazo do case (D+5)
    let prazoCase = null
    if (analise.score >= 7) {
      const prazo = new Date()
      prazo.setDate(prazo.getDate() + 5)
      prazoCase = prazo.toISOString()
    }

    // Atualizar candidato com resultado
    await supabase
      .from('candidatos')
      .update({
        score_ia: analise.score,
        analise_ia_completa: analise,
        status: novoStatus,
        fase_atual: novaFase,
        prazo_case: prazoCase
      })
      .eq('id', candidato_id)

    // Se aprovado, enviar notificação com link do case
    if (analise.score >= 7) {
      await supabase
        .from('notificacoes')
        .insert({
          candidato_id: candidato_id,
          tipo: 'aprovacao_ia',
          assunto: 'Parabéns! Você passou para a próxima fase',
          conteudo: `Olá ${candidato.nome_completo}! Você foi aprovado na primeira fase do processo seletivo. Acesse a plataforma para enviar seu case prático. Prazo: ${new Date(prazoCase!).toLocaleDateString('pt-BR')}.`,
          email_destinatario: candidato.email
        })
      
      // Aqui você integraria com o serviço de email real
    }

    return NextResponse.json({ 
      success: true, 
      score: analise.score,
      status: novoStatus,
      analise 
    })

  } catch (error) {
    console.error('Erro ao avaliar candidato:', error)
    return NextResponse.json(
      { error: 'Erro ao processar avaliação' },
      { status: 500 }
    )
  }
}