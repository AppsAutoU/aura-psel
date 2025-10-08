# 🤖 Sistema de Avaliação por IA com Web Scraping

## 📍 Arquivos Envolvidos

1. **[src/app/api/ai/avaliar-candidato/route.ts](src/app/api/ai/avaliar-candidato/route.ts)** - API de avaliação por IA
2. **[src/lib/scraper/profileScraper.ts](src/lib/scraper/profileScraper.ts)** - Módulo de web scraping

---

## 🚀 Como Funciona Agora (COM SCRAPING)

### 1. **Fluxo de Avaliação Completo**

```
1. Candidato se inscreve → Status: "inscrito"
2. Admin dispara avaliação → Status: "em_avaliacao_ia"
3. 🆕 SISTEMA FAZ WEB SCRAPING dos links profissionais:
   ├── LinkedIn: Extrai experiências, educação, skills, recomendações
   ├── GitHub: Analisa repositórios, linguagens, commits, projetos
   └── Portfolio: Captura projetos, descrições, trabalhos anteriores
4. IA analisa DADOS REAIS extraídos + informações do formulário
5. IA retorna score (0-10) com base em EVIDÊNCIAS CONCRETAS

Se score >= 7:
  ✅ Status: "case_enviado"
  ✅ Email: Template "aprovacaoIA" com link do case prático
  ✅ Prazo: D+5 dias (ou prazo configurado na vaga)

Se score < 7:
  ❌ Status: "reprovado_ia"
  ❌ Email: Template "reprovacaoIA" com feedback
```

---

## 🔍 O Que é Extraído de Cada Plataforma

### **LinkedIn** ([src/lib/scraper/profileScraper.ts](src/lib/scraper/profileScraper.ts):13-72)

```typescript
✅ Nome completo
✅ Headline profissional
✅ Seção "Sobre"
✅ Experiências profissionais (empresas, cargos, período)
✅ Formação acadêmica (instituições, cursos)
✅ Skills listadas
✅ Todo o texto visível do perfil
```

**Exemplo do conteúdo extraído:**
```
LINKEDIN PROFILE:
Nome: João Silva
Headline: Senior Full Stack Developer | React | Node.js | AWS

Sobre: Desenvolvedor apaixonado com 5 anos de experiência...

Experiência Profissional:
- Senior Developer na Tech Corp (2021-presente)
- Full Stack Developer na Startup XYZ (2019-2021)

Educação:
- Bacharelado em Ciência da Computação - USP

Skills: JavaScript | React | Node.js | TypeScript | AWS | Docker
```

---

### **GitHub** ([src/lib/scraper/profileScraper.ts](src/lib/scraper/profileScraper.ts):78-149)

```typescript
✅ Nome/username
✅ Bio
✅ Localização
✅ Empresa atual
✅ Lista de repositórios
✅ Linguagens de programação utilizadas
✅ Projetos em destaque (pinned repos)
✅ Histórico de contribuições
✅ Todo o texto visível do perfil
```

**Exemplo do conteúdo extraído:**
```
GITHUB PROFILE:
Nome: joaosilva
Bio: Full Stack Developer | Open Source Enthusiast
Localização: São Paulo, Brasil
Empresa: Tech Corp

Repositórios:
- e-commerce-platform (React, Node.js, MongoDB)
- api-gateway-microservices (Node.js, Docker, Kubernetes)
- real-time-chat-app (Socket.io, Redis)

Linguagens de Programação: JavaScript | TypeScript | Python | Go

Projetos em Destaque:
- e-commerce-platform: Full-featured e-commerce with payment integration
- api-gateway: Scalable microservices architecture

Contribuições: 1,247 contributions in the last year
```

---

### **Portfolio** ([src/lib/scraper/profileScraper.ts](src/lib/scraper/profileScraper.ts):155-221)

```typescript
✅ Título da página
✅ Meta description
✅ Headings principais (H1, H2, H3)
✅ Parágrafos de texto
✅ Projetos/trabalhos listados
✅ Todo o conteúdo textual visível
```

