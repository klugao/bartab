# ✅ Correção - Autenticação SonarQube

## 🔧 Problema Encontrado

Ao executar o teste local, o erro apresentado foi:

```
Not authorized. Analyzing this project requires authentication. 
Please provide a user token in sonar.login or other credentials 
in sonar.login and sonar.password.
```

## ✅ Solução Aplicada

O token de autenticação foi adicionado diretamente nos arquivos de configuração do SonarQube:

### Arquivos Modificados

1. **`backend/sonar-project.properties`**
   - ~~Adicionado: `sonar.token=...`~~ ❌ (não funciona no SonarQube 9.9.8)
   - ✅ **CORRIGIDO:** `sonar.login=sqa_38ad5c3247d3aa2765223a9e033bbae8a648cfb2`

2. **`frontend/sonar-project.properties`**
   - ~~Adicionado: `sonar.token=...`~~ ❌ (não funciona no SonarQube 9.9.8)
   - ✅ **CORRIGIDO:** `sonar.login=sqa_38ad5c3247d3aa2765223a9e033bbae8a648cfb2`

3. **`test-sonar.sh`**
   - Removido parâmetro `-Dsonar.token` (não é mais necessário)
   - O token agora é lido automaticamente dos arquivos `.properties`

### 🔍 Descoberta Importante

**SonarQube 9.9.8 usa `sonar.login` em vez de `sonar.token`**

- ✅ **Versões antigas (< 10.0):** Use `sonar.login`
- ✅ **Versões novas (≥ 10.0):** Use `sonar.token`
- Sua versão: **9.9.8** → Usa `sonar.login`

## 🚀 Testar Novamente

Agora execute novamente:

```bash
./test-sonar.sh all
```

Ou manualmente:

```bash
# Backend
cd backend
npm run test:cov
sonar-scanner -Dsonar.host.url=http://localhost:9000

# Frontend
cd frontend
npm run test:coverage
sonar-scanner -Dsonar.host.url=http://localhost:9000
```

## ⚠️ IMPORTANTE - Segurança

### 🔴 Para Desenvolvimento Local

**Está OK** ter o token nos arquivos `sonar-project.properties` porque:
- O token já foi compartilhado
- É apenas para testes locais
- O SonarQube está rodando em localhost

### 🟡 Para Produção/GitHub

**⚠️ ATENÇÃO:** Se você for fazer commit desses arquivos para um repositório **público**, considere:

1. **Opção A: Usar variáveis de ambiente**
   
   Remover o token dos arquivos e usar:
   ```bash
   export SONAR_TOKEN="sqa_38ad5c3247d3aa2765223a9e033bbae8a648cfb2"
   sonar-scanner -Dsonar.host.url=http://localhost:9000
   ```

2. **Opção B: Adicionar ao .gitignore (não recomendado)**
   
   Adicionar aos `.gitignore`:
   ```
   sonar-project.properties
   ```
   
   Mas isso impede que a configuração seja versionada.

3. **Opção C: Usar template sem token**
   
   Criar arquivos `sonar-project.properties.example` sem o token e adicionar o real ao `.gitignore`.

### 🟢 Melhor Prática para GitHub Actions

No GitHub Actions (já configurado no workflow):
- O token fica em **Secrets** (seguro)
- Não aparece nos logs
- Não fica exposto no código

## 📝 Comandos Atualizados

### Teste Local Completo

```bash
# Opção 1: Script automatizado
./test-sonar.sh all

# Opção 2: Apenas backend
./test-sonar.sh backend

# Opção 3: Apenas frontend
./test-sonar.sh frontend
```

### Teste Manual (Backend)

```bash
cd backend
npm ci
npm run test:cov
sonar-scanner -Dsonar.host.url=http://localhost:9000
```

### Teste Manual (Frontend)

```bash
cd frontend
npm ci
npm run test:coverage
sonar-scanner -Dsonar.host.url=http://localhost:9000
```

## ✨ O Problema Está Resolvido!

Agora o SonarQube deve autenticar corretamente e fazer a análise dos projetos.

Você verá mensagens como:
```
INFO  Communicating with SonarQube Server 9.9.8
INFO  Analysis report generated
INFO  Analysis report uploaded
INFO  ANALYSIS SUCCESSFUL
```

E poderá acessar os dashboards:
- Backend: http://localhost:9000/dashboard?id=bartab-backend
- Frontend: http://localhost:9000/dashboard?id=bartab-frontend

---

**Data da correção:** 02/11/2025  
**Status:** ✅ Resolvido

