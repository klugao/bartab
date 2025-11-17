#!/bin/bash

# Script para corrigir permissões da Service Account
# Resolve o erro: Permission 'iam.serviceaccounts.actAs' denied

set -e

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "🔐 Corrigindo permissões da Service Account..."
echo ""

# Obter Project ID
PROJECT_ID=$(gcloud config get-value project 2>/dev/null)

if [ -z "$PROJECT_ID" ]; then
    echo -e "${RED}❌ Nenhum projeto configurado${NC}"
    echo "Execute: gcloud config set project SEU_PROJECT_ID"
    exit 1
fi

echo "📦 Project ID: $PROJECT_ID"
echo ""

# Service Account
SA_NAME="bartab-backend-sa"
SA_EMAIL="$SA_NAME@$PROJECT_ID.iam.gserviceaccount.com"

# Verificar se a service account existe
if ! gcloud iam service-accounts describe $SA_EMAIL &>/dev/null; then
    echo -e "${RED}❌ Service Account não encontrada: $SA_EMAIL${NC}"
    echo ""
    echo "Criando service account..."
    gcloud iam service-accounts create $SA_NAME \
        --display-name="BarTab Backend Service Account" \
        --description="Service account para o backend do BarTab"
    echo -e "${GREEN}✅ Service Account criada${NC}"
fi

echo "🔧 Configurando permissões..."
echo ""

# 1. Permissão para atuar como ela mesma (CRÍTICO para Cloud Run)
echo "1️⃣  Configurando permissão 'actAs' (roles/iam.serviceAccountUser)..."
gcloud iam service-accounts add-iam-policy-binding $SA_EMAIL \
    --member="serviceAccount:$SA_EMAIL" \
    --role="roles/iam.serviceAccountUser" \
    --condition=None \
    --quiet 2>/dev/null || echo -e "${YELLOW}⚠️  Permissão já existe ou erro ao configurar${NC}"

echo -e "${GREEN}✅ Permissão 'actAs' configurada${NC}"
echo ""

# 1.5. Permissão para Cloud Build usar a service account (se estiver usando Cloud Build)
PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format="value(projectNumber)" 2>/dev/null || echo "")
if [ -n "$PROJECT_NUMBER" ]; then
    CLOUD_BUILD_SA="${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com"
    echo "1.5️⃣  Configurando permissão para Cloud Build usar a service account..."
    gcloud iam service-accounts add-iam-policy-binding $SA_EMAIL \
        --member="serviceAccount:$CLOUD_BUILD_SA" \
        --role="roles/iam.serviceAccountUser" \
        --condition=None \
        --quiet 2>/dev/null || echo -e "${YELLOW}     ⚠️  Permissão já existe ou erro ao configurar${NC}"
    echo -e "${GREEN}✅ Permissão para Cloud Build configurada${NC}"
    echo ""
fi

# 2. Outras permissões necessárias
echo "2️⃣  Configurando permissões do projeto..."

# Cloud SQL Client
echo "   - Cloud SQL Client..."
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SA_EMAIL" \
    --role="roles/cloudsql.client" \
    --condition=None \
    --quiet 2>/dev/null || echo -e "${YELLOW}     ⚠️  Permissão já existe${NC}"

# Secret Manager Secret Accessor
echo "   - Secret Manager Secret Accessor..."
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SA_EMAIL" \
    --role="roles/secretmanager.secretAccessor" \
    --condition=None \
    --quiet 2>/dev/null || echo -e "${YELLOW}     ⚠️  Permissão já existe${NC}"

echo ""
echo -e "${GREEN}=========================================="
echo "✅ Permissões configuradas com sucesso!"
echo "==========================================${NC}"
echo ""
echo "📋 Service Account: $SA_EMAIL"
echo ""
echo "🔍 Verificando permissões..."
echo ""

# Verificar permissões
echo "Permissões do projeto:"
gcloud projects get-iam-policy $PROJECT_ID \
    --flatten="bindings[].members" \
    --filter="bindings.members:serviceAccount:$SA_EMAIL" \
    --format="table(bindings.role)" 2>/dev/null || echo "   (erro ao listar)"

echo ""
echo "Permissões da service account (actAs):"
gcloud iam service-accounts get-iam-policy $SA_EMAIL \
    --flatten="bindings[].members" \
    --filter="bindings.members:serviceAccount:$SA_EMAIL" \
    --format="table(bindings.role)" 2>/dev/null || echo "   (erro ao listar)"

echo ""
echo -e "${GREEN}✅ Agora você pode fazer o deploy novamente!${NC}"
echo ""
echo "Execute:"
echo "  gcloud builds submit --config=cloudbuild.yaml"
echo ""

