#!/bin/bash

# Script para fazer rollback de um deploy
# Reverte para a versão anterior do serviço

set -e

echo "⏮️  Rollback - Cloud Run"
echo "======================="
echo ""

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
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

# Escolher serviço
echo "Qual serviço deseja reverter?"
echo "  1) Backend"
echo "  2) Frontend"
echo ""
read -p "Escolha [1-2]: " SERVICE_OPTION

case $SERVICE_OPTION in
    1)
        SERVICE_NAME="bartab-backend"
        ;;
    2)
        SERVICE_NAME="bartab-frontend"
        ;;
    *)
        echo -e "${RED}❌ Opção inválida${NC}"
        exit 1
        ;;
esac

echo ""
echo "📋 Versões disponíveis de $SERVICE_NAME:"
echo ""

# Listar revisões
gcloud run revisions list \
    --service=$SERVICE_NAME \
    --platform=managed \
    --region=$REGION \
    --limit=5

echo ""
read -p "Digite o nome da revisão para fazer rollback: " REVISION_NAME

if [ -z "$REVISION_NAME" ]; then
    echo -e "${RED}❌ Nome da revisão não pode ser vazio${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}⚠️  Fazendo rollback para: $REVISION_NAME${NC}"
echo ""
read -p "Confirma? (s/N): " CONFIRM

if [ "$CONFIRM" != "s" ] && [ "$CONFIRM" != "S" ]; then
    echo "Operação cancelada."
    exit 0
fi

# Fazer rollback
gcloud run services update-traffic $SERVICE_NAME \
    --to-revisions=$REVISION_NAME=100 \
    --platform=managed \
    --region=$REGION

echo ""
echo -e "${GREEN}✅ Rollback concluído com sucesso!${NC}"
echo ""

# Mostrar URL
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --platform=managed --region=$REGION --format="value(status.url)")
echo "🔗 URL: $SERVICE_URL"
echo ""

