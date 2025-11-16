#!/bin/bash

# Script para atualizar todas as URLs após mudança de formato do Cloud Run
set -e

echo "🔄 Atualizando URLs do Cloud Run..."
echo ""

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Obter project number
PROJECT_NUMBER=$(gcloud projects describe $(gcloud config get-value project) --format="value(projectNumber)")
PROJECT_ID=$(gcloud config get-value project)
REGION="us-central1"

echo "📦 Project Number: $PROJECT_NUMBER"
echo "📦 Project ID: $PROJECT_ID"
echo "📍 Region: $REGION"
echo ""

# Construir novas URLs
BACKEND_URL="https://bartab-backend-${PROJECT_NUMBER}.${REGION}.run.app"
FRONTEND_URL="https://bartab-frontend-${PROJECT_NUMBER}.${REGION}.run.app"
CALLBACK_URL="${BACKEND_URL}/api/auth/google/callback"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 SUAS NOVAS URLs"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${GREEN}Frontend:${NC} $FRONTEND_URL"
echo -e "${GREEN}Backend:${NC}  $BACKEND_URL"
echo -e "${GREEN}Callback:${NC} $CALLBACK_URL"
echo ""

# Verificar se os serviços existem
echo "🔍 Verificando serviços..."
BACKEND_EXISTS=$(gcloud run services list --format="value(metadata.name)" | grep "^bartab-backend$" || echo "")
FRONTEND_EXISTS=$(gcloud run services list --format="value(metadata.name)" | grep "^bartab-frontend$" || echo "")

if [ -z "$BACKEND_EXISTS" ]; then
    echo -e "${RED}❌ Serviço bartab-backend não encontrado${NC}"
    echo ""
    echo "Serviços disponíveis:"
    gcloud run services list --format="table(name,region,status.url)"
    exit 1
fi

if [ -z "$FRONTEND_EXISTS" ]; then
    echo -e "${RED}❌ Serviço bartab-frontend não encontrado${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Serviços encontrados${NC}"
echo ""

# Verificar URLs atuais
CURRENT_BACKEND=$(gcloud run services describe bartab-backend --platform=managed --region=$REGION --format="value(status.url)")
CURRENT_FRONTEND=$(gcloud run services describe bartab-frontend --platform=managed --region=$REGION --format="value(status.url)")

echo "📊 URLs Atuais:"
echo "   Backend:  $CURRENT_BACKEND"
echo "   Frontend: $CURRENT_FRONTEND"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "⚠️  AÇÃO NECESSÁRIA NO GOOGLE CLOUD CONSOLE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🔐 ATUALIZE AS CREDENCIAIS OAUTH:"
echo ""
echo "1. Acesse: https://console.cloud.google.com/apis/credentials?project=$PROJECT_ID"
echo ""
echo "2. Clique nas suas credenciais OAuth 2.0"
echo ""
echo "3. Em 'URIs de redirecionamento autorizadas', ADICIONE (não remova as antigas):"
echo ""
echo -e "   ${YELLOW}${CALLBACK_URL}${NC}"
echo ""
echo "4. Em 'Origens JavaScript autorizadas', ADICIONE:"
echo ""
echo -e "   ${YELLOW}${FRONTEND_URL}${NC}"
echo ""
echo "5. Clique em SALVAR"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

read -p "Você já configurou as credenciais OAuth? (s/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Ss]$ ]]; then
    echo ""
    echo -e "${YELLOW}⚠️  Configure primeiro no Google Cloud Console${NC}"
    echo "   Execute este script novamente depois."
    echo ""
    echo "📋 URLs para copiar:"
    echo "   Callback: $CALLBACK_URL"
    echo "   Frontend: $FRONTEND_URL"
    exit 0
fi

echo ""
echo "🔄 Atualizando variáveis de ambiente no Backend..."
echo ""

# Atualizar backend
gcloud run services update bartab-backend \
    --platform=managed \
    --region=$REGION \
    --update-env-vars="GOOGLE_CALLBACK_URL=${CALLBACK_URL},FRONTEND_URL=${FRONTEND_URL},CORS_ORIGIN=${FRONTEND_URL}" \
    --quiet

echo ""
echo -e "${GREEN}✅ Backend atualizado!${NC}"
echo ""

# Verificar se frontend precisa de atualização de variáveis
echo "🔍 Verificando configuração do Frontend..."
FRONTEND_ENV=$(gcloud run services describe bartab-frontend --platform=managed --region=$REGION --format="yaml" | grep -A 5 "env:" || echo "")

if echo "$FRONTEND_ENV" | grep -q "VITE_API_BASE_URL"; then
    echo ""
    echo "🔄 Atualizando variáveis de ambiente no Frontend..."
    
    gcloud run services update bartab-frontend \
        --platform=managed \
        --region=$REGION \
        --update-env-vars="VITE_API_BASE_URL=${BACKEND_URL}/api" \
        --quiet
    
    echo -e "${GREEN}✅ Frontend atualizado!${NC}"
else
    echo -e "${YELLOW}⚠️  Frontend usa build-time env vars (variáveis definidas no Dockerfile)${NC}"
    echo "   Se o login não funcionar, você precisará rebuildar o frontend com:"
    echo ""
    echo "   VITE_API_BASE_URL=${BACKEND_URL}/api"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ CONFIGURAÇÃO CONCLUÍDA!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🧪 TESTE AGORA:"
echo ""
echo "1. Abra: $FRONTEND_URL"
echo "2. Abra o Console do navegador (F12)"
echo "3. Clique em 'Entrar com Google'"
echo "4. Deve funcionar! 🎉"
echo ""
echo "❓ Se ainda não funcionar:"
echo "   • Aguarde 1-2 minutos (propagação)"
echo "   • Limpe o cache (Cmd+Shift+R)"
echo "   • Tente em aba anônima"
echo "   • Veja os logs: gcloud run services logs read bartab-backend --limit=50"
echo ""
echo "📊 Verificar configuração atual:"
echo "   gcp/scripts/verificar-config.sh"
echo ""


