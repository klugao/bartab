# ⚡ Início Rápido - Deploy no GCP

Guia rápido para fazer o primeiro deploy do BarTab no GCP em **menos de 30 minutos**.

## 🎯 O que você vai fazer

1. ✅ Configurar conta GCP (5 min)
2. ✅ Executar setup automatizado (10 min)
3. ✅ Fazer deploy (15 min)
4. ✅ Testar aplicação (5 min)

**Total: ~35 minutos**

## 📋 Pré-requisitos

- Conta Google
- Cartão de crédito (para billing do GCP)
- Terminal com bash
- Docker instalado

## 🚀 Passo 1: Setup do GCP (5 min)

### 1.1 Criar Conta

1. Acesse: https://cloud.google.com
2. Clique em "Começar gratuitamente"
3. Siga as instruções (você ganha $300 de créditos grátis!)

### 1.2 Criar Projeto

1. Vá em: https://console.cloud.google.com
2. Clique em "Selecionar projeto" → "Novo projeto"
3. Nome: `bartab-production` (ou outro nome)
4. Anote o **Project ID** (você vai precisar)

### 1.3 Habilitar Billing

1. No menu, vá em "Billing"
2. Associe um método de pagamento
3. Vincule ao projeto `bartab-production`

### 1.4 Instalar gcloud CLI

```bash
# macOS
brew install google-cloud-sdk

# Linux
curl https://sdk.cloud.google.com | bash
exec -l $SHELL

# Windows
# Baixe de: https://cloud.google.com/sdk/docs/install
```

### 1.5 Autenticar

```bash
# Login
gcloud auth login

# Configurar projeto
gcloud config set project SEU_PROJECT_ID

# Configurar Docker
gcloud auth configure-docker
```

## ⚡ Passo 2: Setup Automatizado (10 min)

```bash
# Vá para o diretório do projeto
cd /Users/eduardoklug/Documents/bartab

# Execute o setup
cd gcp/scripts
./setup-gcp.sh
```

Quando solicitado:
- Digite seu **Project ID**
- Aguarde a habilitação das APIs

**O script vai:**
- ✅ Habilitar todas as APIs necessárias
- ✅ Criar Service Account
- ✅ Criar secrets vazios no Secret Manager
- ✅ Configurar permissões

## 🔐 Passo 3: Configurar Secrets (5 min)

```bash
./update-secrets.sh
```

### Valores necessários:

#### DATABASE_URL
Por enquanto, use um placeholder. Vamos criar o banco depois:
```
postgresql://placeholder
```

#### JWT_SECRET
Gere um novo:
```bash
openssl rand -base64 32
```
Cole o resultado.

#### Google OAuth (Opcional por enquanto)
Você pode configurar depois. Use placeholders:
```
GOOGLE_CLIENT_ID: placeholder
GOOGLE_CLIENT_SECRET: placeholder
```

#### SMTP (Opcional por enquanto)
Você pode configurar depois. Use placeholders:
```
SMTP_USER: placeholder
SMTP_PASS: placeholder
```

## 🗄️ Passo 4: Criar Banco de Dados (5 min)

### Opção A: Via Terraform (Recomendado)

```bash
cd ../terraform

# Copiar exemplo
cp terraform.tfvars.example terraform.tfvars

# Editar (apenas os campos obrigatórios)
nano terraform.tfvars

# Adicionar:
project_id = "seu-project-id"
db_password = "senha-forte-aqui"
# Deixe os outros como placeholder por enquanto

# Criar infraestrutura
terraform init
terraform apply
```

### Opção B: Via Console (Mais rápido)

1. Vá em: https://console.cloud.google.com/sql
2. Clique em "Criar instância"
3. Escolha "PostgreSQL"
4. Configurações:
   - **Instance ID**: `bartab-postgres`
   - **Password**: escolha uma senha forte
   - **Database version**: PostgreSQL 16
   - **Region**: `us-central1`
   - **Preset**: Escolha "Development" (mais barato)
5. Clique em "Criar"
6. Aguarde 5-10 minutos

### 4.1 Criar Database e Usuário

