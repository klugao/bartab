#!/bin/bash

# Script para verificar a configuração atual do OAuth e URLs
set -e

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 VERIFICAÇÃO DE CONFIGURAÇÃO - BarTab"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Obter informações do projeto
PROJECT_ID=$(gcloud config get-value project 2>/dev/null)
PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format="value(projectNumber)" 2>/dev/null)
REGION="us-central1"

echo "📦 Projeto"
echo "   ID:     $PROJECT_ID"
echo "   Number: $PROJECT_NUMBER"
echo "   Region: $REGION"
echo ""

# Verificar serviços
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 Serviços Cloud Run"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

BACKEND_URL=$(gcloud run services describe bartab-backend --platform=managed --region=$REGION --format="value(status.url)" 2>/dev/null || echo "")
FRONTEND_URL=$(gcloud run services describe bartab-frontend --platform=managed --region=$REGION --format="value(status.url)" 2>/dev/null || echo "")

if [ -n "$BACKEND_URL" ]; then
    echo -e "${GREEN}✅ Backend${NC}"
    echo "   URL: $BACKEND_URL"
    
    # Testar health
    HEALTH=$(curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL/api/health" 2>/dev/null || echo "000")
    if [ "$HEALTH" = "200" ]; then
        echo -e "   Status: ${GREEN}ONLINE${NC} (HTTP $HEALTH)"
    else
        echo -e "   Status: ${RED}OFFLINE${NC} (HTTP $HEALTH)"
    fi
else
    echo -e "${RED}❌ Backend não encontrado${NC}"
fi

echo ""

if [ -n "$FRONTEND_URL" ]; then
    echo -e "${GREEN}✅ Frontend${NC}"
    echo "   URL: $FRONTEND_URL"
    
    # Testar frontend
    FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_URL" 2>/dev/null || echo "000")
    if [ "$FRONTEND_STATUS" = "200" ]; then
        echo -e "   Status: ${GREEN}ONLINE${NC} (HTTP $FRONTEND_STATUS)"
    else
        echo -e "   Status: ${RED}OFFLINE${NC} (HTTP $FRONTEND_STATUS)"
    fi
else
    echo -e "${RED}❌ Frontend não encontrado${NC}"
fi

echo ""

# Variáveis de ambiente do Backend
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "⚙️  Variáveis de Ambiente - Backend"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ -n "$BACKEND_URL" ]; then
    BACKEND_ENV=$(gcloud run services describe bartab-backend --platform=managed --region=$REGION --format="yaml" | grep -A 50 "env:" | grep -E "name:|value:" | head -30)
    
    # Extrair variáveis importantes
    CALLBACK=$(echo "$BACKEND_ENV" | grep -A 1 "GOOGLE_CALLBACK_URL" | grep "value:" | awk '{print $2}' || echo "NÃO DEFINIDO")
    FRONTEND_ENV_VAR=$(echo "$BACKEND_ENV" | grep -A 1 "FRONTEND_URL" | grep "value:" | awk '{print $2}' || echo "NÃO DEFINIDO")
    CORS=$(echo "$BACKEND_ENV" | grep -A 1 "CORS_ORIGIN" | grep "value:" | awk '{print $2}' || echo "NÃO DEFINIDO")
    
    echo "   GOOGLE_CALLBACK_URL: $CALLBACK"
    echo "   FRONTEND_URL:        $FRONTEND_ENV_VAR"
    echo "   CORS_ORIGIN:         $CORS"
    
    # Verificar se está correto
    EXPECTED_CALLBACK="${BACKEND_URL}/api/auth/google/callback"
    
    echo ""
    if [ "$CALLBACK" = "$EXPECTED_CALLBACK" ]; then
        echo -e "   ${GREEN}✅ Callback URL está correto${NC}"
    else
        echo -e "   ${RED}❌ Callback URL está incorreto${NC}"
        echo -e "   ${YELLOW}   Esperado: $EXPECTED_CALLBACK${NC}"
        echo -e "   ${YELLOW}   Atual:    $CALLBACK${NC}"
    fi
    
    if [ "$FRONTEND_ENV_VAR" = "$FRONTEND_URL" ]; then
        echo -e "   ${GREEN}✅ Frontend URL está correto${NC}"
    else
        echo -e "   ${YELLOW}⚠️  Frontend URL pode estar desatualizado${NC}"
        echo -e "   ${YELLOW}   Esperado: $FRONTEND_URL${NC}"
        echo -e "   ${YELLOW}   Atual:    $FRONTEND_ENV_VAR${NC}"
    fi
