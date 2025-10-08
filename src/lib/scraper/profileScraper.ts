import puppeteer, { Browser, Page } from 'puppeteer'

interface ScrapedContent {
  source: string
  content: string
  success: boolean
  error?: string
}

/**
 * Faz login no LinkedIn usando credenciais fornecidas
 * Retorna true se login foi bem sucedido
 */
async function loginToLinkedIn(page: Page): Promise<boolean> {
  const linkedinEmail = process.env.LINKEDIN_EMAIL
  const linkedinPassword = process.env.LINKEDIN_PASSWORD

  if (!linkedinEmail || !linkedinPassword) {
    console.log('  ℹ️  Credenciais do LinkedIn não configuradas - tentando acesso público')
    return false
  }

  try {
    console.log('  🔐 Fazendo login no LinkedIn...')

    // Ir para página de login
    await page.goto('https://www.linkedin.com/login', {
      waitUntil: 'domcontentloaded',
      timeout: 15000
    })

    // Aguardar formulário de login carregar
    await page.waitForSelector('#username', { timeout: 5000 })
    await page.waitForSelector('#password', { timeout: 5000 })

    // Preencher credenciais
    await page.type('#username', linkedinEmail, { delay: 100 })
    await page.type('#password', linkedinPassword, { delay: 100 })

    // Clicar no botão de login
    await page.click('button[type="submit"]')

    // Aguardar navegação após login
    await page.waitForNavigation({
      waitUntil: 'domcontentloaded',
      timeout: 15000
    }).catch(() => {
      // Ignorar timeout de navegação - às vezes não há redirect
    })

    // Aguardar um pouco para garantir que o login foi processado
    await page.waitForTimeout(2000)

    // Verificar se login foi bem sucedido
    const currentUrl = page.url()
    const isLoggedIn =
      currentUrl.includes('/feed') ||
      currentUrl.includes('/in/') ||
      !currentUrl.includes('/login')

    if (isLoggedIn) {
      console.log('  ✅ Login no LinkedIn realizado com sucesso!')
      return true
    } else {
      console.warn('  ⚠️  Login no LinkedIn falhou - tentando acesso público')
      return false
    }
  } catch (error: any) {
    console.error(`  ❌ Erro ao fazer login no LinkedIn: ${error.message}`)
    return false
  }
}

/**
 * Scraper para LinkedIn
 * Extrai: headline, about, experiências, educação, skills
 *
 * NOVO: Suporta login automático se credenciais forem fornecidas no .env
 * Se LINKEDIN_EMAIL e LINKEDIN_PASSWORD estiverem configurados, faz login antes.
 */
