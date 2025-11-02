# 🚀 Teste Rápido - SonarQube

## ✅ Arquivos Criados/Modificados

- ✅ `backend/sonar-project.properties` - Configuração do SonarQube para o backend
- ✅ `frontend/sonar-project.properties` - Configuração do SonarQube para o frontend
- ✅ `frontend/vitest.config.ts` - Adicionado reporter 'lcov' para cobertura
- ✅ `.github/workflows/main.yml` - Pipeline CI/CD com análise SonarQube
- ✅ `backend/.gitignore` - Adicionado exclusões do SonarQube
- ✅ `frontend/.gitignore` - Adicionado exclusões do SonarQube

## 🧪 Teste Local Rápido

### 1. Verificar se o SonarQube está rodando

```bash
curl http://localhost:9000
```

Se retornar HTML, está funcionando! ✅

### 2. Instalar o SonarQube Scanner (se necessário)

```bash
npm install -g sonarqube-scanner
```

### 3. Testar Backend

```bash
cd backend

# Gerar cobertura de código
npm run test:cov

# Verificar se o relatório foi gerado
ls -la coverage/lcov.info

# Executar análise SonarQube
sonar-scanner \
  -Dsonar.host.url=http://localhost:9000

# Acessar resultados
echo "✅ Acesse: http://localhost:9000/dashboard?id=bartab-backend"
```

### 4. Testar Frontend

```bash
cd frontend

# Gerar cobertura de código
npm run test:coverage

# Verificar se o relatório foi gerado
ls -la coverage/lcov.info

# Executar análise SonarQube
sonar-scanner \
  -Dsonar.host.url=http://localhost:9000

# Acessar resultados
echo "✅ Acesse: http://localhost:9000/dashboard?id=bartab-frontend"
```

## 🔐 Configurar GitHub Secrets

Para o pipeline funcionar no GitHub Actions:

1. Vá em: **Settings → Secrets and variables → Actions**
2. Clique em: **New repository secret**
3. Adicione os seguintes secrets:

   **Nome:** `SONAR_TOKEN`  
   **Valor:** `sqa_38ad5c3247d3aa2765223a9e033bbae8a648cfb2`

   **Nome:** `SONAR_HOST_URL`  
   **Valor:** `http://localhost:9000` (ou URL pública se tiver)

⚠️ **IMPORTANTE:** Se o SonarQube estiver em localhost, o GitHub Actions não conseguirá acessar. Neste caso, você tem 3 opções:

1. **Usar SonarCloud** (recomendado para projetos open source)
   - Cadastre-se em: https://sonarcloud.io/
   - É gratuito para repositórios públicos
   - URL seria: `https://sonarcloud.io`

2. **Expor temporariamente via túnel** (para testes)
   ```bash
   # Instalar ngrok
   brew install ngrok  # macOS
   # ou baixar de: https://ngrok.com/download
   
   # Expor porta 9000
   ngrok http 9000
   
   # Use a URL fornecida (ex: https://abc123.ngrok.io) como SONAR_HOST_URL
   ```

3. **Hospedar SonarQube em servidor com IP público**

## 🎯 Testar o Pipeline

Após configurar os secrets:

```bash
# Fazer commit das alterações
git add .
git commit -m "feat: adiciona integração com SonarQube"

# Push para disparar o pipeline
git push origin main
```

Acompanhe em: **GitHub → Actions**

## 📊 Resultados Esperados

### No SonarQube (http://localhost:9000)

Você verá 2 projetos:
- **bartab-backend**
- **bartab-frontend**

Cada um mostrará:
- ✅ **Bugs** detectados
- ✅ **Vulnerabilidades** de segurança
- ✅ **Code Smells** (problemas de qualidade)
- ✅ **Cobertura de código** (%)
- ✅ **Duplicações** de código
- ✅ **Quality Gate** (passou ou falhou)

### No GitHub Actions

O pipeline executará 6 jobs:
1. ✅ build-backend
2. ✅ test-backend
3. ✅ build-frontend
4. ✅ test-frontend
5. ✅ sonar_analysis
6. ✅ Verificação dos Quality Gates

Se algum Quality Gate falhar, o pipeline inteiro falhará! 🚨

## 🛠️ Comandos Úteis

```bash
# Limpar tudo e começar do zero
rm -rf backend/coverage backend/.scannerwork
rm -rf frontend/coverage frontend/.scannerwork

# Executar análise completa (ambos os projetos)
(cd backend && npm run test:cov && sonar-scanner -Dsonar.host.url=http://localhost:9000 -Dsonar.token=sqa_38ad5c3247d3aa2765223a9e033bbae8a648cfb2)
(cd frontend && npm run test:coverage && sonar-scanner -Dsonar.host.url=http://localhost:9000 -Dsonar.token=sqa_38ad5c3247d3aa2765223a9e033bbae8a648cfb2)

# Ver logs do SonarQube (se rodando via Docker)
docker logs -f sonarqube

# Parar/iniciar SonarQube (se rodando via Docker)
docker stop sonarqube
docker start sonarqube
```

## ❓ Troubleshooting

### ❌ Erro: "sonar-scanner: command not found"

**Solução:**
```bash
npm install -g sonarqube-scanner
```

### ❌ Erro: "coverage/lcov.info not found"

**Solução Backend:**
```bash
cd backend
npm run test:cov
ls -la coverage/lcov.info  # Deve existir
```

**Solução Frontend:**
```bash
cd frontend
npm run test:coverage
ls -la coverage/lcov.info  # Deve existir
```

### ❌ Erro: "Unable to reach SonarQube server"

**Verificar se está rodando:**
```bash
curl http://localhost:9000
```

**Se não estiver rodando:**
```bash
# Docker
docker start sonarqube

# Ou iniciar manualmente conforme sua instalação
```

### ❌ Pipeline falha no GitHub Actions: "Connection refused"

O SonarQube em localhost não é acessível pelo GitHub. Use:
- SonarCloud (recomendado)
- Túnel ngrok (temporário)
- Servidor público

## 📚 Próximos Passos

1. ✅ Testar localmente (este arquivo)
2. ✅ Configurar secrets no GitHub
3. ✅ Fazer push e acompanhar pipeline
4. ✅ Ajustar Quality Gates conforme necessário
5. ✅ Corrigir problemas identificados

## 🎉 Sucesso!

Se tudo funcionou:
- ✅ Você verá os dashboards no SonarQube
- ✅ O pipeline estará verde no GitHub Actions
- ✅ Cada commit novo será analisado automaticamente

Consulte `SONARQUBE_SETUP.md` para documentação completa.