**Exemplo do conteúdo extraído:**
```
PORTFOLIO:
Título: João Silva - Full Stack Developer Portfolio
Descrição: Portfólio profissional apresentando projetos...

Headings:
About Me | My Projects | Skills | Contact

Projetos/Trabalhos:
- E-commerce Platform: Built a scalable e-commerce with React and Node
- SaaS Dashboard: Created admin dashboard for SaaS company
- Mobile App: Developed cross-platform app with React Native

Conteúdo:
Hi, I'm João Silva, a Full Stack Developer with 5 years of experience...
[resto do conteúdo do site]
```

---

## 🧠 Como a IA Usa Essas Informações

### **Critérios de Avaliação Atualizados** ([src/app/api/ai/avaliar-candidato/route.ts](src/app/api/ai/avaliar-candidato/route.ts):138-152)

```typescript
1. Adequação técnica aos requisitos da vaga
   → Baseado em EVIDÊNCIAS CONCRETAS dos perfis

2. Experiência relevante
   → Verificada nos perfis profissionais (não apenas autodeclarada)

3. Potencial de crescimento
   → Analisando evolução de projetos e aprendizado contínuo

4. Fit cultural
   → Baseado na motivação e apresentação profissional

5. Consistência e veracidade
   → Comparando declarações do formulário com evidências dos perfis
```

### **Prioridade de Análise**

A IA é instruída a dar **mais peso** para:
- ✅ Projetos reais no GitHub com código de qualidade
- ✅ Histórico consistente de commits (frequência, regularidade)
- ✅ Experiências documentadas no LinkedIn com detalhes
- ✅ Recomendações e certificações
- ✅ Portfolio demonstrando trabalhos concretos

E **menos peso** para:
- ❌ Apenas declarações no formulário sem evidências
- ❌ Perfis vazios ou desatualizados
- ❌ Inconsistências entre o declarado e o encontrado

---

## 📊 Exemplo de Avaliação Completa

### **Input: Candidato para Vaga de Desenvolvedor Full Stack**

**Formulário:**
- Nome: Maria Santos
- Experiência: 3 anos
- Skills: React, Node.js, PostgreSQL
- GitHub: github.com/maria-dev
- LinkedIn: linkedin.com/in/maria-santos-dev

**Scraping LinkedIn:**
```
✅ Confirmado: 3 anos de experiência
✅ Empresas: TechStart (2022-atual), CodeLab (2021-2022)
✅ Formação: Engenharia de Software - UNICAMP
✅ Skills: React, Node.js, PostgreSQL, TypeScript, AWS
✅ 2 recomendações de colegas
```

**Scraping GitHub:**
```
✅ 25 repositórios públicos
✅ Linguagens: JavaScript (60%), TypeScript (30%), Python (10%)
✅ Projetos destacados:
   - task-manager-app (React + Node + PostgreSQL)
   - weather-api (Node.js + Express + OpenWeather API)
✅ 450 commits no último ano
✅ Contribuiu para 3 projetos open source
```

**Análise da IA:**
```json
{
  "score": 8.5,
  "pontos_fortes": [
    "Portfólio GitHub ativo com 450 commits/ano demonstra consistência",
    "Projeto task-manager-app utiliza stack completa (React+Node+PostgreSQL) alinhada à vaga",
    "Experiência verificada no LinkedIn coincide com o declarado",
    "Contribuições open source demonstram colaboração e código de qualidade",
    "Skills técnicas confirmadas tanto no LinkedIn quanto nos projetos GitHub"
  ],
  "pontos_melhoria": [
    "Pouca experiência com containerização (Docker/Kubernetes)",
    "Falta de projetos com testes automatizados visíveis no GitHub"
  ],
  "adequacao_vaga": "Candidata demonstra excelente fit técnico para a vaga de Full Stack. Projetos no GitHub comprovam domínio de React e Node.js, com destaque para o task-manager-app que implementa arquitetura completa. Experiência profissional verificada no LinkedIn confirma 3 anos em empresas de tecnologia.",
  "recomendacao": "aprovar",
  "justificativa": "Candidata apresenta evidências concretas de competência técnica através de portfólio ativo no GitHub (25 repos, 450 commits/ano) e experiência profissional verificada no LinkedIn. O projeto task-manager-app demonstra capacidade de desenvolver aplicações full stack com a stack exata da vaga. Contribuições open source indicam boa prática de código e colaboração. Score 8.5 justificado pela combinação de experiência comprovada, portfólio sólido e alinhamento técnico com os requisitos."
}
```