fi

echo ""

# Secrets
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔐 Secrets Manager"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

SECRETS=("bartab-google-client-id" "bartab-google-client-secret" "bartab-jwt-secret" "bartab-database-url")

for secret in "${SECRETS[@]}"; do
    EXISTS=$(gcloud secrets describe $secret --format="value(name)" 2>/dev/null || echo "")
    if [ -n "$EXISTS" ]; then
        echo -e "   ${GREEN}✅${NC} $secret"
    else
        echo -e "   ${RED}❌${NC} $secret (não encontrado)"
    fi
done

# Verificar valor do Client ID (primeiros caracteres)
CLIENT_ID=$(gcloud secrets versions access latest --secret="bartab-google-client-id" 2>/dev/null || echo "")
if [ -n "$CLIENT_ID" ]; then
    CLIENT_ID_PREFIX=$(echo "$CLIENT_ID" | cut -c1-20)
    echo ""
    echo "   Client ID: ${CLIENT_ID_PREFIX}..."
    
    if [ "$CLIENT_ID" = "placeholder" ] || [ "$CLIENT_ID" = "your-google-client-id" ]; then
        echo -e "   ${RED}⚠️  Client ID parece ser placeholder!${NC}"
    fi
fi

echo ""

# OAuth Console
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔐 Google OAuth - Verificação Manual"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Verifique se estas URLs estão configuradas em:"
echo -e "${BLUE}https://console.cloud.google.com/apis/credentials?project=$PROJECT_ID${NC}"
echo ""
echo "URIs de redirecionamento autorizadas:"
echo -e "   ${YELLOW}${BACKEND_URL}/api/auth/google/callback${NC}"
echo ""
echo "Origens JavaScript autorizadas:"
echo -e "   ${YELLOW}${FRONTEND_URL}${NC}"
echo ""

# Formato da URL
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Formato das URLs"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [[ $BACKEND_URL == *"$PROJECT_NUMBER"* ]]; then
    echo -e "   ${GREEN}✅ Formato novo:${NC} [service]-[project-number].[region].run.app"
    echo "   Este é o formato atual do Cloud Run"
else
    echo -e "   ${YELLOW}⚠️  Formato antigo:${NC} [service]-[hash]-[region].a.run.app"
    echo "   Considere redeploy para migrar para o novo formato"
fi

echo ""

# Resumo
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Ações Recomendadas"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ "$CALLBACK" != "$EXPECTED_CALLBACK" ]; then
    echo -e "${YELLOW}1.${NC} Atualizar variáveis de ambiente:"
    echo "   ./atualizar-urls.sh"
    echo ""
fi

if [ "$CLIENT_ID" = "placeholder" ] || [ "$CLIENT_ID" = "your-google-client-id" ]; then
    echo -e "${YELLOW}2.${NC} Configurar credenciais OAuth reais:"
    echo "   ./fix-oauth.sh"
    echo ""
fi

echo -e "${YELLOW}3.${NC} Verificar configuração no Google Cloud Console:"
echo "   https://console.cloud.google.com/apis/credentials?project=$PROJECT_ID"
echo ""

echo -e "${YELLOW}4.${NC} Testar login:"
echo "   Abra: $FRONTEND_URL"
echo "   Clique em 'Entrar com Google'"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

