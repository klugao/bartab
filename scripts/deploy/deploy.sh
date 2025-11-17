#!/bin/bash

# Script para fazer deploy completo do BarTab no GCP
# Garante que todas as configurações estejam corretas

set -e

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo "🚀 Deploy do BarTab no GCP"
echo "=========================="
echo ""

# Verificar se está no diretório correto
if [ ! -f "cloudbuild.yaml" ]; then
    echo -e "${RED}❌ Erro: Execute este script da raiz do projeto${NC}"
    exit 1
fi

# Obter project ID e number
PROJECT_ID=$(gcloud config get-value project 2>/dev/null)
if [ -z "$PROJECT_ID" ]; then
    echo -e "${RED}❌ Erro: Projeto GCP não configurado${NC}"
    echo "Execute: gcloud config set project SEU_PROJECT_ID"
    exit 1
fi

PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format="value(projectNumber)")
REGION="us-central1"

echo "📦 Projeto: $PROJECT_ID ($PROJECT_NUMBER)"
echo "📍 Região: $REGION"
echo ""

# Construir URLs
BACKEND_URL="https://bartab-backend-${PROJECT_NUMBER}.${REGION}.run.app"
FRONTEND_URL="https://bartab-frontend-${PROJECT_NUMBER}.${REGION}.run.app"
API_URL="${BACKEND_URL}/api"

echo "🔗 URLs:"
echo "   Backend:  $BACKEND_URL"
echo "   Frontend: $FRONTEND_URL"
echo "   API:      $API_URL"
echo ""

# Obter COMMIT_SHA
COMMIT_SHA=$(git rev-parse --short HEAD 2>/dev/null || echo "local-$(date +%s)")
echo "📝 Commit SHA: $COMMIT_SHA"
echo ""

# Confirmar deploy
read -p "Deseja continuar com o deploy? (s/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Ss]$ ]]; then
    echo "Deploy cancelado."
    exit 0
fi

echo ""
echo "🔄 Iniciando deploy..."
echo ""

# Fazer deploy
gcloud builds submit \
    --config=cloudbuild.yaml \
    --substitutions=_API_URL=${API_URL},COMMIT_SHA=${COMMIT_SHA}

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}=========================================="
    echo "✅ Deploy concluído com sucesso!"
    echo "==========================================${NC}"
    echo ""
    echo "🌐 Acesse: $FRONTEND_URL"
    echo ""
else
    echo ""
    echo -e "${RED}❌ Deploy falhou${NC}"
    exit 1
fi

