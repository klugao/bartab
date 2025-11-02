# ✅ Checklist - Configuração SonarQube

## 📋 Pré-requisitos

- [ ] SonarQube rodando em http://localhost:9000
- [ ] Node.js instalado (v20+)
- [ ] npm ou yarn instalado
- [ ] Git configurado

---

## 🧪 Teste Local (Recomendado fazer primeiro)

### Backend

- [ ] Navegar para pasta backend: `cd backend`
- [ ] Instalar dependências: `npm ci`
- [ ] Executar testes: `npm run test:cov`
- [ ] Verificar se gerou: `ls -la coverage/lcov.info`
- [ ] Instalar scanner: `npm install -g sonarqube-scanner`
- [ ] Executar análise:
  ```bash
  sonar-scanner \
    -Dsonar.host.url=http://localhost:9000
  ```
- [ ] Acessar dashboard: http://localhost:9000/dashboard?id=bartab-backend
- [ ] Verificar métricas (bugs, cobertura, etc.)

### Frontend

- [ ] Navegar para pasta frontend: `cd frontend`
- [ ] Instalar dependências: `npm ci`
- [ ] Executar testes: `npm run test:coverage`
- [ ] Verificar se gerou: `ls -la coverage/lcov.info`
- [ ] Executar análise:
  ```bash
  sonar-scanner \
    -Dsonar.host.url=http://localhost:9000
  ```
- [ ] Acessar dashboard: http://localhost:9000/dashboard?id=bartab-frontend
- [ ] Verificar métricas (bugs, cobertura, etc.)

### Ou usar o script automatizado

- [ ] Executar: `./test-sonar.sh all`
- [ ] Verificar ambos os dashboards no SonarQube

---

## ☁️ Configuração GitHub Actions

### 1. Configurar Secrets

- [ ] Acessar: GitHub → Settings → Secrets and variables → Actions
- [ ] Clicar em: New repository secret
- [ ] Adicionar **SONAR_TOKEN**:
  - Nome: `SONAR_TOKEN`
  - Valor: `sqa_38ad5c3247d3aa2765223a9e033bbae8a648cfb2`
- [ ] Adicionar **SONAR_HOST_URL**:
  - Nome: `SONAR_HOST_URL`
  - Valor: `http://localhost:9000` (ou URL pública)

### 2. Decidir sobre Acessibilidade

⚠️ **IMPORTANTE:** GitHub Actions não pode acessar `localhost`

Escolha uma opção:

- [ ] **Opção A: SonarCloud (Recomendado)**
  - [ ] Cadastrar em: https://sonarcloud.io/
  - [ ] Conectar repositório GitHub
  - [ ] Obter token de organização
  - [ ] Atualizar secret SONAR_HOST_URL para: `https://sonarcloud.io`
  - [ ] Atualizar secret SONAR_TOKEN com o novo token

- [ ] **Opção B: Túnel ngrok (Temporário)**
  - [ ] Instalar: `brew install ngrok` (macOS)
  - [ ] Executar: `ngrok http 9000`
  - [ ] Copiar URL (ex: `https://abc123.ngrok.io`)
  - [ ] Atualizar secret SONAR_HOST_URL

- [ ] **Opção C: Servidor Público**
  - [ ] Hospedar SonarQube em servidor com IP público
  - [ ] Configurar domínio e SSL
  - [ ] Atualizar secret SONAR_HOST_URL

- [ ] **Opção D: Apenas Local (Não usar GitHub Actions)**
  - [ ] Usar apenas `./test-sonar.sh` localmente
  - [ ] Não fazer push do workflow (remover `.github/workflows/main.yml`)

### 3. Testar Pipeline

- [ ] Fazer commit:
  ```bash
  git add .
  git commit -m "feat: adiciona integração com SonarQube"
  ```
- [ ] Fazer push:
  ```bash
  git push origin main
  ```
- [ ] Acessar: GitHub → Actions
- [ ] Verificar execução do workflow
- [ ] Aguardar conclusão dos 6 jobs:
  - [ ] build-backend
  - [ ] test-backend
  - [ ] build-frontend
  - [ ] test-frontend
  - [ ] sonar_analysis (Backend)
  - [ ] sonar_analysis (Frontend)