async function scrapeLinkedIn(url: string, browser: Browser): Promise<ScrapedContent> {
  let page
  try {
    page = await browser.newPage()

    // Configurar headers realistas para evitar detecção
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')

    await page.setExtraHTTPHeaders({
      'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br',
      'DNT': '1',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1'
    })

    // Desabilitar recursos pesados para ser mais rápido
    await page.setRequestInterception(true)
    page.on('request', (request) => {
      const resourceType = request.resourceType()
      if (['image', 'stylesheet', 'font', 'media'].includes(resourceType)) {
        request.abort()
      } else {
        request.continue()
      }
    })

    // NOVO: Tentar fazer login se credenciais estiverem disponíveis
    const isLoggedIn = await loginToLinkedIn(page)

    console.log(`  📡 Acessando LinkedIn: ${url}`)

    // Timeout ajustado baseado em se está logado ou não
    const timeout = isLoggedIn ? 20000 : 10000 // 20s se logado, 10s se público

    try {
      await page.goto(url, {
        waitUntil: 'domcontentloaded',
        timeout
      })
    } catch (timeoutError) {
      console.warn('⏱️  LinkedIn demorou muito para responder (timeout 10s)')
      return {
        source: 'LinkedIn',
        content: `LinkedIn Profile (URL: ${url})

⚠️ ATENÇÃO: O LinkedIn não respondeu no tempo esperado.

MOTIVO: O LinkedIn pode estar bloqueando acesso automatizado ou o perfil não está acessível.

RECOMENDAÇÃO PARA AVALIAÇÃO:
- Use as informações fornecidas pelo candidato no formulário de inscrição
- Foque na análise do currículo PDF, GitHub e Portfolio
- Não penalize o candidato pela falta de acesso ao LinkedIn`,
        success: false,
        error: 'LinkedIn timeout - possível bloqueio ou perfil inacessível'
      }
    }

    // Aguardar apenas 1 segundo (reduzido de 2s)
    await page.waitForTimeout(1000)

    // Verificar se foi bloqueado pelo LinkedIn
    const pageTitle = await page.title()
    const pageUrl = page.url()

    console.log(`  📄 Título da página: "${pageTitle}"`)
    console.log(`  🔗 URL final: ${pageUrl}`)

    // Detectar se foi redirecionado para login/signup ou outras páginas de bloqueio
    const isBlocked =
      pageTitle.toLowerCase().includes('cadastre-se') ||
      pageTitle.toLowerCase().includes('sign up') ||
      pageTitle.toLowerCase().includes('login') ||
      pageTitle.toLowerCase().includes('join linkedin') ||
      pageTitle.toLowerCase().includes('page not found') ||
      pageTitle.toLowerCase() === 'linkedin' || // Página genérica, sem conteúdo
      pageUrl.includes('/signup') ||
      pageUrl.includes('/login') ||
      pageUrl.includes('/authwall') ||
      pageUrl.includes('/uas/login') ||
      pageUrl !== url // Redirecionado para outra URL

    if (isBlocked) {
      console.warn('⚠️  LinkedIn bloqueou o acesso - perfil requer autenticação')
      console.warn('  💡 Dica: LinkedIn exige login para visualizar perfis completos')

      return {
        source: 'LinkedIn',
        content: `LinkedIn Profile (URL: ${url})

⚠️ ATENÇÃO: Não foi possível acessar este perfil do LinkedIn.

MOTIVO: O LinkedIn requer autenticação (login) para visualizar perfis completos.
O sistema de scraping não consegue acessar perfis privados ou que exigem login.

RECOMENDAÇÃO PARA AVALIAÇÃO:
- Use as informações fornecidas pelo candidato no formulário de inscrição
- Foque na análise do GitHub e Portfolio (se disponíveis)
- Considere que a falta de acesso ao LinkedIn não deve penalizar o candidato
- O candidato declarou ter um perfil no LinkedIn: ${url}

Para avaliação futura: considere pedir ao candidato para tornar seu perfil público ou usar a API oficial do LinkedIn.`,
        success: false,
        error: 'LinkedIn requer autenticação - perfil não acessível publicamente'
      }
    }

    // Extrair conteúdo visível do perfil
    const content = await page.evaluate(() => {
      const getText = (selector: string) => {
        const element = document.querySelector(selector)
        return element?.textContent?.trim() || ''
      }

      const getAll = (selector: string) => {
        const elements = document.querySelectorAll(selector)
        return Array.from(elements).map(el => el.textContent?.trim()).filter(Boolean).join(' | ')
      }

      // Extrair informações principais do LinkedIn
      return {
        name: getText('h1') || getText('.text-heading-xlarge'),
        headline: getText('.text-body-medium') || getText('.top-card-layout__headline'),
        about: getText('#about') || getText('.pv-about-section'),
        experience: getAll('.experience-item') || getAll('.pv-entity__summary-info'),
        education: getAll('.education-item') || getAll('.pv-education-entity'),
        skills: getAll('.skill-item') || getAll('.pv-skill-category-entity__name'),
        // Pegar todo o texto visível como fallback
        fullText: document.body.innerText
      }
    })

    // Montar resumo estruturado
    const summary = `
LINKEDIN PROFILE:
Nome: ${content.name}
Headline: ${content.headline}

Sobre: ${content.about}

Experiência Profissional: ${content.experience}

Educação: ${content.education}

Skills: ${content.skills}

Texto completo do perfil:
${content.fullText.slice(0, 3000)}
    `.trim()

    // Logs detalhados do que foi extraído
    console.log('✅ LinkedIn scraping concluído com sucesso!')
    console.log('📊 Conteúdo extraído do LinkedIn:')
    console.log('  • Nome:', content.name || 'Não encontrado')
    console.log('  • Headline:', content.headline || 'Não encontrada')
    console.log('  • Sobre (caracteres):', content.about?.length || 0)
    console.log('  • Experiências encontradas:', content.experience ? 'Sim' : 'Não')
    console.log('  • Educação encontrada:', content.education ? 'Sim' : 'Não')
    console.log('  • Skills encontradas:', content.skills ? 'Sim' : 'Não')
    console.log('  • Total de texto extraído:', content.fullText?.length || 0, 'caracteres')
    console.log('  • Resumo final (tamanho):', summary.length, 'caracteres')

    await page.close()

    return {
      source: 'LinkedIn',
      content: summary,
      success: true
    }
  } catch (error: any) {
    if (page) await page.close()
    console.error(`Erro ao fazer scraping do LinkedIn: ${error.message}`)
    return {
      source: 'LinkedIn',
      content: '',
      success: false,
      error: error.message
    }
  }
}

