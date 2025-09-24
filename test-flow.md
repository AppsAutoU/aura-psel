# Teste do Fluxo de Vagas - Ponta a Ponta

## 1. Criar uma Vaga (Admin)
- Acesse: http://localhost:3002/admin/vagas
- Clique em "Nova Vaga"
- Preencha os campos obrigatórios
- Salve a vaga
- Copie o link da vaga criada

## 2. Acessar Formulário de Inscrição (Candidato)
- Cole o link copiado no navegador
- O link deve ser: http://localhost:3002/candidato/inscricao/[vaga_key]
- O formulário deve carregar com as informações da vaga

## 3. Preencher e Enviar Inscrição
- Preencha todos os campos obrigatórios
- Envie o formulário
- Deve ser redirecionado para página de sucesso

## 4. Verificar Inscrições (Admin)
- Acesse: http://localhost:3002/admin/vagas
- Clique em "👥" na vaga criada
- Deve ver a inscrição enviada
- Pode alterar o status do candidato

## URLs importantes:
- Admin Dashboard: http://localhost:3002/admin/vagas
- Lista de Vagas: http://localhost:3002/admin/vagas
- Candidatos por Vaga: http://localhost:3002/admin/vagas/[id]/candidatos
- Formulário de Inscrição: http://localhost:3002/candidato/inscricao/[vaga_key]

## Status do Sistema:
✅ Criar vagas no admin
✅ Copiar link direto para formulário
✅ Formulário público de inscrição
✅ Salvar inscrições no banco
✅ Visualizar candidatos no admin
✅ Alterar status dos candidatos