```bash
# Criar database
gcloud sql databases create bartab_production \
    --instance=bartab-postgres

# Criar usuário (se não criou no console)
gcloud sql users create bartab \
    --instance=bartab-postgres \
    --password=SUA_SENHA_FORTE
```

### 4.2 Atualizar DATABASE_URL

```bash
# Obter connection name
CONNECTION_NAME=$(gcloud sql instances describe bartab-postgres --format="value(connectionName)")

# Construir URL
echo "postgresql://bartab:SUA_SENHA@/bartab_production?host=/cloudsql/$CONNECTION_NAME"

# Atualizar secret
echo "postgresql://bartab:SUA_SENHA@/bartab_production?host=/cloudsql/$CONNECTION_NAME" | \
gcloud secrets versions add bartab-database-url --data-file=-
```

## 🚀 Passo 5: Deploy! (10-15 min)

```bash
cd ../scripts

# Deploy completo
./deploy.sh
```

Escolha **opção 1** (Deploy completo)

O script vai:
1. ✅ Build da imagem Docker do backend (~5 min)
2. ✅ Push para Container Registry (~2 min)
3. ✅ Deploy no Cloud Run (~2 min)
4. ✅ Build da imagem Docker do frontend (~5 min)
5. ✅ Push para Container Registry (~2 min)
6. ✅ Deploy no Cloud Run (~2 min)

**No final, você receberá as URLs:**
```
Backend: https://bartab-backend-XXXXX-uc.a.run.app
Frontend: https://bartab-frontend-XXXXX-uc.a.run.app
```

## ✅ Passo 6: Testar (5 min)

### 6.1 Testar Backend

```bash
# Health check
curl https://bartab-backend-XXXXX-uc.a.run.app/api/health

# Deve retornar: {"status":"ok"}
```

### 6.2 Testar Frontend

```bash
# Abrir no navegador
open https://bartab-frontend-XXXXX-uc.a.run.app
```

### 6.3 Ver Status

```bash
./status.sh
```

Deve mostrar:
- ✅ Backend: ONLINE
- ✅ Frontend: ONLINE
- ✅ Database: ONLINE

### 6.4 Ver Logs

```bash
./logs.sh
```

Escolha backend ou frontend para ver logs em tempo real.

## 🎉 Pronto!

Sua aplicação está rodando no GCP! 

### Próximos Passos

1. **Configurar Google OAuth**
   - Criar credenciais OAuth no [Console](https://console.cloud.google.com/apis/credentials)
   - Atualizar secrets com `./update-secrets.sh`

2. **Configurar SMTP**
   - Usar Gmail ou outro provedor
   - Atualizar secrets

3. **Adicionar domínio customizado**
   - Configurar Cloud Load Balancer
   - Apontar DNS

4. **Migrar dados** (se vindo do Supabase)
   - Usar `./migrate-database.sh`

5. **Monitoramento**
   - Configurar alertas no Cloud Monitoring

## 💰 Quanto vai custar?

Com a configuração padrão e **baixo tráfego**:

- Cloud Run (Backend): ~$10/mês
- Cloud Run (Frontend): ~$5/mês
- Cloud SQL (db-f1-micro): ~$7/mês
- **Total: ~$22/mês**

**Primeiros 90 dias**: Você tem $300 de créditos grátis!

## 🆘 Problemas?

### Erro: "Permission Denied"

```bash
gcloud auth login
gcloud config set project SEU_PROJECT_ID
```

### Erro: "API not enabled"

```bash
./setup-gcp.sh
```

### Backend não inicia

```bash
# Ver logs
./logs.sh

# Verificar secrets
gcloud secrets versions access latest --secret=bartab-database-url
```

### Outros problemas

1. Verifique o [Troubleshooting](../README.md#troubleshooting)
2. Veja os logs: `./logs.sh`
3. Verifique status: `./status.sh`

## 📚 Documentação Completa

- [README Principal](../README.md) - Visão geral completa
- [Guia de Migração](./MIGRATION.md) - Migração do Render/Supabase
- [Análise de Custos](./COSTS.md) - Detalhes sobre custos

---

**🎉 Parabéns! Seu BarTab está no GCP!**

Próximo: Configure OAuth e SMTP para funcionalidade completa.

