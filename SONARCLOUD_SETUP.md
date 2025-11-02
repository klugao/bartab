# 🚀 Configuração do SonarCloud para BarTab

## 📋 Visão Geral

Este guia mostra como configurar o SonarCloud (análise de qualidade de código na nuvem) para o projeto BarTab.

O SonarCloud é **gratuito** para projetos públicos e oferece:
- ✅ Análise automática de qualidade de código
- ✅ Detecção de bugs e vulnerabilidades
- ✅ Cobertura de testes
- ✅ Code smells e duplicações
- ✅ Integração com GitHub Actions (CI/CD)
- ✅ Comentários automáticos em Pull Requests

---

## 🔧 Passo 1: Criar Conta no SonarCloud

1. Acesse: **https://sonarcloud.io/**
2. Clique em **"Log in"**
3. Escolha **"Log in with GitHub"**
4. Autorize o SonarCloud a acessar sua conta do GitHub

---

## 📦 Passo 2: Importar o Repositório

### 2.1. Criar Organização (se necessário)

1. Após fazer login, clique em **"+"** no topo → **"Analyze new project"**
2. Se for sua primeira vez, você precisará criar uma organização:
   - Clique em **"Create an organization"**
   - Escolha **"Free plan"**
   - Selecione sua conta do GitHub
   - Dê um nome para a organização (ex: `seu-usuario-github`)
   - Clique em **"Continue"**

### 2.2. Importar o Projeto BarTab

1. Na tela **"Analyze projects"**, você verá seus repositórios do GitHub
2. Encontre o repositório **`bartab`**
3. Clique em **"Set Up"** ao lado dele
4. O SonarCloud vai criar automaticamente um projeto

### 2.3. Configurar Projects Keys

O SonarCloud vai criar **UM** projeto para o repositório. Como temos Backend e Frontend separados, precisamos criar dois projetos:

#### Backend:
1. No menu lateral, clique em **"Administration" → "Update Key"**
2. Mude o key para: **`bartab-backend`**
3. Salve

#### Frontend (criar projeto adicional):
1. Vá em **"+"** no topo → **"Analyze new project"**
2. Marque o repositório **`bartab`** novamente
3. Clique em **"Set Up"**
4. Mude o key para: **`bartab-frontend`**

---

## 🔑 Passo 3: Obter o Token do SonarCloud

1. No SonarCloud, clique no seu avatar (canto superior direito)
2. Vá em **"My Account"**
3. Clique na aba **"Security"**
4. Em **"Generate Tokens"**:
   - **Name:** `bartab-github-actions`
   - **Type:** `Global Analysis Token`
   - **Expires in:** `No expiration` (ou escolha um período)
5. Clique em **"Generate"**
6. **COPIE O TOKEN** (você não vai conseguir vê-lo novamente!)
   - Formato: `sqp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

---

## 🔐 Passo 4: Configurar Secrets no GitHub

1. Vá para o seu repositório no GitHub: **https://github.com/seu-usuario/bartab**
2. Clique em **"Settings"** (configurações do repositório)
3. No menu lateral, vá em **"Secrets and variables" → "Actions"**
4. Clique em **"New repository secret"**

### 4.1. Adicionar o Token do SonarCloud

- **Name:** `SONAR_TOKEN`
- **Value:** Cole o token que você copiou (ex: `sqp_xxxxx...`)
- Clique em **"Add secret"**

**PRONTO!** O `GITHUB_TOKEN` já é fornecido automaticamente pelo GitHub Actions.

---

## 🔧 Passo 5: Configurar a Organização nos Arquivos

Agora você precisa adicionar o nome da sua organização do SonarCloud nos arquivos de configuração.

### 5.1. Backend

Edite o arquivo **`backend/sonar-project.properties`**:

```properties
# Configuração do SonarCloud para o Backend (NestJS)
sonar.projectKey=bartab-backend
sonar.projectName=BarTab Backend
sonar.projectVersion=1.0

# Organização do SonarCloud
sonar.organization=SEU-USUARIO-GITHUB
# ⬆️ DESCOMENTE E TROQUE "SEU-USUARIO-GITHUB" pelo nome da sua organização

# ... resto do arquivo continua igual
```

### 5.2. Frontend

Edite o arquivo **`frontend/sonar-project.properties`**:

```properties
# Configuração do SonarCloud para o Frontend (React)
sonar.projectKey=bartab-frontend
sonar.projectName=BarTab Frontend
sonar.projectVersion=1.0

