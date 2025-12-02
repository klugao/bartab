#!/bin/bash

# Script para ativar/desativar aprovação automática de estabelecimentos
# Uso: ./ativar-auto-approve.sh [true|false]

set -e

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Verificar se está logado
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" &>/dev/null; then
    echo -e "${RED}❌ Você não está logado no gcloud${NC}"
    echo "Execute: gcloud auth login"
    exit 1
fi

# Obter projeto e região
PROJECT_ID=$(gcloud config get-value project)
REGION=${REGION:-us-central1}

if [ -z "$PROJECT_ID" ]; then
    echo -e "${RED}❌ Nenhum projeto configurado${NC}"
    exit 1
fi

# Valor da flag (true ou false)
VALUE=${1:-true}

if [ "$VALUE" != "true" ] && [ "$VALUE" != "false" ]; then
    echo -e "${RED}❌ Valor inválido. Use 'true' ou 'false'${NC}"
    echo "Uso: $0 [true|false]"
    exit 1
fi

echo "🔧 Configurando AUTO_APPROVE_ESTABLISHMENTS"
echo "=========================================="
echo ""
echo "📋 Projeto: $PROJECT_ID"
echo "🌍 Região: $REGION"
echo "🔑 Valor: $VALUE"
echo ""

# Obter variáveis de ambiente atuais
echo "📥 Obtendo variáveis de ambiente atuais..."
CURRENT_ENV=$(gcloud run services describe bartab-backend \
    --platform=managed \
    --region=$REGION \
    --format="value(spec.template.spec.containers[0].env)" 2>/dev/null || echo "")

# Atualizar variável de ambiente
echo "🔄 Atualizando variável AUTO_APPROVE_ESTABLISHMENTS=$VALUE..."
gcloud run services update bartab-backend \
    --platform=managed \
    --region=$REGION \
    --update-env-vars="AUTO_APPROVE_ESTABLISHMENTS=$VALUE" \
    --quiet

if [ "$VALUE" = "true" ]; then
    echo ""
    echo -e "${GREEN}✅ Aprovação automática ATIVADA${NC}"
    echo "   Todos os novos estabelecimentos serão criados já APROVADOS"
else
    echo ""
    echo -e "${YELLOW}✅ Aprovação automática DESATIVADA${NC}"
    echo "   Novos estabelecimentos voltarão a ficar PENDENTES de aprovação"
fi

echo ""
echo "📝 Para verificar:"
echo "   gcloud run services describe bartab-backend --region=$REGION --format='value(spec.template.spec.containers[0].env)'"
echo ""

