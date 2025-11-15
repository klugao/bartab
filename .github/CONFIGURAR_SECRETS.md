# Configuração de Secrets do GitHub para Deploy no GCP

Este documento explica como configurar os secrets necessários para o deploy automático no Google Cloud Platform (GCP) via GitHub Actions.

## ❗ Erro Comum

Se você está vendo este erro:

```
Error: google-github-actions/auth failed with: the GitHub Action workflow must specify exactly one of "workload_identity_provider" or "credentials_json"!
```

Significa que o secret `GCP_SA_KEY` não está configurado no seu repositório do GitHub.

## 📋 Secrets Necessários

Você precisa configurar os seguintes secrets no GitHub:

### 1. GCP_SA_KEY (Service Account Key) - OBRIGATÓRIO

Este é o JSON da service account do GCP que tem permissões para fazer deploy.

**Como obter:**

1. Acesse o [Google Cloud Console](https://console.cloud.google.com)
2. Selecione seu projeto BarTab
3. Vá em: **IAM & Admin > Service Accounts**
4. Encontre a service account `bartab-backend-sa` (ou crie uma nova)
5. Clique nos 3 pontos (⋮) e selecione **Manage keys**
6. Clique em **Add Key > Create new key**
7. Escolha o formato **JSON** e clique em **Create**
8. O arquivo JSON será baixado automaticamente

**Permissões necessárias para a Service Account:**

- Cloud Run Admin
- Storage Admin
- Service Account User
- Secret Manager Secret Accessor

### 2. GCP_PROJECT_ID - OBRIGATÓRIO

O ID do seu projeto no GCP (ex: `bartab-production`)

**Como obter:**

1. Acesse o [Google Cloud Console](https://console.cloud.google.com)
2. Na parte superior da página, você verá o **Project ID** ao lado do nome do projeto

## 🔧 Como Configurar os Secrets no GitHub

1. Acesse seu repositório no GitHub
2. Vá em: **Settings** (Configurações)
3. No menu lateral, clique em: **Secrets and variables > Actions**
4. Clique em **New repository secret**
5. Configure cada secret:

### Secret 1: GCP_SA_KEY

- **Name:** `GCP_SA_KEY`
- **Value:** Cole todo o conteúdo do arquivo JSON da service account (incluindo as chaves `{` e `}`)
- Clique em **Add secret**

Exemplo do formato do JSON:
```json
{
  "type": "service_account",
  "project_id": "seu-projeto-id",
  "private_key_id": "abc123...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "bartab-backend-sa@seu-projeto.iam.gserviceaccount.com",
  "client_id": "123456789",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/..."
}
```

### Secret 2: GCP_PROJECT_ID

- **Name:** `GCP_PROJECT_ID`
- **Value:** ID do seu projeto (ex: `bartab-production`)
- Clique em **Add secret**

## ✅ Verificar Configuração

Depois de configurar os secrets:

1. Faça um commit e push para a branch `main`
2. Vá em: **Actions** no GitHub
3. Verifique se o workflow está rodando sem o erro de autenticação
4. Se o erro persistir, verifique se:
   - O JSON do GCP_SA_KEY está completo e válido
   - A service account tem as permissões corretas
   - O GCP_PROJECT_ID está correto

## 🔐 Segurança

**IMPORTANTE:**
- Nunca compartilhe ou commite o arquivo JSON da service account no repositório
- Os secrets do GitHub são criptografados e seguros
- Apenas administradores do repositório podem ver/editar os secrets
- Os secrets não são expostos nos logs do GitHub Actions

## 📚 Outros Secrets Opcionais

Você também pode precisar configurar:

- `SONAR_TOKEN` - Para análise de código no SonarCloud
- Outros secrets específicos da sua aplicação

## 🆘 Problemas Comuns

### Erro: "Invalid credentials"
- Verifique se o JSON está completo e não foi truncado ao colar
- Certifique-se de que a service account não foi deletada no GCP
- Verifique se as permissões da service account estão corretas

### Erro: "Project not found"
- Confirme que o GCP_PROJECT_ID está correto
- Verifique se o projeto ainda existe no GCP
- Certifique-se de que a service account tem acesso ao projeto

### Erro: "Permission denied"
- A service account precisa das permissões listadas acima
- Adicione as roles necessárias em: IAM & Admin > IAM no GCP

## 📞 Suporte

Se continuar com problemas:

1. Verifique os logs detalhados em: Actions > [workflow] > [job específico]
2. Consulte a documentação: [Google Cloud GitHub Actions](https://github.com/google-github-actions/auth)
3. Verifique a configuração do Cloud Run e permissões no GCP