# Organização do SonarCloud
sonar.organization=SEU-USUARIO-GITHUB
# ⬆️ DESCOMENTE E TROQUE "SEU-USUARIO-GITHUB" pelo nome da sua organização

# ... resto do arquivo continua igual
```

**Onde encontrar o nome da organização?**
- No SonarCloud, vá em **"My Organizations"**
- O nome da organização aparece na URL: `https://sonarcloud.io/organizations/NOME-DA-ORG`

---

## 🚀 Passo 6: Commit e Push

Agora faça commit das alterações:

```bash
git add backend/sonar-project.properties frontend/sonar-project.properties .github/workflows/main.yml
git commit -m "feat: configurar SonarCloud para análise de código"
git push
```

---

## ✅ Passo 7: Verificar o Pipeline

1. Vá para o seu repositório no GitHub
2. Clique na aba **"Actions"**
3. Você verá o workflow **"CI/CD Pipeline - BarTab"** rodando
4. Aguarde a conclusão (pode demorar alguns minutos)

### Jobs que serão executados:
1. ✅ **Build Backend**
2. ✅ **Test Backend** (com cobertura)
3. ✅ **Build Frontend**
4. ✅ **Test Frontend** (com cobertura)
5. ✅ **SonarCloud Analysis** (Backend + Frontend)

---

## 📊 Passo 8: Ver Resultados no SonarCloud

Após o pipeline terminar:

1. Volte para **https://sonarcloud.io/**
2. Você verá dois projetos:
   - **BarTab Backend**
   - **BarTab Frontend**
3. Clique em cada um para ver:
   - 🐛 **Bugs**
   - 🔒 **Vulnerabilidades**
   - 🔍 **Code Smells**
   - 📊 **Cobertura de Código**
   - 📈 **Duplicações**
   - ⭐ **Classificação de Qualidade**

---

## 🎯 Recursos Extras

### Quality Gate nos Pull Requests

O SonarCloud vai automaticamente:
- ✅ Comentar nos seus PRs com análise de qualidade
- ✅ Bloquear merge se o Quality Gate falhar (configurável)
- ✅ Mostrar apenas os problemas nas linhas modificadas

### Badges para o README

Adicione badges ao seu README.md:

```markdown
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=bartab-backend&metric=alert_status)](https://sonarcloud.io/dashboard?id=bartab-backend)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=bartab-backend&metric=coverage)](https://sonarcloud.io/dashboard?id=bartab-backend)
```

### Configurar Quality Gate Personalizado

1. No SonarCloud, vá para o projeto
2. Clique em **"Quality Gates"**
3. Configure as métricas mínimas:
   - Cobertura de código > 80%
   - Bugs = 0
   - Vulnerabilidades = 0
   - Duplicações < 3%

---

## ❗ Troubleshooting

### Erro: "Organization not found"
- ✅ Verifique se você configurou `sonar.organization` corretamente nos arquivos `.properties`
- ✅ Confirme que o nome da organização está correto (case-sensitive)

### Erro: "Unauthorized"
- ✅ Verifique se o `SONAR_TOKEN` está configurado nos secrets do GitHub
- ✅ Gere um novo token no SonarCloud se necessário

### Análise não aparece no SonarCloud
- ✅ Verifique se o workflow completou sem erros no GitHub Actions
- ✅ Aguarde alguns minutos (a análise pode demorar)
- ✅ Verifique se os `projectKey` nos arquivos `.properties` correspondem aos projetos no SonarCloud

### Cobertura de código não aparece
- ✅ Confirme que os testes geraram `coverage/lcov.info`
- ✅ Verifique se os artifacts foram baixados corretamente no job de análise
- ✅ Execute localmente: `npm run test:cov` (backend) ou `npm run test:coverage` (frontend)

---

## 📚 Links Úteis

- 🌐 **SonarCloud:** https://sonarcloud.io/
- 📖 **Documentação:** https://docs.sonarcloud.io/
- 🔌 **GitHub Action:** https://github.com/SonarSource/sonarcloud-github-action
- 💬 **Comunidade:** https://community.sonarsource.com/

---

## 🎉 Conclusão

Agora você tem:
- ✅ Análise automática de código em cada push/PR
- ✅ Relatórios de qualidade no SonarCloud
- ✅ Cobertura de testes integrada
- ✅ Feedback automático em Pull Requests
- ✅ CI/CD completo com qualidade de código garantida

**Bom trabalho! 🚀**


