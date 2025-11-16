#!/bin/bash

# Script para atualizar as credenciais OAuth do Google no GCP
# Este script já tem as credenciais corretas

set -e

PROJECT_ID="bartab-475300"
CLIENT_ID="REDACTED"
CLIENT_SECRET="REDACTED"

echo "🔑 Atualizando Credenciais OAuth do Google"
echo "=========================================="
echo ""
echo "📋 Projeto: $PROJECT_ID"
echo ""

# Verificar se gcloud está instalado
if ! command -v gcloud &> /dev/null; then
    echo "❌ gcloud não encontrado!"
    echo ""
    echo "Por favor, instale o Google Cloud SDK primeiro:"
    echo "   ./instalar-gcloud.sh"
    echo ""
    echo "Ou manualmente:"
    echo "   curl https://sdk.cloud.google.com | bash"
    echo "   exec -l \$SHELL"
    echo "   gcloud auth login"
    echo "   gcloud config set project $PROJECT_ID"
    exit 1
fi

# Verificar autenticação
echo "🔍 Verificando autenticação..."
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" &>/dev/null; then
    echo "❌ Você não está logado no gcloud"
    echo ""
    echo "Execute: gcloud auth login"
    exit 1
fi

echo "✅ Autenticado"
echo ""

# Atualizar GOOGLE_CLIENT_ID
echo "🔄 Atualizando GOOGLE_CLIENT_ID..."
echo "$CLIENT_ID" | gcloud secrets versions add bartab-google-client-id \
    --data-file=- \
    --project=$PROJECT_ID 2>/dev/null || {
    echo "⚠️  Secret 'bartab-google-client-id' não existe. Criando..."
    echo "$CLIENT_ID" | gcloud secrets create bartab-google-client-id \
        --data-file=- \
        --project=$PROJECT_ID
}
echo "✅ GOOGLE_CLIENT_ID atualizado"

# Atualizar GOOGLE_CLIENT_SECRET
echo "🔄 Atualizando GOOGLE_CLIENT_SECRET..."
echo "$CLIENT_SECRET" | gcloud secrets versions add bartab-google-client-secret \
    --data-file=- \
    --project=$PROJECT_ID 2>/dev/null || {
    echo "⚠️  Secret 'bartab-google-client-secret' não existe. Criando..."
    echo "$CLIENT_SECRET" | gcloud secrets create bartab-google-client-secret \
        --data-file=- \
        --project=$PROJECT_ID
}
echo "✅ GOOGLE_CLIENT_SECRET atualizado"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Secrets atualizados com sucesso!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📝 Próximo passo: Reiniciar o backend"
echo ""
echo "Execute:"
echo "   gcloud run services update bartab-backend \\"
echo "     --region=us-central1 \\"
echo "     --project=$PROJECT_ID"
echo ""
echo "Ou simplesmente:"
echo "   ./reiniciar-backend.sh"
echo ""