**Resultado:** ✅ Aprovada para Case Prático (score >= 7)

---

## 🔒 Segurança e Boas Práticas

### **Implementadas no Scraper** ([src/lib/scraper/profileScraper.ts](src/lib/scraper/profileScraper.ts))

1. **User Agent** - Simula navegador real para evitar bloqueios
2. **Timeout** - 30 segundos por página para não travar
3. **Headless Mode** - Browser roda em background sem interface
4. **Error Handling** - Continua mesmo se um link falhar
5. **Scraping Paralelo** - Processa LinkedIn, GitHub e Portfolio simultaneamente
6. **Limite de Conteúdo** - Extrai até 3000 caracteres por perfil para não sobrecarregar a IA
7. **Browser Cleanup** - Fecha browser automaticamente após uso

### **Limitações e Tratamento de Erros**

```typescript
✅ Se LinkedIn estiver privado → Scraper tenta extrair o máximo possível
✅ Se GitHub não existir → Continua sem erro, apenas marca como "não acessado"
✅ Se Portfolio der timeout → Segue com avaliação baseada em outros dados
✅ Se TODOS os links falharem → IA avalia apenas com dados do formulário
```

---

## 🎯 Impacto na Qualidade das Avaliações

### **ANTES (Sem Scraping)**
- ❌ IA analisava apenas texto do formulário
- ❌ Não verificava veracidade das informações
- ❌ Não tinha acesso a projetos reais
- ❌ Avaliação superficial baseada em autodeclarações
- ❌ Alta chance de candidatos "inflarem" currículo

### **AGORA (Com Scraping)**
- ✅ IA analisa projetos reais e código no GitHub
- ✅ Verifica consistência entre formulário e perfis online
- ✅ Acessa experiências detalhadas no LinkedIn
- ✅ Avalia portfolio concreto de trabalhos
- ✅ Avaliação profunda baseada em EVIDÊNCIAS
- ✅ Scores mais justos e representativos da capacidade real

---

## 🧪 Como Testar

1. **Criar uma vaga** no Portal Administrador
2. **Inscrever um candidato** com links reais de LinkedIn/GitHub/Portfolio
3. **Disparar avaliação** por IA
4. **Verificar logs** do servidor para ver o scraping em ação:
   ```
   🔍 Iniciando scraping dos perfis profissionais...
   📊 Fazendo scraping do LinkedIn: https://linkedin.com/in/...
   💻 Fazendo scraping do GitHub: https://github.com/...
   🎨 Fazendo scraping do Portfolio: https://...
   ✅ Scraping concluído! 3/3 fontes acessadas com sucesso.
   ```
5. **Analisar resultado** - Score deve refletir evidências encontradas nos perfis

---

## 📈 Métricas de Sucesso

O sistema registra:
- ✅ Quantos links foram acessados com sucesso
- ✅ Quais plataformas falharam (e por quê)
- ✅ Tempo de scraping por perfil
- ✅ Conteúdo extraído vs. usado pela IA

Isso permite melhorar continuamente a precisão do scraping.

---

## 🔧 Tecnologias Utilizadas

- **Puppeteer** - Automação de browser headless
- **OpenAI GPT-4o** - Análise inteligente do conteúdo
- **Next.js API Routes** - Backend serverless
- **TypeScript** - Type safety e melhor DX

---

## 💡 Próximas Melhorias Possíveis

1. **Cache de Perfis** - Salvar conteúdo extraído para não refazer scraping
2. **LinkedIn API** - Usar API oficial quando disponível
3. **GitHub API** - Adicionar métricas detalhadas (pull requests, issues, code quality)
4. **Análise de Código** - IA pode ler código real dos repositórios
5. **Score por Dimensão** - Scores separados para técnico, cultural, experiência
6. **Machine Learning** - Treinar modelo com histórico de contratações bem-sucedidas

---

**Implementado com sucesso! 🎉**
