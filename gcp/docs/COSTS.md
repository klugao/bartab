# 💰 Análise Detalhada de Custos - GCP

Guia completo sobre custos do BarTab no Google Cloud Platform.

## 📊 Calculadora de Custos

Use a [Calculadora oficial do GCP](https://cloud.google.com/products/calculator) para estimativas personalizadas.

## 🎯 Cenários de Uso

### Cenário 1: Startup / MVP (Baixo Tráfego)

**Perfil:**
- 100-500 usuários/mês
- 10.000 requests/dia
- 1-2 contas abertas simultaneamente
- Uso predominantemente diurno

#### Custos Mensais

| Serviço | Configuração | Custo |
|---------|--------------|-------|
| **Cloud Run - Backend** | | |
| CPU | 0.5 vCPU, ~30h/mês | $3.60 |
| Memória | 512Mi, ~30h/mês | $0.80 |
| Requests | 300k requests | $0.00 (free tier) |
| **Cloud Run - Frontend** | | |
| CPU | 0.5 vCPU, ~15h/mês | $1.80 |
| Memória | 256Mi, ~15h/mês | $0.20 |
| Requests | 300k requests | $0.00 (free tier) |
| **Cloud SQL** | | |
| Instância | db-f1-micro | $7.67 |
| Storage | 10 GB SSD | $1.70 |
| Backups | 7 dias | $0.80 |
| **Secret Manager** | | |
| 6 secrets ativos | 6 × $0.06 | $0.36 |
| Acessos | ~5000/mês | $0.00 (free tier) |
| **Container Registry** | | |
| Storage | 2 GB | $0.10 |
| Networking | 1 GB egress | $0.00 (free tier) |
| **Cloud Build** | | |
| Builds | ~20/mês | $0.00 (free tier: 120 min/dia) |
| **TOTAL** | | **~$17/mês** |

### Cenário 2: Pequeno Negócio (Tráfego Médio)

**Perfil:**
- 1.000-5.000 usuários/mês
- 50.000 requests/dia
- 5-10 contas abertas simultaneamente
- Uso durante todo o dia

#### Custos Mensais

| Serviço | Configuração | Custo |
|---------|--------------|-------|
| **Cloud Run - Backend** | | |
| CPU | 1 vCPU, ~100h/mês | $12.00 |
| Memória | 512Mi, ~100h/mês | $2.67 |
| Requests | 1.5M requests | $0.40 |
| **Cloud Run - Frontend** | | |
| CPU | 1 vCPU, ~50h/mês | $6.00 |
| Memória | 256Mi, ~50h/mês | $0.67 |
| Requests | 1.5M requests | $0.40 |
| **Cloud SQL** | | |
| Instância | db-g1-small (dedicado) | $25.00 |
| Storage | 20 GB SSD | $3.40 |
| Backups | 7 dias | $1.60 |
| **Secret Manager** | | |
| 6 secrets ativos | 6 × $0.06 | $0.36 |
| Acessos | ~25k/mês | $0.05 |
| **Container Registry** | | |
| Storage | 3 GB | $0.15 |
| Networking | 10 GB egress | $1.20 |
| **Cloud Build** | | |
| Builds | ~40/mês | $0.00 (free tier) |
| **TOTAL** | | **~$54/mês** |

### Cenário 3: Médio Porte (Tráfego Alto)

**Perfil:**
- 10.000+ usuários/mês
- 200.000 requests/dia
- 20-50 contas abertas simultaneamente
- Uso 24/7

#### Custos Mensais

| Serviço | Configuração | Custo |
|---------|--------------|-------|
| **Cloud Run - Backend** | | |
| CPU | 2 vCPU, ~300h/mês | $36.00 |
| Memória | 1Gi, ~300h/mês | $8.00 |
| Requests | 6M requests | $2.40 |
| **Cloud Run - Frontend** | | |
| CPU | 1 vCPU, ~200h/mês | $24.00 |
| Memória | 512Mi, ~200h/mês | $5.34 |
| Requests | 6M requests | $2.40 |
| **Cloud SQL** | | |
| Instância | db-n1-standard-1 | $50.00 |
| Storage | 50 GB SSD | $8.50 |
| Backups | 7 dias | $4.00 |
| **Secret Manager** | | |
| 6 secrets ativos | 6 × $0.06 | $0.36 |
| Acessos | ~100k/mês | $0.20 |
| **Container Registry** | | |
| Storage | 5 GB | $0.25 |
| Networking | 50 GB egress | $6.00 |
| **Cloud Build** | | |
| Builds | ~60/mês, 5min cada | $3.00 |
| **TOTAL** | | **~$150/mês** |

## 🆓 Free Tier do GCP

O GCP oferece um **Always Free tier** generoso:

### Cloud Run (Sempre Grátis)

- 2 milhões de requests/mês
- 360.000 GiB-segundos de memória
- 180.000 vCPU-segundos
- 1 GB de egress/mês

### Cloud Build (Sempre Grátis)

- 120 minutos de build/dia
- 10 builds simultâneos

### Secret Manager (Sempre Grátis)

- 6 secrets ativos
- 10.000 acessos/mês

### Outros Serviços Grátis

- Cloud Storage: 5 GB
- Cloud Functions: 2M invocações/mês
- Cloud Monitoring: Logs básicos

**Cloud SQL não tem free tier**, mas db-f1-micro é a opção mais barata.

## 💡 Otimização de Custos

### 1. Cloud Run - Reduzir Custos

#### Ajustar Min Instances

```bash
# Min instances = 0 (padrão, mais barato)
gcloud run services update bartab-backend \
    --min-instances=0 \
    --region=us-central1
```

**Impacto:**
- ✅ Economiza quando não há tráfego
- ⚠️ Cold start de ~2-3 segundos no primeiro request

#### CPU Throttling

```bash
# CPU alocado apenas durante requests
gcloud run services update bartab-backend \
    --cpu-throttling \
    --region=us-central1
```

**Impacto:**
- ✅ Economiza ~15-20% em custos de CPU
- ⚠️ Background tasks serão pausados

#### Reduzir Memória

```bash
# Backend: 512Mi → 256Mi (se possível)
gcloud run services update bartab-backend \
    --memory=256Mi \
    --region=us-central1
```

**Impacto:**
- ✅ Economiza 50% nos custos de memória
- ⚠️ Teste bem antes, pode causar OOM

### 2. Cloud SQL - Reduzir Custos

#### Usar db-f1-micro

Menor tier, compartilhado:
- $7.67/mês
- 614 MB RAM
- 3 GB storage incluído

```bash
gcloud sql instances patch bartab-postgres \
    --tier=db-f1-micro
```

**Quando usar:**
- MVP / desenvolvimento
- Baixo tráfego (< 100 conexões simultâneas)
- Não é missão crítica

**Quando NÃO usar:**
- Produção com tráfego médio/alto
- Múltiplas conexões simultâneas
- Necessita performance consistente

#### Schedule de Pausa (Dev/Staging)

Para ambientes de desenvolvimento:

```bash
# Parar instância
gcloud sql instances patch bartab-postgres-dev \
    --activation-policy=NEVER

# Iniciar quando necessário
gcloud sql instances patch bartab-postgres-dev \
    --activation-policy=ALWAYS
```

**Economia:** ~$200/mês em ambiente de dev

#### Otimizar Storage

```bash
# Reduzir tamanho do disco
gcloud sql instances patch bartab-postgres \
    --storage-size=10

# HDD ao invés de SSD (se performance permitir)
gcloud sql instances patch bartab-postgres \
    --storage-type=HDD
```

**Economia:** 
- 10GB SSD: $1.70/mês
- 10GB HDD: $0.90/mês
- Diferença: $0.80/mês

### 3. Container Registry - Reduzir Custos

#### Limpeza de Imagens Antigas

```bash
# Listar imagens
gcloud container images list

# Deletar tags antigas
gcloud container images delete gcr.io/PROJECT/bartab-backend:OLD_TAG

# Ou script automatizado
for image in $(gcloud container images list-tags gcr.io/PROJECT/bartab-backend --filter="timestamp.datetime < '2024-01-01'" --format="get(tags)" --flatten="tags[]"); do
  gcloud container images delete "gcr.io/PROJECT/bartab-backend:$image" --quiet
done
```

**Economia:** $0.10-0.50/mês

### 4. Networking - Reduzir Custos

#### Usar mesma região

- Backend, Frontend e Database na **mesma região**
- Evita custos de egress entre regiões

**Economia:** $5-20/mês dependendo do tráfego

#### Cloud CDN (para frontend)

```bash
# Configurar CDN
gcloud compute backend-services update bartab-frontend \
    --enable-cdn
```

**Impacto:**
- Custo do CDN: ~$0.08/GB
- Economiza em egress do Cloud Run
- Melhora performance

### 5. Monitorar e Alertar Custos

#### Configurar Budget Alert

```bash
# Via Console: Billing > Budgets
# Configurar alerta em $50, $75, $100
```

#### Ver custos em tempo real

```bash
# Billing dashboard
gcloud billing accounts list
gcloud billing projects link PROJECT_ID --billing-account=ACCOUNT_ID
```

## 📈 Crescimento e Custos

### Projeção de Custos por Número de Usuários

| Usuários Ativos/Mês | Requests/Dia | Custo Estimado |
|---------------------|--------------|----------------|
| 100 | 5,000 | $15-20/mês |
| 500 | 25,000 | $25-35/mês |
| 1,000 | 50,000 | $40-60/mês |
| 5,000 | 250,000 | $100-150/mês |
| 10,000 | 500,000 | $200-300/mês |
| 50,000 | 2,500,000 | $800-1,200/mês |

**Nota:** Assume uso otimizado e eficiente dos recursos.

## 🔍 Como Ver Seus Custos Reais

### No Console GCP

1. Vá em: https://console.cloud.google.com/billing
2. Selecione seu projeto
3. Clique em "Cost breakdown"
4. Filtre por serviço e data

### Via CLI

```bash
# Custo do mês atual
gcloud billing accounts list

# Detalhes de custos (requer BigQuery export configurado)
bq query --use_legacy_sql=false '
SELECT
  service.description,
  SUM(cost) as total_cost
FROM `PROJECT.DATASET.gcp_billing_export_v1_*`
WHERE DATE(_PARTITIONTIME) = CURRENT_DATE()
GROUP BY service.description
ORDER BY total_cost DESC
'
```

## 💰 Resumo de Custos no GCP

### Tráfego Baixo (MVP)

| Componente | Custo Mensal |
|------------|--------------|
| **GCP Total** | $17-25 |

### Tráfego Médio (Produção)

| Componente | Custo Mensal |
|------------|--------------|
| **GCP Total** | $50-75 |

### Tráfego Alto (Escala)

| Componente | Custo Mensal |
|------------|--------------|
| **GCP Total** | $150-200 |

## ✅ Recomendações por Fase

### Fase MVP / Desenvolvimento

```
✓ Cloud Run: min-instances=0, CPU throttling
✓ Cloud SQL: db-f1-micro
✓ Storage: mínimo necessário
✓ Monitoring: básico

Custo estimado: $15-25/mês
```

### Fase Beta / Early Adopters

```
✓ Cloud Run: min-instances=0-1
✓ Cloud SQL: db-g1-small
✓ Backups: 7 dias
✓ Monitoring: médio

Custo estimado: $40-60/mês
```

### Fase Produção

```
✓ Cloud Run: min-instances=1-2
✓ Cloud SQL: db-n1-standard-1
✓ Backups: 30 dias
✓ Monitoring: completo
✓ CDN: habilitado

Custo estimado: $100-200/mês
```

---

**💡 Dica Final:** Comece pequeno e escale conforme necessário. GCP cobra pelo uso real!

