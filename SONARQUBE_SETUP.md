# Configuração do SonarQube - BarTab

## 📋 Visão Geral

Este documento descreve a integração do SonarQube no projeto BarTab para análise contínua de qualidade de código.

## 🔧 Arquivos Criados/Modificados

### 1. Backend - `backend/sonar-project.properties`
Arquivo de configuração do SonarQube para o backend NestJS.

**Configurações principais:**
- **Project Key:** `bartab-backend`
- **Fontes:** `src/`
- **Cobertura:** `coverage/lcov.info` (gerado pelo Jest)
- **Exclusões:** node_modules, dist, testes, migrations, etc.

### 2. Frontend - `frontend/sonar-project.properties`
Arquivo de configuração do SonarQube para o frontend React.

**Configurações principais:**
- **Project Key:** `bartab-frontend`
- **Fontes:** `src/`
- **Cobertura:** `coverage/lcov.info` (gerado pelo Vitest)
- **Exclusões:** node_modules, dist, testes, configurações, etc.

### 3. Frontend - `frontend/vitest.config.ts` (atualizado)
Adicionado o reporter `lcov` para gerar relatório de cobertura no formato compatível com o SonarQube.

### 4. CI/CD - `.github/workflows/main.yml`
Pipeline completo do GitHub Actions com os seguintes jobs:

1. **build-backend:** Compila o backend
2. **test-backend:** Executa testes com cobertura
3. **build-frontend:** Compila o frontend
4. **test-frontend:** Executa testes com cobertura
5. **sonar_analysis:** Analisa ambos os projetos no SonarQube

## 🚀 Como Funciona o Pipeline

### Fluxo de Execução

```
build-backend → test-backend ↘
                              → sonar_analysis
build-frontend → test-frontend ↗
```

### Job de Análise SonarQube

O job `sonar_analysis` realiza as seguintes etapas:

1. **Download dos Relatórios de Cobertura**
   - Baixa os artifacts gerados pelos jobs de teste

2. **Scan do Backend**
   - Executa análise usando `sonarsource/sonarqube-scan-action@master`
   - Configurado via `backend/sonar-project.properties`

3. **Verificação do Quality Gate - Backend**
   - Aguarda resultado da análise (timeout: 5 minutos)
   - **FALHA se o Quality Gate não passar**

4. **Scan do Frontend**
   - Executa análise usando `sonarsource/sonarqube-scan-action@master`
   - Configurado via `frontend/sonar-project.properties`

5. **Verificação do Quality Gate - Frontend**
   - Aguarda resultado da análise (timeout: 5 minutos)
   - **FALHA se o Quality Gate não passar**

## 🔐 Configuração de Secrets no GitHub

Para o pipeline funcionar, você precisa configurar os seguintes secrets no GitHub:

### Passo a Passo:

1. Acesse: `Settings → Secrets and variables → Actions → New repository secret`

2. Adicione os secrets:

   **SONAR_TOKEN:**
   ```
   sqa_38ad5c3247d3aa2765223a9e033bbae8a648cfb2
   ```

   **SONAR_HOST_URL:**
   ```
   http://localhost:9000
   ```

   ⚠️ **ATENÇÃO:** Se o SonarQube estiver rodando em localhost, o GitHub Actions não conseguirá acessá-lo. Você precisará:
   - Usar um SonarQube hospedado publicamente, OU
   - Usar SonarCloud (https://sonarcloud.io/), OU
   - Expor seu SonarQube local via túnel (ngrok, localtunnel, etc.)

## 🧪 Testando Localmente

### Pré-requisitos

1. **SonarQube rodando:**
   ```bash
   # Verifique se está acessível
   curl http://localhost:9000
   ```

2. **SonarQube Scanner instalado:**
   ```bash
   npm install -g sonarqube-scanner
   ```

### Executar Análise Local

#### Backend

```bash
cd backend

# Executar testes com cobertura
npm run test:cov

# Executar análise SonarQube
sonar-scanner \
  -Dsonar.host.url=http://localhost:9000
```

#### Frontend

```bash
cd frontend

# Executar testes com cobertura
npm run test:coverage

# Executar análise SonarQube
sonar-scanner \
  -Dsonar.host.url=http://localhost:9000
```

## 📊 Visualizando Resultados

Após executar a análise, acesse:

- **Backend:** http://localhost:9000/dashboard?id=bartab-backend
- **Frontend:** http://localhost:9000/dashboard?id=bartab-frontend

## 🛠️ Personalização

### Ajustar Quality Gate

Para modificar as regras do Quality Gate:

1. Acesse o SonarQube: http://localhost:9000
2. Vá em `Quality Gates`
3. Edite ou crie um novo Quality Gate
4. Associe aos projetos `bartab-backend` e `bartab-frontend`

### Adicionar/Remover Exclusões

Edite os arquivos `sonar-project.properties` conforme necessário:

```properties
# Adicionar mais exclusões
sonar.exclusions=\
  **/node_modules/**,\
  **/dist/**,\
  **/seu-arquivo-ou-pasta/**
```

## ❗ Troubleshooting

### Problema: Pipeline falha no Quality Gate

**Solução:** Acesse o SonarQube e veja quais métricas falharam. Corrija o código conforme necessário.

### Problema: Cobertura de código não aparece

**Verificações:**
1. Certifique-se que os testes geraram o arquivo `coverage/lcov.info`
2. Verifique se o caminho em `sonar.javascript.lcov.reportPaths` está correto
3. No backend: execute `npm run test:cov` e verifique se `backend/coverage/lcov.info` existe
4. No frontend: execute `npm run test:coverage` e verifique se `frontend/coverage/lcov.info` existe

### Problema: SonarQube não está acessível no GitHub Actions

**Solução:** O SonarQube precisa estar publicamente acessível. Considere:
- Usar SonarCloud (gratuito para projetos open source)
- Hospedar SonarQube em um servidor com IP público
- Usar um túnel (ngrok) temporariamente para testes

## 📝 Comandos Úteis

```bash
# Gerar cobertura do backend
cd backend && npm run test:cov

# Gerar cobertura do frontend
cd frontend && npm run test:coverage

# Limpar relatórios anteriores
rm -rf backend/coverage frontend/coverage
rm -rf backend/.scannerwork frontend/.scannerwork

# Executar análise completa (backend + frontend)
cd backend && npm run test:cov && cd ..
cd frontend && npm run test:coverage && cd ..
sonar-scanner -Dsonar.projectBaseDir=backend
sonar-scanner -Dsonar.projectBaseDir=frontend
```

## 🎯 Próximos Passos

1. ✅ Configurar secrets no GitHub
2. ✅ Fazer um commit e push para disparar o pipeline
3. ✅ Monitorar execução no GitHub Actions
4. ✅ Visualizar resultados no SonarQube
5. ✅ Ajustar Quality Gates conforme necessário
6. ✅ Corrigir problemas identificados pelo SonarQube

## 📚 Referências

- [SonarQube Documentation](https://docs.sonarqube.org/latest/)
- [SonarQube GitHub Action](https://github.com/SonarSource/sonarqube-scan-action)
- [Quality Gate Action](https://github.com/SonarSource/sonarqube-quality-gate-action)
- [SonarCloud](https://sonarcloud.io/) (alternativa hospedada)

