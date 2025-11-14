# 🚀 Deploy BarTab no Google Cloud Platform

**Documentação completa para deploy do BarTab no GCP.**

## 📁 Arquivos Criados

Toda a infraestrutura para o GCP foi criada e está organizada no diretório `gcp/`:

```
gcp/
├── README.md                    # Documentação principal completa
├── terraform/                   # Infraestrutura como código
│   ├── main.tf                 # Configuração Terraform
│   ├── variables.tf            # Variáveis
│   └── terraform.tfvars.example # Exemplo de configuração
├── cloud-run/                   # Configurações Cloud Run
│   ├── backend.yaml            # Config backend
│   └── frontend.yaml           # Config frontend
├── scripts/                     # Scripts automatizados
│   ├── setup-gcp.sh            # Setup inicial (EXECUTAR PRIMEIRO)
│   ├── update-secrets.sh       # Configurar secrets
│   ├── deploy.sh               # Deploy das aplicações
│   ├── backup-database.sh      # Backup manual
│   ├── rollback.sh             # Reverter deploy
│   ├── logs.sh                 # Ver logs em tempo real
│   └── status.sh               # Status da infraestrutura
└── docs/                        # Documentação detalhada
    ├── COSTS.md                # Análise completa de custos
    └── QUICK_START.md          # Deploy em 30 minutos
```

## ⚡ Início Rápido

### Deploy em 30 minutos

```bash
# Leia o guia rápido
cat gcp/docs/QUICK_START.md

# Ou siga os comandos:
cd gcp/scripts
./setup-gcp.sh          # Setup inicial
./update-secrets.sh     # Configurar secrets
cd ../terraform && terraform apply  # Criar infraestrutura
cd ../scripts && ./deploy.sh        # Deploy completo
./deploy.sh                 # Deploy
```

## 📊 Serviços Criados no GCP

### 1. Cloud Run

**Backend (NestJS)**
- Imagem: Docker otimizada multi-stage
- Recursos: 512Mi RAM, 1 vCPU
- Escala: 0-10 instâncias
- Secrets via Secret Manager
- Conexão com Cloud SQL via Unix socket

**Frontend (React + Nginx)**
- Imagem: Docker com nginx otimizado
- Recursos: 256Mi RAM, 1 vCPU
- Escala: 0-10 instâncias
- Gzip e cache configurados

### 2. Cloud SQL

- PostgreSQL 16
- Backups automáticos diários
- Point-in-time recovery
- SSL obrigatório
- Configurável via Terraform (db-f1-micro até db-n1-standard-1)

### 3. Secret Manager

- Gerenciamento seguro de secrets:
  - DATABASE_URL
  - JWT_SECRET
  - GOOGLE_CLIENT_ID
  - GOOGLE_CLIENT_SECRET
  - SMTP_USER
  - SMTP_PASS

### 4. Cloud Build

- CI/CD automático
- Build de imagens Docker
- Deploy automático no Cloud Run
- Configurável via GitHub Actions

## 💰 Custos Estimados

| Cenário | Configuração | Custo Mensal |
|---------|--------------|--------------|
| **MVP** | db-f1-micro, baixo tráfego | $17-25 |
| **Produção** | db-g1-small, tráfego médio | $50-75 |
| **Escala** | db-n1-standard-1, alto tráfego | $150-200 |

**Comparação com Render/Supabase:**
- MVP: ~50% mais barato no GCP
- Produção: ~30% mais barato no GCP
- Mais flexível e escalável

📖 **Análise completa:** `gcp/docs/COSTS.md`

## 🛠️ Scripts Disponíveis

Todos os scripts estão em `gcp/scripts/` e são executáveis:

| Script | Descrição | Quando usar |
|--------|-----------|-------------|
| `setup-gcp.sh` | Setup inicial do GCP | Primeira vez |
| `update-secrets.sh` | Atualizar secrets | Trocar credenciais |
| `deploy.sh` | Deploy backend/frontend | Atualizar código |
| `migrate-database.sh` | Migrar do Supabase | Migração inicial |
| `backup-database.sh` | Backup manual | Antes de mudanças |
| `rollback.sh` | Reverter deploy | Se algo der errado |
| `logs.sh` | Ver logs em tempo real | Debug |
| `status.sh` | Status de tudo | Monitoramento |

## 📚 Documentação