- [ ] Verificar se passou nos Quality Gates

---

## 🔍 Verificação de Sucesso

### No SonarQube

- [ ] Projeto `bartab-backend` aparece na lista
- [ ] Projeto `bartab-frontend` aparece na lista
- [ ] Cada projeto mostra:
  - [ ] Número de bugs
  - [ ] Número de vulnerabilidades
  - [ ] Número de code smells
  - [ ] Porcentagem de cobertura
  - [ ] Status do Quality Gate

### No GitHub Actions

- [ ] Workflow aparece em Actions
- [ ] Todos os jobs ficaram verdes ✅
- [ ] Não houve falhas nos Quality Gates
- [ ] Logs mostram análise concluída

---

## 📊 Ajustes de Quality Gate (Opcional)

Se o pipeline falhar devido ao Quality Gate:

- [ ] Acessar: http://localhost:9000 → Quality Gates
- [ ] Verificar quais condições falharam
- [ ] Opções:
  - [ ] **Opção A:** Corrigir código para passar nas condições
  - [ ] **Opção B:** Ajustar condições do Quality Gate (menos restritivo)
  - [ ] **Opção C:** Criar Quality Gate customizado

---

## 🎯 Resultados Esperados

Após completar todos os passos acima:

- [x] ✅ SonarQube analisa código a cada commit/PR
- [x] ✅ Dashboards mostram métricas em tempo real
- [x] ✅ Quality Gates validam qualidade automaticamente
- [x] ✅ Pipeline falha se código não passar nas validações
- [x] ✅ Cobertura de testes é rastreada
- [x] ✅ Bugs e vulnerabilidades são identificados

---

## 📁 Arquivos de Referência

Consulte para mais informações:

- [ ] **RESUMO_SONARQUBE.md** - Visão geral completa
- [ ] **SONARQUBE_SETUP.md** - Documentação detalhada
- [ ] **TESTE_SONARQUBE.md** - Guia de teste e troubleshooting
- [ ] **test-sonar.sh** - Script automatizado de teste

---

## 🆘 Problemas Comuns

### ❌ "sonar-scanner: command not found"
- [ ] Executar: `npm install -g sonarqube-scanner`

### ❌ "coverage/lcov.info not found"
- [ ] Backend: `cd backend && npm run test:cov`
- [ ] Frontend: `cd frontend && npm run test:coverage`

### ❌ "Unable to reach SonarQube server"
- [ ] Verificar se está rodando: `curl http://localhost:9000`
- [ ] Iniciar SonarQube se necessário

### ❌ Pipeline falha no GitHub: "Connection refused"
- [ ] Ver seção "Decidir sobre Acessibilidade" acima
- [ ] Usar SonarCloud, ngrok ou servidor público

### ❌ Quality Gate falhou
- [ ] Acessar dashboard no SonarQube
- [ ] Ver quais métricas falharam
- [ ] Corrigir código ou ajustar gate

---

## 🎉 Conclusão

Quando todos os itens estiverem marcados:

- [x] ✅ Configuração local testada e funcionando
- [x] ✅ GitHub Actions configurado (se aplicável)
- [x] ✅ Quality Gates validando código
- [x] ✅ Métricas sendo coletadas
- [x] ✅ Equipe pode visualizar dashboards

**🚀 Integração com SonarQube concluída com sucesso!**

---

## 📝 Notas Adicionais

### Para Desenvolvimento Diário

```bash
# Antes de fazer commit
./test-sonar.sh all

# Verificar dashboards
# Corrigir issues identificados
# Fazer commit/push
```

### Para Code Review

- [ ] Verificar dashboard SonarQube antes de aprovar PR
- [ ] Garantir que Quality Gate passou
- [ ] Revisar novos issues introduzidos

### Para Manutenção

- [ ] Revisar métricas semanalmente
- [ ] Ajustar Quality Gates conforme maturidade do projeto
- [ ] Acompanhar evolução da cobertura de testes
- [ ] Priorizar correção de vulnerabilidades

---

**Data da configuração:** 02/11/2025  
**Versão:** 1.0  
**Status:** ✅ Pronto para uso

