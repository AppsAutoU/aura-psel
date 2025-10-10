# 🧪 COMO TESTAR O SISTEMA DE CASES

## 🎯 Formulário de Teste Criado!

### **Link do Formulário de Teste:**
```
http://localhost:3000/case/entregar-teste
```

Com source:
```
http://localhost:3000/case/entregar-teste?source=notion-dev
http://localhost:3000/case/entregar-teste?source=notion-design
http://localhost:3000/case/entregar-teste?source=notion-consultoria
```

---

## 📝 PASSO A PASSO PARA TESTAR

### **1. Preencher Formulário de Teste**
1. Acesse: http://localhost:3000/case/entregar-teste
2. Preencha com QUALQUER dados (não precisa ser candidato real)
   - Nome: Teste Silva
   - Email: teste@exemplo.com
   - Links: https://github.com/teste, etc
   - Comentários: "Este é um teste do sistema"
3. Clique em "Enviar Case de Teste"
4. ✅ Você verá mensagem de sucesso!

### **2. Ver no Portal Avaliador**

**Opção A - Se usou email de candidato real:**
1. Acesse: http://localhost:3000/avaliador
2. Procure o candidato com aquele email
3. Clique em "Avaliar"
4. ✅ A entrega deve aparecer automaticamente!

**Opção B - Se usou email de teste qualquer:**
1. A entrega foi salva em `/data/case-entregas/TESTE_*.json`
2. Você pode ver os arquivos criados
3. Para vincular a um candidato, use o email do candidato real no formulário

---

## 📂 Onde os Dados são Salvos

```
/data/case-entregas/
├── TESTE_abc-123.json     ← Entregas de teste
├── TESTE_def-456.json     ← Mais entregas de teste
└── _index.json            ← Índice de todas
```

---

## 🔍 Como Verificar se Funcionou

### **1. Ver os arquivos JSON criados:**
```bash
ls -la data/case-entregas/
```

### **2. Ver conteúdo de um arquivo:**
```bash
cat data/case-entregas/TESTE_*.json
```

### **3. Ver o índice completo:**
```bash
cat data/case-entregas/_index.json
```

---

## ✅ O Que Deve Funcionar

- ✅ Formulário aceita qualquer email
- ✅ Dados são salvos em JSON
- ✅ Portal Avaliador busca do JSON
- ✅ Mostra automaticamente:
  - Status "Case Submetido"
  - Links dos entregáveis
  - Comentários
  - Origem (source)
  - Data/hora

---

## 🗑️ Como Limpar os Testes Depois

```bash
# Deletar só os arquivos de teste
rm data/case-entregas/TESTE_*.json

# Ou deletar tudo
rm -rf data/case-entregas/*
```

---

## 🚀 Próximos Passos

Depois de testar e confirmar que funciona:

1. ✅ Deletar `/case/entregar-teste` (página de teste)
2. ✅ Deletar `/api/case/submeter-teste` (API de teste)
3. ✅ Limpar arquivos JSON de teste
4. ✅ Sistema de produção ficará usando apenas:
   - `/case/entregar` (formulário real)
   - `/api/case/submeter` (API real que busca candidato)

---

## 📊 Sistema em Produção

Quando estiver pronto:
- Candidato recebe email com link do formulário
- Formulário verifica se candidato existe
- Salva no banco (quando estiver pronto) + JSON backup
- Portal Avaliador mostra automaticamente
- ✅ Tudo funcionando!