/**
 * Scraper para GitHub
 * Extrai: bio, repositórios, linguagens, atividade, stars
 */
async function scrapeGitHub(url: string, browser: Browser): Promise<ScrapedContent> {
  let page
  try {
    page = await browser.newPage()

    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')

    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 30000
    })

    const content = await page.evaluate(() => {
      const getText = (selector: string) => {
        const element = document.querySelector(selector)
        return element?.textContent?.trim() || ''
      }

      const getAll = (selector: string) => {
        const elements = document.querySelectorAll(selector)
        return Array.from(elements).map(el => el.textContent?.trim()).filter(Boolean).join(' | ')
      }

      return {
        name: getText('h1') || getText('.vcard-fullname'),
        bio: getText('.p-note') || getText('[data-bio-text]'),
        location: getText('[itemprop="homeLocation"]'),
        company: getText('[itemprop="worksFor"]'),
        repositories: getAll('.repo') || getAll('[itemprop="name codeRepository"]'),
        languages: getAll('.lang') || getAll('[itemprop="programmingLanguage"]'),
        contributions: getText('.js-yearly-contributions') || getText('.contribution-activity-listing'),
        pinned: getAll('.pinned-item-list-item') || '',
        fullText: document.body.innerText
      }
    })

    const summary = `
GITHUB PROFILE:
Nome: ${content.name}
Bio: ${content.bio}
Localização: ${content.location}
Empresa: ${content.company}

Repositórios: ${content.repositories}

Linguagens de Programação: ${content.languages}

Projetos em Destaque: ${content.pinned}

Contribuições: ${content.contributions}

Texto completo do perfil:
${content.fullText.slice(0, 3000)}
    `.trim()

    // Logs detalhados do que foi extraído
    console.log('✅ GitHub scraping concluído com sucesso!')
    console.log('💻 Conteúdo extraído do GitHub:')
    console.log('  • Username:', content.name || 'Não encontrado')
    console.log('  • Bio:', content.bio || 'Não encontrada')
    console.log('  • Localização:', content.location || 'Não informada')
    console.log('  • Empresa:', content.company || 'Não informada')
    console.log('  • Repositórios encontrados:', content.repositories ? 'Sim' : 'Não')
    console.log('  • Linguagens encontradas:', content.languages ? 'Sim' : 'Não')
    console.log('  • Projetos em destaque:', content.pinned ? 'Sim' : 'Não')
    console.log('  • Contribuições:', content.contributions ? 'Sim' : 'Não')
    console.log('  • Total de texto extraído:', content.fullText?.length || 0, 'caracteres')
    console.log('  • Resumo final (tamanho):', summary.length, 'caracteres')

    await page.close()

    return {
      source: 'GitHub',
      content: summary,
      success: true
    }
  } catch (error: any) {
    if (page) await page.close()
    console.error(`Erro ao fazer scraping do GitHub: ${error.message}`)
    return {
      source: 'GitHub',
      content: '',
      success: false,
      error: error.message
    }
  }
}

