#!/bin/bash

# Script para visualizar logs em tempo real
# Útil para debugging e monitoramento

set -e

echo "📊 Logs - Cloud Run"
echo "==================="
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

# Escolher serviço
echo "Logs de qual serviço?"
echo "  1) Backend"
echo "  2) Frontend"
echo "  3) Ambos"
echo ""
read -p "Escolha [1-3]: " SERVICE_OPTION

case $SERVICE_OPTION in
    1)
        SERVICE_NAME="bartab-backend"
        ;;
    2)
        SERVICE_NAME="bartab-frontend"
        ;;
    3)
        SERVICE_NAME=""
        ;;
    *)
        echo -e "${RED}❌ Opção inválida${NC}"
        exit 1
        ;;
esac

echo ""
echo "📊 Mostrando logs..."
echo ""
echo -e "${YELLOW}Pressione Ctrl+C para sair${NC}"
echo ""

if [ -z "$SERVICE_NAME" ]; then
    # Logs de ambos os serviços
    gcloud logging tail "resource.type=cloud_run_revision AND (resource.labels.service_name=bartab-backend OR resource.labels.service_name=bartab-frontend)" \
        --project=$PROJECT_ID \
        --format="table(timestamp,resource.labels.service_name,severity,textPayload)"
else
    # Logs de um serviço específico
    gcloud logging tail "resource.type=cloud_run_revision AND resource.labels.service_name=$SERVICE_NAME" \
        --project=$PROJECT_ID \
        --format="table(timestamp,severity,textPayload)"
fi

