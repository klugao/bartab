#!/bin/bash

# Script para corrigir configuração do Google OAuth no Cloud Run
# Execute este script após configurar as credenciais no Google Cloud Console

set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🔧 Configurando Google OAuth no Cloud Run..."
echo ""

# Obter project ID
PROJECT_ID=$(gcloud config get-value project 2>/dev/null)
if [ -z "$PROJECT_ID" ]; then
    echo "❌ Erro: Projeto GCP não configurado"
    echo "Execute: gcloud config set project SEU_PROJECT_ID"
    exit 1
fi

echo "📦 Projeto: $PROJECT_ID"
echo ""

# Obter URLs dos serviços
echo "🔍 Obtendo URLs dos serviços..."
BACKEND_URL=$(gcloud run services describe bartab-backend --platform=managed --format="value(status.url)" 2>/dev/null || echo "")
FRONTEND_URL=$(gcloud run services describe bartab-frontend --platform=managed --format="value(status.url)" 2>/dev/null || echo "")

if [ -z "$BACKEND_URL" ]; then
    echo "❌ Erro: Serviço bartab-backend não encontrado"
    echo ""
    echo "Serviços disponíveis:"
    gcloud run services list --format="table(name,region,status.url)"
    exit 1
fi

echo "✅ Backend URL: $BACKEND_URL"
echo "✅ Frontend URL: $FRONTEND_URL"
echo ""

# Construir callback URL
CALLBACK_URL="${BACKEND_URL}/api/auth/google/callback"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 CONFIGURAÇÃO NECESSÁRIA NO GOOGLE CLOUD CONSOLE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. Acesse: https://console.cloud.google.com/apis/credentials"
echo "2. Clique nas suas credenciais OAuth 2.0"
echo "3. Em 'URIs de redirecionamento autorizadas', adicione:"
echo ""
echo "   $CALLBACK_URL"
echo ""
echo "4. (Opcional) Em 'Origens JavaScript autorizadas', adicione:"
echo ""
echo "   $FRONTEND_URL"
echo ""
echo "5. Clique em SALVAR"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

read -p "Você já configurou isso no Google Cloud Console? (s/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Ss]$ ]]; then
    echo ""
    echo "⚠️  Por favor, configure primeiro no Google Cloud Console e execute este script novamente."
    exit 0
fi

echo ""
echo "🔄 Atualizando variáveis de ambiente no Cloud Run..."
echo ""

# Atualizar backend com as URLs corretas
gcloud run services update bartab-backend \
    --platform=managed \
    --update-env-vars="GOOGLE_CALLBACK_URL=$CALLBACK_URL,FRONTEND_URL=$FRONTEND_URL,CORS_ORIGIN=$FRONTEND_URL"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Configuração concluída!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🧪 Teste agora:"
echo "   1. Abra: $FRONTEND_URL"
echo "   2. Clique em 'Entrar com Google'"
echo "   3. Deve funcionar! 🎉"
echo ""
echo "❓ Se ainda não funcionar:"
echo "   1. Aguarde 1-2 minutos (propagação das mudanças)"
echo "   2. Limpe o cache do navegador (Cmd+Shift+R)"
echo "   3. Tente em uma aba anônima"
echo ""


