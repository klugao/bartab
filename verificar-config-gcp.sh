#!/bin/bash

# Script para verificar e corrigir a configuração do Google OAuth no GCP
# Execute este script para diagnosticar o problema

echo "🔍 Verificando configuração do BarTab no GCP..."
echo ""

# 1. Verificar URL do backend
echo "1️⃣ URL do Backend:"
BACKEND_URL=$(gcloud run services describe bartab-backend --region=us-central1 --format='value(status.url)' 2>/dev/null)
if [ -z "$BACKEND_URL" ]; then
    echo "   ❌ Erro ao obter URL do backend"
    echo "   Execute: gcloud config set project SEU_PROJECT_ID"
    exit 1
else
    echo "   ✅ $BACKEND_URL"
fi
echo ""

# 2. Verificar URL do frontend
echo "2️⃣ URL do Frontend:"
FRONTEND_URL=$(gcloud run services describe bartab-frontend --region=us-central1 --format='value(status.url)' 2>/dev/null)
if [ -z "$FRONTEND_URL" ]; then
    echo "   ❌ Erro ao obter URL do frontend"
else
    echo "   ✅ $FRONTEND_URL"
fi
echo ""

# 3. Verificar variáveis de ambiente do backend
echo "3️⃣ Variáveis de Ambiente Críticas:"
echo ""
echo "   GOOGLE_CALLBACK_URL atual:"
CALLBACK_URL=$(gcloud run services describe bartab-backend --region=us-central1 --format='value(spec.template.spec.containers[0].env[?(@.name=="GOOGLE_CALLBACK_URL")].value)' 2>/dev/null)
echo "   $CALLBACK_URL"
echo ""

echo "   FRONTEND_URL atual:"
FRONTEND_ENV=$(gcloud run services describe bartab-backend --region=us-central1 --format='value(spec.template.spec.containers[0].env[?(@.name=="FRONTEND_URL")].value)' 2>/dev/null)
echo "   $FRONTEND_ENV"
echo ""

echo "   CORS_ORIGIN atual:"
CORS_ORIGIN=$(gcloud run services describe bartab-backend --region=us-central1 --format='value(spec.template.spec.containers[0].env[?(@.name=="CORS_ORIGIN")].value)' 2>/dev/null)
echo "   $CORS_ORIGIN"
echo ""

# 4. Valores corretos esperados
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Valores que DEVEM estar configurados:"
echo ""
echo "No Google Cloud Console (https://console.cloud.google.com/apis/credentials):"
echo "   URI de redirecionamento: $BACKEND_URL/api/auth/google/callback"
echo ""
echo "No Cloud Run (variáveis de ambiente):"
echo "   GOOGLE_CALLBACK_URL=$BACKEND_URL/api/auth/google/callback"
echo "   FRONTEND_URL=$FRONTEND_URL"
echo "   CORS_ORIGIN=$FRONTEND_URL"
echo ""

# 5. Comandos para corrigir
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 Para corrigir as variáveis de ambiente, execute:"
echo ""
echo "gcloud run services update bartab-backend \\"
echo "  --region=us-central1 \\"
echo "  --update-env-vars GOOGLE_CALLBACK_URL=$BACKEND_URL/api/auth/google/callback,FRONTEND_URL=$FRONTEND_URL,CORS_ORIGIN=$FRONTEND_URL"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

