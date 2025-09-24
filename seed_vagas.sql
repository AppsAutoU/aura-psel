-- Inserir vagas de exemplo para o sistema AutoU
-- Execute este arquivo após criar o schema principal

INSERT INTO aura_jobs_vagas (
    titulo, 
    descricao, 
    departamento, 
    tipo_contrato, 
    modelo_trabalho, 
    localizacao, 
    nivel_experiencia, 
    salario_min, 
    salario_max, 
    requisitos, 
    beneficios, 
    vaga_key, 
    ativa,
    vagas_disponiveis
) VALUES 

-- Vaga 1: Desenvolvedor Frontend Sênior
(
    'Desenvolvedor Frontend Sênior',
    'Estamos buscando um Desenvolvedor Frontend Sênior para integrar nosso time de tecnologia e ajudar a construir interfaces excepcionais para nossos produtos de recrutamento inteligente. Você trabalhará com React, TypeScript e as mais modernas tecnologias frontend, contribuindo para a evolução da plataforma AutoU.',
    'Tecnologia',
    'CLT',
    'Híbrido',
    'São Paulo, SP',
    'Sênior',
    12000.00,
    18000.00,
    ARRAY[
        'Experiência sólida com React e TypeScript (4+ anos)',
        'Conhecimento avançado em CSS e pré-processadores (Sass, Styled Components)',
        'Experiência com gerenciamento de estado (Redux, Zustand, Context API)',
        'Familiaridade com testes automatizados (Jest, Testing Library)',
        'Conhecimento em ferramentas de build (Webpack, Vite) e bundlers',
        'Experiência com APIs REST e GraphQL',
        'Versionamento de código com Git',
        'Inglês técnico para leitura'
    ],
    ARRAY[
        'Salário competitivo + bônus por performance',
        'Vale refeição de R$ 40/dia',
        'Plano de saúde e odontológico premium',
        'Auxílio home office de R$ 500/mês',
        'Horário flexível e trabalho híbrido',
        'Licença parental estendida',
        'Budget para cursos e conferências',
        'Stock options da empresa'
    ],
    'dev-frontend-senior-2024',
    true,
    2
),

-- Vaga 2: Desenvolvedor Full Stack Pleno
(
    'Desenvolvedor Full Stack Pleno',
    'Procuramos um Desenvolvedor Full Stack Pleno para trabalhar tanto no frontend quanto no backend de nossas aplicações. Você será responsável por desenvolver funcionalidades completas, desde a interface do usuário até a lógica de negócio e integração com banco de dados.',
    'Tecnologia',
    'CLT',
    'Remoto',
    'Remoto',
    'Pleno',
    8000.00,
    12000.00,
    ARRAY[
        'Experiência com desenvolvimento frontend (React/Vue.js) - 2+ anos',
        'Conhecimento sólido em backend (Node.js, Python ou Java)',
        'Experiência com bancos de dados relacionais (PostgreSQL, MySQL)',
        'Familiaridade com APIs REST e integração de serviços',
        'Conhecimento básico em DevOps (Docker, CI/CD)',
        'Experiência com controle de versão Git',
        'Capacidade de trabalhar de forma autônoma',
        'Inglês intermediário'
    ],
    ARRAY[
        'Trabalho 100% remoto',
        'Salário competitivo + participação nos lucros',
        'Vale alimentação de R$ 600/mês',
        'Plano de saúde nacional',
        'Auxílio internet e energia',
        'Flexibilidade de horário',
        'Orçamento para setup home office',
        'Ambiente de aprendizado contínuo'
    ],
    'dev-fullstack-pleno-2024',
    true,
    3
),

