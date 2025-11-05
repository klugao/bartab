# ⚡ Correção Rápida - Erro SONAR_TOKEN

## 🔴 Erro
```
Set the SONAR_TOKEN env variable.
```

## ✅ Checklist de Verificação

### 1️⃣ Secret no GitHub (CRÍTICO)
- [ ] Acesse: https://github.com/SEU-USUARIO/bartab/settings/secrets/actions
- [ ] Verifique se existe o secret `SONAR_TOKEN`
- [ ] Se não existir, crie um novo:
  1. Vá em https://sonarcloud.io/ → Avatar → My Account → Security
  2. Gere um novo token (User Token, sem expiração)
  3. Copie o token
  4. Adicione no GitHub como secret `SONAR_TOKEN`

### 2️⃣ Organização nos Arquivos (CRÍTICO)
- [ ] Edite `backend/sonar-project.properties`
- [ ] Edite `frontend/sonar-project.properties`
- [ ] Descomente a linha `sonar.organization` em ambos
- [ ] Substitua pelo nome da sua organização do SonarCloud

**Encontrar o nome da organização:**
- Acesse https://sonarcloud.io/
- Clique em "My Organizations"
- O nome aparece na URL: `sonarcloud.io/organizations/NOME-AQUI`

### 3️⃣ Projetos no SonarCloud (IMPORTANTE)
- [ ] Acesse https://sonarcloud.io/projects
- [ ] Verifique se existem os projetos:
  - `bartab-backend` (ou similar)
  - `bartab-frontend` (ou similar)
- [ ] Se não existirem, crie-os:
  1. Clique em "+" → "Analyze new project"
  2. Selecione o repositório `bartab`
  3. Configure os project keys

## 🚀 Comandos Rápidos

### Para verificar os arquivos atuais:
```bash
echo "=== Backend ==="
cat backend/sonar-project.properties | grep -E "projectKey|organization"

echo "=== Frontend ==="
cat frontend/sonar-project.properties | grep -E "projectKey|organization"
```

### Para descomentar e configurar a organização:
```bash
# Substitua SEU-ORG-AQUI pelo nome da sua organização

# Backend
sed -i.bak 's/# sonar.organization=.*/sonar.organization=SEU-ORG-AQUI/' backend/sonar-project.properties

# Frontend
sed -i.bak 's/# sonar.organization=.*/sonar.organization=SEU-ORG-AQUI/' frontend/sonar-project.properties
```

### Para fazer commit das mudanças:
```bash
git add backend/sonar-project.properties frontend/sonar-project.properties
git commit -m "chore: configurar organização do SonarCloud"
git push
```

## 🎯 Ordem de Execução

1. **PRIMEIRO**: Configure o secret `SONAR_TOKEN` no GitHub
2. **SEGUNDO**: Configure a organização nos arquivos `.properties`
3. **TERCEIRO**: Faça commit e push
4. **QUARTO**: Aguarde o GitHub Actions executar

## 📝 Exemplo de Configuração

**Arquivo:** `backend/sonar-project.properties`
```properties
sonar.projectKey=bartab-backend
sonar.projectName=BarTab Backend
sonar.projectVersion=1.0

# Organização do SonarCloud
sonar.organization=meu-usuario-github  # ← DESCOMENTE E CONFIGURE
```

**Arquivo:** `frontend/sonar-project.properties`
```properties
sonar.projectKey=bartab-frontend
sonar.projectName=BarTab Frontend
sonar.projectVersion=1.0

# Organização do SonarCloud
sonar.organization=meu-usuario-github  # ← DESCOMENTE E CONFIGURE
```

## 🔍 Verificação Final

Após fazer as mudanças:

1. Vá para: https://github.com/SEU-USUARIO/bartab/actions
2. Aguarde o workflow executar
3. Se der erro, clique no job "SonarCloud Analysis"
4. Verifique os logs para identificar o problema

## ❌ Erros Comuns

### "Project not found"
➡️ O `sonar.projectKey` não corresponde ao projeto no SonarCloud
➡️ Crie o projeto no SonarCloud ou ajuste o key

### "Organization not found"
➡️ O nome da organização está errado
➡️ Verifique em https://sonarcloud.io/organizations

### "Invalid token"
➡️ O token está errado ou expirou
➡️ Gere um novo token no SonarCloud

## 📚 Guias Completos

Para mais detalhes, consulte:
- `SONARCLOUD_SETUP.md` - Guia completo passo a passo
- `CORRECAO_SONARCLOUD_TOKEN.md` - Guia detalhado de correção