/**
 * Scraper genérico para Portfolio
 * Extrai: conteúdo textual geral, imagens, links
 */
async function scrapePortfolio(url: string, browser: Browser): Promise<ScrapedContent> {
  let page
  try {
    page = await browser.newPage()

    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')

    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 30000
    })

    const content = await page.evaluate(() => {
      const getText = (selector: string) => {
        const element = document.querySelector(selector)
        return element?.textContent?.trim() || ''
      }

      const getAll = (selector: string) => {
        const elements = document.querySelectorAll(selector)
        return Array.from(elements).map(el => el.textContent?.trim()).filter(Boolean).join(' | ')
      }

      // Tentar extrair meta tags
      const getMetaContent = (name: string) => {
        const meta = document.querySelector(`meta[name="${name}"]`) ||
                     document.querySelector(`meta[property="${name}"]`)
        return meta?.getAttribute('content') || ''
      }

      return {
        title: document.title,
        description: getMetaContent('description') || getMetaContent('og:description'),
        headings: getAll('h1, h2, h3'),
        paragraphs: getAll('p'),
        projects: getAll('.project, .portfolio-item, .work-item, article'),
        fullText: document.body.innerText
      }
    })

    const summary = `
PORTFOLIO:
Título: ${content.title}
Descrição: ${content.description}

Headings: ${content.headings}

Projetos/Trabalhos: ${content.projects}

Conteúdo:
${content.fullText.slice(0, 3000)}
    `.trim()

    // Logs detalhados do que foi extraído
    console.log('✅ Portfolio scraping concluído com sucesso!')
    console.log('🎨 Conteúdo extraído do Portfolio:')
    console.log('  • Título da página:', content.title || 'Não encontrado')
    console.log('  • Descrição (meta):', content.description || 'Não encontrada')
    console.log('  • Headings encontrados:', content.headings ? 'Sim' : 'Não')
    console.log('  • Projetos/Trabalhos:', content.projects ? 'Sim' : 'Não')
    console.log('  • Total de texto extraído:', content.fullText?.length || 0, 'caracteres')
    console.log('  • Resumo final (tamanho):', summary.length, 'caracteres')

    await page.close()

    return {
      source: 'Portfolio',
      content: summary,
      success: true
    }
  } catch (error: any) {
    if (page) await page.close()
    console.error(`Erro ao fazer scraping do Portfolio: ${error.message}`)
    return {
      source: 'Portfolio',
      content: '',
      success: false,
      error: error.message
    }
  }
}

/**
 * Função principal que coordena o scraping de todos os links
 */