### 1. README Principal
📄 `gcp/README.md` - **LEIA PRIMEIRO**
- Visão geral completa
- Arquitetura no GCP
- Passo a passo detalhado
- Troubleshooting

### 2. Guia de Migração
📄 `gcp/docs/MIGRATION.md`
- Estratégia Blue-Green
- Checklist completo
- Passo a passo detalhado
- Planos de rollback
- Monitoramento pós-migração

### 3. Análise de Custos
📄 `gcp/docs/COSTS.md`
- Custos por cenário
- Free tier do GCP
- Otimização de custos
- Comparação com Render/Supabase

### 4. Quick Start
📄 `gcp/docs/QUICK_START.md`
- Deploy em 30 minutos
- Comandos essenciais
- Troubleshooting rápido

## 🎯 Próximos Passos

### 1. Leia a Documentação Principal

```bash
cat gcp/README.md
```

### 2. Escolha seu Caminho

**A) Novo Deploy no GCP**
→ Siga o `QUICK_START.md`

**B) Migração do Render/Supabase**
→ Siga o `MIGRATION.md`

### 3. Execute o Setup

```bash
cd gcp/scripts
./setup-gcp.sh
```

### 4. Consulte quando Necessário

- Dúvidas sobre custos? → `COSTS.md`
- Problemas? → `README.md#troubleshooting`
- Status? → `./scripts/status.sh`
- Logs? → `./scripts/logs.sh`

## ✅ O que Foi Criado

### Dockerfiles

✅ **Backend (`backend/Dockerfile`)**
- Multi-stage build otimizado
- Imagem final: ~200MB
- Node 20 Alpine
- Usuário não-root para segurança

✅ **Frontend (`frontend/Dockerfile`)**
- Build com Vite
- Nginx para servir arquivos
- Gzip e cache configurados
- Imagem final: ~50MB

### Configurações Cloud Run

✅ **Backend (`gcp/cloud-run/backend.yaml`)**
- Health checks configurados
- Secrets via Secret Manager
- Conexão Cloud SQL
- Auto-scaling

✅ **Frontend (`gcp/cloud-run/frontend.yaml`)**
- Otimizado para servir assets
- Health checks
- Auto-scaling

### Terraform

✅ **Infraestrutura como Código (`gcp/terraform/main.tf`)**
- Cloud SQL com backups
- Service Account
- Secrets Manager
- Permissões IAM

### CI/CD

✅ **GitHub Actions (`.github/workflows/deploy-gcp.yml`)**
- Deploy automático no push
- Build e push de imagens
- Deploy no Cloud Run

### Scripts

✅ **8 Scripts Utilitários (`gcp/scripts/*.sh`)**
- Setup, deploy, migração
- Backup, rollback, logs
- Status e monitoramento

## 🔒 Segurança

✅ Service Account com permissões mínimas  
✅ Secrets no Secret Manager (não em variáveis de ambiente)  
✅ SSL/TLS automático no Cloud Run  
✅ Imagens Docker com usuário não-root  
✅ Cloud SQL com SSL obrigatório  
✅ IAM bem configurado  

## 🌟 Vantagens do GCP

✅ **Escalabilidade**: 0 a 1000+ instâncias automaticamente  
✅ **Custo**: Pay-per-use, mais barato que Render/Supabase  
✅ **Integração**: Todos os serviços integrados nativamente  
✅ **Monitoramento**: Cloud Monitoring incluído  
✅ **Backups**: Automáticos no Cloud SQL  
✅ **SSL**: Certificados gerenciados automaticamente  
✅ **Performance**: CDN global disponível  

## 🆘 Suporte

### Problemas?

1. Verifique os logs: `./scripts/logs.sh`
2. Verifique o status: `./scripts/status.sh`
3. Consulte o troubleshooting: `gcp/README.md#troubleshooting`
4. Leia a documentação específica em `gcp/docs/`

### Contatos Úteis

- Documentação GCP: https://cloud.google.com/docs
- Suporte GCP: https://cloud.google.com/support
- Status GCP: https://status.cloud.google.com

## 📞 Feedback

Encontrou algum problema ou tem sugestões? Abra uma issue!

---

**🎉 Tudo pronto para migrar para o GCP!**

**Comece aqui:** `gcp/README.md` ou `gcp/docs/QUICK_START.md`

**Boa migração! 🚀**

