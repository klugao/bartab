# Correção do Erro SONAR_TOKEN - SonarCloud

## Problema
O job do SonarCloud está falando com erro: `Set the SONAR_TOKEN env variable.`

## Causa
O secret `SONAR_TOKEN` não está configurado no repositório do GitHub, ou a organização do SonarCloud não está configurada nos arquivos `sonar-project.properties`.

## Solução

### Passo 1: Criar/Obter o Token do SonarCloud

1. Acesse https://sonarcloud.io/
2. Faça login com sua conta GitHub
3. Clique no seu avatar (canto superior direito) → **My Account**
4. Vá em **Security** (no menu lateral)
5. Na seção **Generate Tokens**:
   - **Name**: Digite um nome como "bartab-github-actions"
   - **Type**: Selecione **User Token** ou **Project Analysis Token**
   - **Expiration**: Escolha **No expiration** (ou a data que preferir)
   - Clique em **Generate**
6. **COPIE O TOKEN GERADO** (você não poderá vê-lo novamente!)

### Passo 2: Criar o Projeto no SonarCloud (se ainda não existe)

#### Para o Backend:
1. No SonarCloud, clique em **+** → **Analyze new project**
2. Selecione seu repositório **bartab**
3. Configure o projeto:
   - **Project Key**: `bartab-backend` (ou conforme configurado)
   - **Display Name**: `BarTab Backend`
4. Clique em **Set Up**
5. Selecione **GitHub Actions**
6. **Anote sua organização** (aparece na URL: `sonarcloud.io/organizations/SUA-ORG`)

#### Para o Frontend:
1. Repita o processo acima
2. Configure:
   - **Project Key**: `bartab-frontend`
   - **Display Name**: `BarTab Frontend`

### Passo 3: Configurar o Secret no GitHub

1. Acesse seu repositório no GitHub: https://github.com/SEU-USUARIO/bartab
2. Vá em **Settings** (aba do repositório)
3. No menu lateral, clique em **Secrets and variables** → **Actions**
4. Clique em **New repository secret**
5. Configure:
   - **Name**: `SONAR_TOKEN`
   - **Secret**: Cole o token que você copiou no Passo 1
6. Clique em **Add secret**

### Passo 4: Atualizar os Arquivos de Configuração

Você precisa descomentar e configurar a organização nos arquivos:
- `backend/sonar-project.properties`
- `frontend/sonar-project.properties`

**Exemplo para backend:**
```properties
sonar.organization=seu-usuario-github
```

**Exemplo para frontend:**
```properties
sonar.organization=seu-usuario-github
```

Substitua `seu-usuario-github` pela organização que você anotou no Passo 2.

### Passo 5: Atualizar os Project Keys (se necessário)

No SonarCloud, os project keys devem ser únicos. Se você criar os projetos manualmente, eles podem ter um prefixo com sua organização.

**Opção 1: Project Keys Simples**
Se o SonarCloud aceitar, use:
- `bartab-backend`
- `bartab-frontend`

**Opção 2: Project Keys com Organização**
Se necessário, use o formato:
- `sua-org_bartab-backend`
- `sua-org_bartab-frontend`

Neste caso, você precisa atualizar os arquivos `sonar-project.properties`:

```properties
# backend/sonar-project.properties
sonar.projectKey=sua-org_bartab-backend

# frontend/sonar-project.properties
sonar.projectKey=sua-org_bartab-frontend
```

### Passo 6: Verificar a Configuração

Após fazer as alterações, faça commit e push:

```bash
git add backend/sonar-project.properties frontend/sonar-project.properties
git commit -m "chore: configurar organização do SonarCloud"
git push
```

O GitHub Actions será executado automaticamente e o SonarCloud deverá funcionar.

## Verificação Rápida

Para verificar se o secret foi configurado corretamente:

1. Acesse seu repositório no GitHub
2. Vá em **Settings** → **Secrets and variables** → **Actions**
3. Você deve ver `SONAR_TOKEN` listado

Para verificar se a organização está correta:

1. Acesse https://sonarcloud.io/
2. Vá em **My Projects**
3. Verifique se os projetos `BarTab Backend` e `BarTab Frontend` aparecem
4. Clique em cada um e verifique o Project Key na URL

## Troubleshooting

### Erro: "Project not found"
- Verifique se o `sonar.projectKey` nos arquivos `.properties` corresponde ao Project Key no SonarCloud
- Verifique se a `sonar.organization` está configurada corretamente

### Erro: "Invalid token"
- O token pode ter expirado
- Gere um novo token e atualize o secret no GitHub

### Erro: "You're not authorized to run analysis"
- Verifique se você tem permissões de **Execute Analysis** no projeto do SonarCloud
- Vá em **Project Settings** → **Permissions** e verifique

## Referências

- [SonarCloud Documentation](https://docs.sonarcloud.io/)
- [GitHub Actions Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [SonarCloud GitHub Action](https://github.com/SonarSource/sonarcloud-github-action)

