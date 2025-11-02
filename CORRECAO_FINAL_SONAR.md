# 🔧 Correção Final - Autenticação SonarQube

## ❌ Problema Identificado

Seu SonarQube é **versão 9.9.8**, que usa um parâmetro diferente para autenticação.

### Erro Apresentado:
```
Not authorized. Analyzing this project requires authentication. 
Please provide a user token in sonar.login or other credentials 
in sonar.login and sonar.password.
```

## 🔍 Causa Raiz

A diferença entre versões do SonarQube:

| Versão SonarQube | Parâmetro de Autenticação | Status |
|------------------|---------------------------|--------|
| **< 10.0** (9.9.8) | `sonar.login` | ✅ Seu caso |
| **≥ 10.0** | `sonar.token` | ❌ Não aplicável |

Eu havia configurado `sonar.token`, mas sua versão **9.9.8** requer `sonar.login`.

## ✅ Correção Aplicada

### 1. Backend - `backend/sonar-project.properties`

**ANTES (não funcionava):**
```properties
sonar.token=sqa_38ad5c3247d3aa2765223a9e033bbae8a648cfb2
```

**DEPOIS (corrigido):**
```properties
sonar.login=sqa_38ad5c3247d3aa2765223a9e033bbae8a648cfb2
```

### 2. Frontend - `frontend/sonar-project.properties`

**ANTES (não funcionava):**
```properties
sonar.token=sqa_38ad5c3247d3aa2765223a9e033bbae8a648cfb2
```

**DEPOIS (corrigido):**
```properties
sonar.login=sqa_38ad5c3247d3aa2765223a9e033bbae8a648cfb2
```

## 🚀 TESTE AGORA!

### Opção 1: Script Automatizado (Recomendado)

```bash
./test-sonar.sh all
```

### Opção 2: Manual - Backend

```bash
cd backend
npm run test:cov
sonar-scanner -Dsonar.host.url=http://localhost:9000
cd ..
```

### Opção 3: Manual - Frontend

```bash
cd frontend
npm run test:coverage
sonar-scanner -Dsonar.host.url=http://localhost:9000
cd ..
```

## ✨ Resultado Esperado

Você deve ver algo como:

```
✓ Cobertura gerada com sucesso
→ Executando análise SonarQube...
[INFO]  Communicating with SonarQube Server 9.9.8
13:XX:XX INFO  Load global settings
13:XX:XX INFO  Load project settings
13:XX:XX INFO  Load quality profiles
13:XX:XX INFO  Load active rules
13:XX:XX INFO  Indexing files...
13:XX:XX INFO  XX files indexed
13:XX:XX INFO  Analysis report generated
13:XX:XX INFO  Analysis report uploaded
13:XX:XX INFO  ANALYSIS SUCCESSFUL
```

E poderá acessar:
- **Backend:** http://localhost:9000/dashboard?id=bartab-backend
- **Frontend:** http://localhost:9000/dashboard?id=bartab-frontend

## 📊 O Que Você Verá no SonarQube

### Backend (NestJS)
- **Cobertura:** ~34% (conforme o relatório de testes)
- **51 testes** passando
- **Métricas:** Bugs, vulnerabilidades, code smells
- **Quality Gate:** Status (Passed/Failed)

### Frontend (React)
- **Cobertura:** Será calculada pelo SonarQube
- **Métricas:** Bugs, vulnerabilidades, code smells
- **Quality Gate:** Status (Passed/Failed)

## 🔐 GitHub Actions

O workflow do GitHub Actions já está configurado corretamente:

- A action `sonarsource/sonarqube-scan-action@master` detecta automaticamente a versão do SonarQube
- Converte `SONAR_TOKEN` para `sonar.login` (versões antigas) ou `sonar.token` (versões novas)
- **Nenhuma alteração necessária!** ✅

## 📝 Resumo das Mudanças

| Arquivo | Alteração | Status |
|---------|-----------|--------|
| `backend/sonar-project.properties` | `sonar.token` → `sonar.login` | ✅ |
| `frontend/sonar-project.properties` | `sonar.token` → `sonar.login` | ✅ |
| `.github/workflows/main.yml` | Comentário explicativo adicionado | ✅ |
| `test-sonar.sh` | Nenhuma alteração necessária | ✅ |

## ⚠️ Importante para o Futuro

Se você **atualizar o SonarQube para versão 10.0+**, precisará:

1. Trocar `sonar.login` por `sonar.token` nos arquivos `.properties`
2. O restante continua funcionando

Mas **para SonarQube 9.9.8, use `sonar.login`** ✅

## 🎯 Comandos Úteis

```bash
# Ver versão do SonarQube
curl http://localhost:9000/api/system/status

# Limpar análises antigas
rm -rf backend/.scannerwork frontend/.scannerwork

# Limpar cobertura
rm -rf backend/coverage frontend/coverage

# Teste completo
./test-sonar.sh all
```

## 🆘 Se Ainda Não Funcionar

Execute com modo debug:

```bash
cd backend
sonar-scanner \
  -Dsonar.host.url=http://localhost:9000 \
  -X
```

Isso mostrará logs detalhados do que está acontecendo.

## ✅ Checklist de Verificação

Antes de executar, certifique-se:

- [ ] SonarQube está rodando: `curl http://localhost:9000`
- [ ] Token está correto: `sqa_38ad5c3247d3aa2765223a9e033bbae8a648cfb2`
- [ ] Arquivos foram salvos com as alterações
- [ ] Versão do SonarQube: **9.9.8**
- [ ] Parâmetro usado: `sonar.login` (não `sonar.token`)

## 🎉 Está Pronto!

Agora **SIM** deve funcionar! Execute:

```bash
./test-sonar.sh all
```

E aguarde o resultado! 🚀

---

**Data:** 02/11/2025  
**Versão SonarQube:** 9.9.8  
**Parâmetro:** `sonar.login`  
**Status:** ✅ **PRONTO PARA TESTAR**

