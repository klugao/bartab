#!/bin/bash

# Script para ver o status de todos os recursos no GCP
# Mostra informações sobre Cloud Run, Cloud SQL, etc.

set -e

echo "📊 Status da Infraestrutura - BarTab GCP"
echo "========================================"
echo ""

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Verificar autenticação
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" &>/dev/null; then
    echo -e "${RED}❌ Você não está logado no gcloud${NC}"
    exit 1
fi

PROJECT_ID=$(gcloud config get-value project)
REGION=${REGION:-us-central1}

echo "📋 Projeto: $PROJECT_ID"
echo "🌍 Região: $REGION"
echo ""

# ====== CLOUD RUN ======
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}☁️  Cloud Run Services${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Backend
BACKEND_STATUS=$(gcloud run services describe bartab-backend --platform=managed --region=$REGION --format="value(status.conditions[0].status)" 2>/dev/null || echo "NOT_FOUND")
BACKEND_URL=$(gcloud run services describe bartab-backend --platform=managed --region=$REGION --format="value(status.url)" 2>/dev/null || echo "")

if [ "$BACKEND_STATUS" = "True" ]; then
    echo -e "${GREEN}✅ Backend: ONLINE${NC}"
    echo "   URL: $BACKEND_URL"
else
    echo -e "${RED}❌ Backend: OFFLINE ou NÃO ENCONTRADO${NC}"
fi

echo ""

# Frontend
FRONTEND_STATUS=$(gcloud run services describe bartab-frontend --platform=managed --region=$REGION --format="value(status.conditions[0].status)" 2>/dev/null || echo "NOT_FOUND")
FRONTEND_URL=$(gcloud run services describe bartab-frontend --platform=managed --region=$REGION --format="value(status.url)" 2>/dev/null || echo "")

if [ "$FRONTEND_STATUS" = "True" ]; then
    echo -e "${GREEN}✅ Frontend: ONLINE${NC}"
    echo "   URL: $FRONTEND_URL"
else
    echo -e "${RED}❌ Frontend: OFFLINE ou NÃO ENCONTRADO${NC}"
fi

# ====== CLOUD SQL ======
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🗄️  Cloud SQL${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

SQL_INSTANCE=$(gcloud sql instances list --filter="name:bartab-postgres" --format="value(name)" 2>/dev/null || echo "")

if [ ! -z "$SQL_INSTANCE" ]; then
    SQL_STATUS=$(gcloud sql instances describe $SQL_INSTANCE --format="value(state)")
    SQL_TIER=$(gcloud sql instances describe $SQL_INSTANCE --format="value(settings.tier)")
    SQL_VERSION=$(gcloud sql instances describe $SQL_INSTANCE --format="value(databaseVersion)")
    SQL_IP=$(gcloud sql instances describe $SQL_INSTANCE --format="value(ipAddresses[0].ipAddress)")
    
    if [ "$SQL_STATUS" = "RUNNABLE" ]; then
        echo -e "${GREEN}✅ Database: ONLINE${NC}"
    else
        echo -e "${YELLOW}⚠️  Database: $SQL_STATUS${NC}"
    fi
    
    echo "   Instância: $SQL_INSTANCE"
    echo "   Versão: $SQL_VERSION"
    echo "   Tier: $SQL_TIER"
    echo "   IP: $SQL_IP"
else
    echo -e "${RED}❌ Database: NÃO ENCONTRADO${NC}"
fi

# ====== SECRETS ======
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🔒 Secret Manager${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

SECRETS=(
    "bartab-database-url"
    "bartab-jwt-secret"
    "bartab-google-client-id"
    "bartab-google-client-secret"
    "bartab-smtp-user"
    "bartab-smtp-pass"
)

for secret in "${SECRETS[@]}"; do
    if gcloud secrets describe $secret --project=$PROJECT_ID &>/dev/null; then
        echo -e "${GREEN}✅ $secret${NC}"
    else
        echo -e "${RED}❌ $secret${NC}"
    fi
done

# ====== BACKUPS ======
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}💾 Backups Recentes${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

if [ ! -z "$SQL_INSTANCE" ]; then
    gcloud sql backups list --instance=$SQL_INSTANCE --limit=3 2>/dev/null || echo "Nenhum backup encontrado"
else
    echo "Instância SQL não encontrada"
fi

# ====== RESUMO DE CUSTOS ======
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}💰 Estimativa de Custos (mensal)${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo "Baseado na configuração atual:"
echo ""
echo "• Cloud Run (Backend):"
echo "  - 512Mi RAM, 1 vCPU"
echo "  - ~\$10-30/mês (dependendo do tráfego)"
echo ""
echo "• Cloud Run (Frontend):"
echo "  - 256Mi RAM, 1 vCPU"
echo "  - ~\$5-15/mês (dependendo do tráfego)"
echo ""

if [ ! -z "$SQL_TIER" ]; then
    case $SQL_TIER in
        db-f1-micro)
            echo "• Cloud SQL ($SQL_TIER):"
            echo "  - ~\$7/mês (compartilhado)"
            ;;
        db-g1-small)
            echo "• Cloud SQL ($SQL_TIER):"
            echo "  - ~\$25/mês (dedicado)"
            ;;
        *)
            echo "• Cloud SQL ($SQL_TIER):"
            echo "  - ~\$50+/mês"
            ;;
    esac
fi

echo ""
echo -e "${YELLOW}Total estimado: \$22-102/mês${NC}"
echo -e "${YELLOW}(Depende do tráfego e configuração)${NC}"

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

