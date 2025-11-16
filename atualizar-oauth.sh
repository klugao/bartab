#!/bin/bash

# Script para atualizar credenciais OAuth do Google
# Uso: ./atualizar-oauth.sh

set -e

echo "🔑 Atualização das Credenciais OAuth do Google"
echo "=============================================="
echo ""

PROJECT_ID="bartab-475300"

# Verificar se gcloud está instalado
if ! command -v gcloud &> /dev/null; then
    echo "❌ gcloud não encontrado. Instale o Google Cloud SDK:"
    echo "   https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Verificar autenticação
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" &>/dev/null; then
    echo "❌ Você não está logado no gcloud"
    echo "Execute: gcloud auth login"
    exit 1
fi

echo "📋 Projeto: $PROJECT_ID"
echo ""
echo "Por favor, cole as credenciais que você obteve no Google Cloud Console:"
echo ""

# GOOGLE_CLIENT_ID
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📌 GOOGLE_CLIENT_ID"
echo "   (O Client ID termina com .apps.googleusercontent.com)"
read -p "   Digite o Client ID: " GOOGLE_CLIENT_ID
echo ""

if [ -z "$GOOGLE_CLIENT_ID" ]; then
    echo "❌ Client ID não pode estar vazio!"
    exit 1
fi

# GOOGLE_CLIENT_SECRET
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📌 GOOGLE_CLIENT_SECRET"
echo "   (O Client Secret é uma string aleatória)"
read -sp "   Digite o Client Secret (entrada oculta): " GOOGLE_CLIENT_SECRET
echo ""
echo ""

if [ -z "$GOOGLE_CLIENT_SECRET" ]; then
    echo "❌ Client Secret não pode estar vazio!"
    exit 1
fi

# Atualizar secrets
echo "🔄 Atualizando secrets no Secret Manager..."
echo ""

echo "$GOOGLE_CLIENT_ID" | gcloud secrets versions add bartab-google-client-id \
    --data-file=- \
    --project=$PROJECT_ID

echo "✅ GOOGLE_CLIENT_ID atualizado"

echo "$GOOGLE_CLIENT_SECRET" | gcloud secrets versions add bartab-google-client-secret \
    --data-file=- \
    --project=$PROJECT_ID

echo "✅ GOOGLE_CLIENT_SECRET atualizado"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Secrets atualizados com sucesso!"
echo ""
echo "📝 Próximos passos:"
echo "   1. Fazer um novo deploy do backend:"
echo "      cd gcp/scripts"
echo "      ./deploy.sh"
echo ""
echo "   2. Ou reiniciar o serviço para carregar os novos secrets:"
echo "      gcloud run services update bartab-backend --region=us-central1 --project=$PROJECT_ID"
echo ""
echo "⚠️  IMPORTANTE: Certifique-se de que no Google Cloud Console"
echo "   as seguintes URLs estão configuradas:"
echo ""
echo "   Authorized JavaScript origins:"
echo "   → https://bartab-frontend-312426210115.us-central1.run.app"
echo ""
echo "   Authorized redirect URIs:"
echo "   → https://bartab-backend-312426210115.us-central1.run.app/api/auth/google/callback"
echo ""