-- Vaga 3: Analista de Dados Júnior
(
    'Analista de Dados Júnior',
    'Buscamos um Analista de Dados Júnior para nos ajudar a extrair insights valiosos dos nossos dados de recrutamento e candidatos. Você trabalhará com Python, SQL e ferramentas de visualização para apoiar decisões estratégicas da empresa.',
    'Dados',
    'CLT',
    'Presencial',
    'São Paulo, SP',
    'Júnior',
    4500.00,
    7000.00,
    ARRAY[
        'Formação em Estatística, Matemática, Ciência da Computação ou áreas correlatas',
        'Conhecimento em Python para análise de dados (Pandas, NumPy)',
        'Experiência com SQL e manipulação de bancos de dados',
        'Familiaridade com ferramentas de visualização (Tableau, Power BI ou Plotly)',
        'Noções básicas de estatística e machine learning',
        'Capacidade analítica e atenção a detalhes',
        'Proatividade e vontade de aprender',
        'Inglês básico para leitura técnica'
    ],
    ARRAY[
        'Plano de carreira estruturado',
        'Mentoria com profissionais sênior',
        'Vale refeição de R$ 35/dia',
        'Plano de saúde e odontológico',
        'Convênio com academia',
        'Horário flexível',
        'Cursos e certificações pagas pela empresa',
        'Ambiente jovem e dinâmico'
    ],
    'analista-dados-junior-2024',
    true,
    1
),

-- Vaga 4: Product Manager
(
    'Product Manager',
    'Estamos em busca de um Product Manager estratégico para liderar o desenvolvimento dos nossos produtos de recrutamento inteligente. Você será responsável por definir a visão do produto, priorizar funcionalidades e trabalhar próximo aos times de engenharia e design.',
    'Produto',
    'CLT',
    'Híbrido',
    'São Paulo, SP',
    'Pleno',
    10000.00,
    15000.00,
    ARRAY[
        'Experiência como Product Manager ou Product Owner (3+ anos)',
        'Conhecimento em metodologias ágeis (Scrum, Kanban)',
        'Experiência com ferramentas de produto (Jira, Figma, Analytics)',
        'Capacidade de análise de dados e métricas de produto',
        'Excelente comunicação e liderança',
        'Experiência em produtos B2B SaaS (preferencial)',
        'Conhecimento do mercado de RH/Recrutamento (diferencial)',
        'Inglês avançado'
    ],
    ARRAY[
        'Oportunidade de impactar milhares de candidatos',
        'Salário competitivo + equity',
        'Vale refeição de R$ 50/dia',
        'Plano de saúde premium',
        'Budget para ferramentas e software',
        'Participação em conferências internacionais',
        'Flexibilidade total de horário',
        'Time multicultural e diverso'
    ],
    'product-manager-2024',
    true,
    1
),

-- Vaga 5: UX/UI Designer
(
    'UX/UI Designer',
    'Procuramos um UX/UI Designer criativo e orientado ao usuário para criar experiências digitais excepcionais. Você será responsável por pesquisar, projetar e testar interfaces que tornem o processo de recrutamento mais humano e eficiente.',
    'Design',
    'PJ',
    'Híbrido',
    'São Paulo, SP',
    'Pleno',
    6000.00,
    10000.00,
    ARRAY[
        'Portfolio sólido com projetos de UX/UI',
        'Experiência com Figma, Sketch ou Adobe XD',
        'Conhecimento em Design Thinking e metodologias de UX',
        'Experiência com prototipagem e testes de usabilidade',
        'Conhecimento básico em HTML/CSS',
        'Capacidade de colaborar com desenvolvedores',
        'Atenção a detalhes e pixel perfect',
        'Inglês intermediário'
    ],
    ARRAY[
        'Regime PJ com flexibilidade total',
        'Projeto desafiador em startup em crescimento',
        'Auxílio para ferramentas de design',
        'Participação em eventos de design',
        'Time criativo e colaborativo',
        'Possibilidade de crescimento internacional',
        'Liberdade criativa e autonomia',
        'Feedback constante e mentoria'
    ],
    'ux-ui-designer-2024',
    true,
    1
);

-- Comentário sobre as vagas criadas
COMMENT ON TABLE aura_jobs_vagas IS 'Vagas de exemplo criadas para demonstração do sistema AutoU. Inclui diferentes níveis, departamentos e modalidades de trabalho.';