export async function scrapeProfileLinks(links: {
  linkedin?: string
  github?: string
  portfolio?: string
}): Promise<{
  linkedinContent: string
  githubContent: string
  portfolioContent: string
  summary: string
}> {
  let browser: Browser | null = null

  try {
    console.log('🚀 Iniciando browser para scraping...')

    // Iniciar browser em modo headless
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--window-size=1920x1080'
      ]
    })

    const results: ScrapedContent[] = []

    // Helper para adicionar timeout a uma promise
    const withTimeout = <T>(promise: Promise<T>, timeoutMs: number, errorMessage: string): Promise<T> => {
      return Promise.race([
        promise,
        new Promise<T>((_, reject) =>
          setTimeout(() => reject(new Error(errorMessage)), timeoutMs)
        )
      ])
    }

    // Scraping sequencial (não paralelo) para evitar sobrecarga
    // LinkedIn com timeout de 15 segundos total
    if (links.linkedin) {
      console.log(`📊 Fazendo scraping do LinkedIn: ${links.linkedin}`)
      try {
        const linkedinResult = await withTimeout(
          scrapeLinkedIn(links.linkedin, browser),
          15000, // 15 segundos máximo para LinkedIn
          'LinkedIn scraping timeout - 15 segundos excedidos'
        )
        results.push(linkedinResult)
      } catch (error: any) {
        console.error(`❌ Erro no scraping do LinkedIn: ${error.message}`)
        results.push({
          source: 'LinkedIn',
          content: `LinkedIn Profile (URL: ${links.linkedin})

⚠️ ATENÇÃO: Não foi possível acessar o LinkedIn no tempo limite.

MOTIVO: ${error.message}

RECOMENDAÇÃO PARA AVALIAÇÃO:
- Use as informações fornecidas pelo candidato no formulário de inscrição e currículo
- Foque na análise do GitHub e Portfolio (se disponíveis)
- Não penalize o candidato pela falta de acesso ao LinkedIn`,
          success: false,
          error: error.message
        })
      }
    }

    // GitHub com timeout de 20 segundos
    if (links.github) {
      console.log(`💻 Fazendo scraping do GitHub: ${links.github}`)
      try {
        const githubResult = await withTimeout(
          scrapeGitHub(links.github, browser),
          20000, // 20 segundos máximo para GitHub
          'GitHub scraping timeout - 20 segundos excedidos'
        )
        results.push(githubResult)
      } catch (error: any) {
        console.error(`❌ Erro no scraping do GitHub: ${error.message}`)
        results.push({
          source: 'GitHub',
          content: '',
          success: false,
          error: error.message
        })
      }
    }

    // Portfolio com timeout de 20 segundos
    if (links.portfolio) {
      console.log(`🎨 Fazendo scraping do Portfolio: ${links.portfolio}`)
      try {
        const portfolioResult = await withTimeout(
          scrapePortfolio(links.portfolio, browser),
          20000, // 20 segundos máximo para Portfolio
          'Portfolio scraping timeout - 20 segundos excedidos'
        )
        results.push(portfolioResult)
      } catch (error: any) {
        console.error(`❌ Erro no scraping do Portfolio: ${error.message}`)
        results.push({
          source: 'Portfolio',
          content: '',
          success: false,
          error: error.message
        })
      }
    }

    await browser.close()

    // Montar conteúdos individuais
    const linkedinContent = results.find(r => r.source === 'LinkedIn')?.content || ''
    const githubContent = results.find(r => r.source === 'GitHub')?.content || ''
    const portfolioContent = results.find(r => r.source === 'Portfolio')?.content || ''

    // Criar resumo consolidado
    const successfulScrapes = results.filter(r => r.success)
    const failedScrapes = results.filter(r => !r.success)

    let summary = ''

    if (successfulScrapes.length > 0) {
      summary += `✅ Conteúdo extraído com sucesso de: ${successfulScrapes.map(r => r.source).join(', ')}\n\n`

      if (linkedinContent) summary += `${linkedinContent}\n\n---\n\n`
      if (githubContent) summary += `${githubContent}\n\n---\n\n`
      if (portfolioContent) summary += `${portfolioContent}\n\n`
    }

    if (failedScrapes.length > 0) {
      summary += `\n⚠️ Não foi possível acessar: ${failedScrapes.map(r => `${r.source} (${r.error})`).join(', ')}`
    }

    console.log(`✅ Scraping concluído! ${successfulScrapes.length}/${results.length} fontes acessadas com sucesso.`)

    return {
      linkedinContent,
      githubContent,
      portfolioContent,
      summary: summary || 'Nenhum link foi acessado com sucesso.'
    }

  } catch (error: any) {
    console.error('❌ Erro crítico no scraping:', error)

    if (browser) {
      await browser.close()
    }

    return {
      linkedinContent: '',
      githubContent: '',
      portfolioContent: '',
      summary: `Erro ao fazer scraping dos perfis: ${error.message}`
    }
  }
}
