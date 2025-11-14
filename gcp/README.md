# 🚀 Migração BarTab para Google Cloud Platform (GCP)

Guia completo para migrar o BarTab do Render/Supabase para o Google Cloud Platform.

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Arquitetura no GCP](#arquitetura-no-gcp)
- [Monitoramento](#monitoramento-gratuito) ⭐ **NOVO**
- [Pré-requisitos](#pré-requisitos)
- [Passo a Passo](#passo-a-passo)
- [Estrutura de Arquivos](#estrutura-de-arquivos)
- [Scripts Disponíveis](#scripts-disponíveis)
- [Custos Estimados](#custos-estimados)
- [Manutenção](#manutenção)
- [Troubleshooting](#troubleshooting)

## 🎯 Visão Geral

Esta migração move toda a infraestrutura do BarTab para o GCP, utilizando:

- **Cloud Run**: Para backend (NestJS) e frontend (React)
- **Cloud SQL**: PostgreSQL gerenciado
- **Secret Manager**: Gerenciamento seguro de secrets
- **Cloud Build**: CI/CD automatizado
- **Container Registry**: Armazenamento de imagens Docker

### Vantagens da Migração

✅ **Escalabilidade automática** - Cloud Run escala de 0 a N instâncias  
✅ **Pay-per-use** - Paga apenas pelo que usar  
✅ **Integração nativa** - Todos os serviços GCP integrados  
✅ **Backups automáticos** - Cloud SQL faz backups diários  
✅ **Alta disponibilidade** - SLA de 99.95%  
✅ **Segurança** - Secret Manager, SSL automático, IAM  

## 🏗️ Arquitetura no GCP

```
┌─────────────────────────────────────────────────────────┐
│                      USUÁRIOS                            │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
        ┌──────────────────────────────┐
        │   Cloud Run (Frontend)       │
        │   • React + Nginx            │
        │   • 256Mi RAM                │
        │   • Escala: 0-10             │
        └──────────────┬───────────────┘
                       │
                       ▼
        ┌──────────────────────────────┐
        │   Cloud Run (Backend)        │
        │   • NestJS                   │
        │   • 512Mi RAM                │
        │   • Escala: 0-10             │
        └──────────┬───────────────────┘
                   │
                   ├─────────────┬──────────────┐
                   ▼             ▼              ▼
         ┌────────────┐  ┌──────────┐  ┌──────────────┐
         │ Cloud SQL  │  │  Secret  │  │ Cloud Build  │
         │ PostgreSQL │  │ Manager  │  │    (CI/CD)   │
         └────────────┘  └──────────┘  └──────────────┘
```

## 📊 Monitoramento (Gratuito)

O BarTab inclui monitoramento completo **100% gratuito** usando ferramentas nativas do GCP:

### 🚀 Setup em 3 Passos

```bash
# 1. Configurar monitoramento (uma vez)
cd gcp/scripts
./setup-monitoring.sh

# 2. Instalar dependências
cd ../../backend
npm install

# 3. Ver status
cd ../gcp/scripts
./monitor.sh all
```

### 📊 Ferramentas Incluídas

| Ferramenta | O que faz | Custo |
|------------|-----------|-------|
| **Cloud Monitoring** | Métricas (CPU, memória, requisições) | Grátis (150MB/mês) |
| **Cloud Trace** | APM - rastreamento de requisições | Grátis (250k/mês) |
| **Cloud Logging** | Logs estruturados | Grátis (50GB/mês) |
| **Error Reporting** | Agrupamento de erros | Grátis (ilimitado) |
| **Uptime Checks** | Verifica disponibilidade | Grátis (100 checks) |

### 🎯 Uso Diário

```bash
cd gcp/scripts

# Ver tudo
./monitor.sh all

# Monitoramento contínuo (atualiza automaticamente)
./monitor.sh watch

# Ver apenas erros
./monitor.sh errors

# Ver logs
./monitor.sh logs

# Health check
./monitor.sh health
```

### 📱 Console Web & Mobile

- **Dashboards:** https://console.cloud.google.com/monitoring
- **Logs:** https://console.cloud.google.com/logs
- **Erros:** https://console.cloud.google.com/errors
- **Traces:** https://console.cloud.google.com/traces
- **App Mobile:** Baixe "Google Cloud" na App Store/Play Store

### 📚 Documentação Completa

- **Início Rápido (5 min):** [QUICK_START_MONITORING.md](QUICK_START_MONITORING.md)
- **Guia Completo:** [docs/MONITORING.md](docs/MONITORING.md)
- **Guia de Scripts:** [scripts/README.md](scripts/README.md)

---

## 📦 Pré-requisitos

### 1. Ferramentas Necessárias

```bash
# Google Cloud SDK
curl https://sdk.cloud.google.com | bash
exec -l $SHELL

# Docker
brew install docker  # macOS
# ou instale do site: https://docker.com

# Terraform (opcional, mas recomendado)
brew install terraform

# PostgreSQL Client (para migração)
brew install postgresql
```

### 2. Conta GCP

- Criar conta no [Google Cloud Console](https://console.cloud.google.com)
- Criar um novo projeto ou usar existente
- Habilitar billing (necessário para Cloud Run e Cloud SQL)

### 3. Autenticação

```bash
# Login no gcloud
gcloud auth login

# Configurar projeto
gcloud config set project SEU_PROJECT_ID

# Login para Docker
gcloud auth configure-docker
```

## 🚀 Passo a Passo

### Opção A: Setup Automatizado (Recomendado)

```bash
# 1. Ir para o diretório de scripts
cd gcp/scripts

# 2. Executar setup inicial
./setup-gcp.sh

# 3. Configurar secrets
./update-secrets.sh

# 4. Criar infraestrutura com Terraform
cd ../terraform
terraform init
terraform plan
terraform apply

# 5. Migrar banco de dados (opcional)
cd ../scripts
./migrate-database.sh

# 6. Fazer deploy
./deploy.sh
```

### Opção B: Setup Manual

<details>
<summary>Clique para expandir o guia manual</summary>

#### 1. Habilitar APIs

```bash
gcloud services enable \
    run.googleapis.com \
    cloudbuild.googleapis.com \
    sqladmin.googleapis.com \
    secretmanager.googleapis.com \
    containerregistry.googleapis.com
```

#### 2. Criar Service Account

```bash
gcloud iam service-accounts create bartab-backend-sa \
    --display-name="BarTab Backend Service Account"

SA_EMAIL="bartab-backend-sa@$(gcloud config get-value project).iam.gserviceaccount.com"

gcloud projects add-iam-policy-binding $(gcloud config get-value project) \
    --member="serviceAccount:$SA_EMAIL" \
    --role="roles/cloudsql.client"
```

#### 3. Criar Secrets

```bash
# Criar secrets vazios
echo "placeholder" | gcloud secrets create bartab-database-url --data-file=-
echo "placeholder" | gcloud secrets create bartab-jwt-secret --data-file=-
echo "placeholder" | gcloud secrets create bartab-google-client-id --data-file=-
echo "placeholder" | gcloud secrets create bartab-google-client-secret --data-file=-
echo "placeholder" | gcloud secrets create bartab-smtp-user --data-file=-
echo "placeholder" | gcloud secrets create bartab-smtp-pass --data-file=-

# Atualizar com valores reais
echo "SEU_DATABASE_URL" | gcloud secrets versions add bartab-database-url --data-file=-
# Repetir para os outros secrets...
```

#### 4. Criar Cloud SQL

```bash
gcloud sql instances create bartab-postgres \
    --database-version=POSTGRES_16 \
    --tier=db-f1-micro \
    --region=us-central1

gcloud sql databases create bartab_production \
    --instance=bartab-postgres

gcloud sql users create bartab \
    --instance=bartab-postgres \
    --password=SUA_SENHA_FORTE
```

#### 5. Build e Deploy Backend

```bash
cd backend

docker build -t gcr.io/$(gcloud config get-value project)/bartab-backend:latest .
docker push gcr.io/$(gcloud config get-value project)/bartab-backend:latest

gcloud run deploy bartab-backend \
    --image=gcr.io/$(gcloud config get-value project)/bartab-backend:latest \
    --platform=managed \
    --region=us-central1 \
    --allow-unauthenticated \
    --service-account=$SA_EMAIL \
    --set-env-vars="NODE_ENV=production" \
    --set-secrets="DATABASE_URL=bartab-database-url:latest,JWT_SECRET=bartab-jwt-secret:latest" \
    --memory=512Mi
```

#### 6. Build e Deploy Frontend

```bash
cd frontend

docker build -t gcr.io/$(gcloud config get-value project)/bartab-frontend:latest .
docker push gcr.io/$(gcloud config get-value project)/bartab-frontend:latest

gcloud run deploy bartab-frontend \
    --image=gcr.io/$(gcloud config get-value project)/bartab-frontend:latest \
    --platform=managed \
    --region=us-central1 \
    --allow-unauthenticated \
    --memory=256Mi
```

</details>

## 📁 Estrutura de Arquivos

```
gcp/
├── README.md                       # Este arquivo
├── QUICK_START_MONITORING.md       # 🚀 Início rápido de monitoramento
├── terraform/                      # Infraestrutura como código
│   ├── main.tf                    # Configuração principal
│   ├── variables.tf               # Variáveis
│   └── terraform.tfvars.example   # Exemplo de valores
├── cloud-run/                      # Configurações Cloud Run
│   ├── backend.yaml               # Config do backend
│   └── frontend.yaml              # Config do frontend
├── scripts/                        # Scripts úteis
│   ├── README.md                  # 📖 Guia de scripts
│   ├── setup-gcp.sh               # Setup inicial
│   ├── setup-monitoring.sh        # 📊 Setup de monitoramento
│   ├── monitor.sh                 # 📊 Monitoramento interativo
│   ├── update-secrets.sh          # Atualizar secrets
│   ├── deploy.sh                  # Deploy completo
│   ├── migrate-database.sh        # Migrar dados
│   ├── backup-database.sh         # Backup manual
│   ├── rollback.sh                # Reverter deploy
│   ├── logs.sh                    # Ver logs
│   └── status.sh                  # Status da infra
└── docs/                           # Documentação adicional
    ├── MIGRATION.md               # Guia de migração
    ├── COSTS.md                   # Análise de custos
    └── MONITORING.md              # 📊 Guia completo de monitoramento

backend/
├── Dockerfile                   # Docker do backend
├── .dockerignore
└── cloudbuild.yaml             # CI/CD config

frontend/
├── Dockerfile                   # Docker do frontend
├── .dockerignore
├── nginx.conf                   # Config do Nginx
├── docker-entrypoint.sh
└── cloudbuild.yaml             # CI/CD config
```

## 🛠️ Scripts Disponíveis

### Setup e Configuração

```bash
# Setup inicial do GCP
./scripts/setup-gcp.sh

# Atualizar secrets
./scripts/update-secrets.sh
```

### Deploy

```bash
# Deploy completo (backend + frontend)
./scripts/deploy.sh

# Deploy apenas backend
./scripts/deploy.sh
# Escolher opção 2

# Deploy apenas frontend
./scripts/deploy.sh
# Escolher opção 3
```

### Banco de Dados

```bash
# Migrar dados do Supabase
./scripts/migrate-database.sh

# Backup manual
./scripts/backup-database.sh
```

### Monitoramento

```bash
# Configurar monitoramento (uma vez)
./scripts/setup-monitoring.sh

# Ver status de todos os recursos
./scripts/monitor.sh status

# Ver logs em tempo real
./scripts/monitor.sh logs

# Ver erros recentes
./scripts/monitor.sh errors

# Health check detalhado
./scripts/monitor.sh health

# Modo contínuo (atualiza automaticamente)
./scripts/monitor.sh watch

# Ver guia completo
cat docs/MONITORING.md
```

## 💰 Custos Estimados

### Configuração Básica (Tráfego Baixo)

| Serviço | Configuração | Custo Mensal (USD) |
|---------|--------------|-------------------|
| Cloud Run (Backend) | 512Mi RAM, 1 vCPU | $10-15 |
| Cloud Run (Frontend) | 256Mi RAM, 1 vCPU | $5-10 |
| Cloud SQL | db-f1-micro (compartilhado) | $7 |
| Secret Manager | 6 secrets | $0.36 |
| Container Registry | ~2GB | $0.10 |
| **Total** | | **~$22-32/mês** |

### Configuração Produção (Tráfego Médio)

| Serviço | Configuração | Custo Mensal (USD) |
|---------|--------------|-------------------|
| Cloud Run (Backend) | 512Mi RAM, 1 vCPU | $30-50 |
| Cloud Run (Frontend) | 256Mi RAM, 1 vCPU | $15-25 |
| Cloud SQL | db-g1-small (dedicado) | $25 |
| Secret Manager | 6 secrets | $0.36 |
| Container Registry | ~2GB | $0.10 |
| **Total** | | **~$70-100/mês** |

**Notas:**
- Cloud Run cobra por uso real (CPU, memória, requests)
- Primeiros 2 milhões de requests são gratuitos
- 180,000 vCPU-segundos e 360,000 GiB-segundos gratuitos por mês
- Backups do Cloud SQL inclusos no preço

### Comparação com Render/Supabase

| Item | Render/Supabase | GCP |
|------|----------------|-----|
| Backend | $7-25/mês | $10-50/mês |
| Frontend | $7-25/mês | $5-25/mês |
| Database | $25+/mês | $7-25/mês |
| **Total** | **$39-75+/mês** | **$22-100/mês** |

**Vantagens GCP:**
- Mais flexível e escalável
- Integração melhor entre serviços
- Backups automáticos inclusos
- Mais opções de configuração

## 🔧 Manutenção

### Ver Status

```bash
./scripts/status.sh
```

### Ver Logs

```bash
# Logs em tempo real
./scripts/logs.sh

# Logs históricos (últimas 24h)
gcloud logging read "resource.type=cloud_run_revision" \
    --limit=100 \
    --format=json
```

### Atualizar Aplicação

```bash
# Fazer alterações no código
# Depois fazer deploy
./scripts/deploy.sh
```

### Fazer Rollback

```bash
./scripts/rollback.sh
```

### Backup do Banco

```bash
# Backups automáticos são feitos diariamente
# Para backup manual:
./scripts/backup-database.sh
```

### Restaurar Backup

```bash
# Listar backups
gcloud sql backups list --instance=bartab-postgres

# Restaurar
gcloud sql backups restore BACKUP_ID \
    --backup-instance=bartab-postgres
```

## 🐛 Troubleshooting

### Erro: "Permission Denied"

```bash
# Verificar autenticação
gcloud auth list

# Verificar projeto
gcloud config get-value project

# Reautenticar se necessário
gcloud auth login
```

### Erro: "API not enabled"

```bash
# Habilitar todas as APIs necessárias
./scripts/setup-gcp.sh
```

### Backend não conecta no banco

```bash
# Verificar se Cloud SQL está rodando
gcloud sql instances describe bartab-postgres

# Verificar secrets
gcloud secrets versions access latest --secret=bartab-database-url

# Verificar logs
./scripts/logs.sh
```

### Build falha com erro de memória

```bash
# Aumentar recursos do Cloud Build
# Editar cloudbuild.yaml:
options:
  machineType: 'N1_HIGHCPU_8'
```

### Frontend não se conecta ao backend

```bash
# Verificar se a URL do backend está correta
# No frontend/Dockerfile, verificar build-arg VITE_API_BASE_URL

# Atualizar CORS no backend
# Adicionar URL do frontend em CORS_ORIGIN
```

## 📚 Próximos Passos

Após a migração bem-sucedida:

1. **Domínio Customizado**
   - Configurar Cloud Load Balancer
   - Apontar domínio para o Load Balancer
   - Configurar SSL com certificado gerenciado

2. **CI/CD Automático**
   - Configurar triggers no Cloud Build
   - Deploy automático no push para main

3. **Monitoramento** ✅
   - Usar ferramentas gratuitas (Cloud Monitoring, Trace, Logging)
   - Ver guia completo: [docs/MONITORING.md](docs/MONITORING.md)
   - Scripts prontos em `scripts/monitor.sh` e `scripts/setup-monitoring.sh`

4. **CDN**
   - Ativar Cloud CDN para o frontend
   - Melhorar performance global

5. **Backups**
   - Configurar exports automáticos para Cloud Storage
   - Testar processo de restore

## 🔗 Links Úteis

- [Google Cloud Console](https://console.cloud.google.com)
- [Cloud Run Docs](https://cloud.google.com/run/docs)
- [Cloud SQL Docs](https://cloud.google.com/sql/docs)
- [Pricing Calculator](https://cloud.google.com/products/calculator)
- [GCP Free Tier](https://cloud.google.com/free)

## 🤝 Suporte

Se encontrar problemas:

1. Verificar logs: `./scripts/logs.sh`
2. Verificar status: `./scripts/status.sh`
3. Consultar documentação do GCP
4. Abrir issue no repositório

---

**🎉 Boa migração!**

