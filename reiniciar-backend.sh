#!/bin/bash

# Script para reiniciar o backend e aplicar os novos secrets

set -e

PROJECT_ID="bartab-475300"
SERVICE_NAME="bartab-backend"
REGION="us-central1"

echo "🔄 Reiniciando Backend - BarTab"
echo "================================"
echo ""

# Verificar se gcloud está instalado
if ! command -v gcloud &> /dev/null; then
    echo "❌ gcloud não encontrado!"
    echo ""
    echo "Instale primeiro: ./instalar-gcloud.sh"
    exit 1
fi

echo "📋 Projeto: $PROJECT_ID"
echo "🌎 Região: $REGION"
echo "🚀 Serviço: $SERVICE_NAME"
echo ""

echo "🔄 Atualizando serviço (isso força uma nova revisão com os secrets atualizados)..."
gcloud run services update $SERVICE_NAME \
    --region=$REGION \
    --project=$PROJECT_ID

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Backend reiniciado com sucesso!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🔗 URL do Backend:"
gcloud run services describe $SERVICE_NAME \
    --region=$REGION \
    --project=$PROJECT_ID \
    --format='value(status.url)'
echo ""
echo "📝 Para verificar se está funcionando:"
echo "   1. Acesse: https://bartab-frontend-312426210115.us-central1.run.app/login"
echo "   2. Clique em 'Entrar com Google'"
echo "   3. Deve funcionar! 🎉"
echo ""
echo "🐛 Para ver os logs:"
echo "   gcloud logs tail --service=$SERVICE_NAME --project=$PROJECT_ID"
echo ""

