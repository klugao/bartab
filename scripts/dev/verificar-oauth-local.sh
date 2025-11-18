#!/bin/bash

# Script para verificar e configurar OAuth localmente
# Uso: scripts/dev/verificar-oauth-local.sh

set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$(cd "$DIR/../../backend" && pwd)"

echo "🔍 Verificando configuração OAuth local..."
echo ""

# Verificar se o arquivo .env existe
if [ ! -f "$BACKEND_DIR/.env" ]; then
    echo "❌ Arquivo .env não encontrado em $BACKEND_DIR"
    echo ""
    echo "📝 Criando arquivo .env a partir do exemplo..."
    cp "$BACKEND_DIR/env.example" "$BACKEND_DIR/.env"
    echo "✅ Arquivo .env criado. Por favor, edite-o com suas credenciais OAuth."
    exit 1
fi

# Verificar variáveis OAuth
echo "📋 Verificando variáveis OAuth no .env..."
echo ""

GOOGLE_CLIENT_ID=$(grep "^GOOGLE_CLIENT_ID=" "$BACKEND_DIR/.env" | cut -d '=' -f2- | tr -d '"' | tr -d "'" || echo "")
GOOGLE_CLIENT_SECRET=$(grep "^GOOGLE_CLIENT_SECRET=" "$BACKEND_DIR/.env" | cut -d '=' -f2- | tr -d '"' | tr -d "'" || echo "")
GOOGLE_CALLBACK_URL=$(grep "^GOOGLE_CALLBACK_URL=" "$BACKEND_DIR/.env" | cut -d '=' -f2- | tr -d '"' | tr -d "'" || echo "")

# Verificar se as variáveis estão definidas
if [ -z "$GOOGLE_CLIENT_ID" ] || [ "$GOOGLE_CLIENT_ID" = "your-google-client-id" ]; then
    echo "❌ GOOGLE_CLIENT_ID não está configurado ou está com valor padrão"
    echo "   Valor atual: ${GOOGLE_CLIENT_ID:-'(não definido)'}"
    echo ""
    NEEDS_CONFIG=true
else
    if [[ "$GOOGLE_CLIENT_ID" == *".apps.googleusercontent.com"* ]]; then
        echo "✅ GOOGLE_CLIENT_ID está configurado: ${GOOGLE_CLIENT_ID:0:50}..."
    else
        echo "⚠️  GOOGLE_CLIENT_ID parece estar incorreto (deve terminar com .apps.googleusercontent.com)"
        echo "   Valor atual: $GOOGLE_CLIENT_ID"
        echo ""
        NEEDS_CONFIG=true
    fi
fi

if [ -z "$GOOGLE_CLIENT_SECRET" ] || [ "$GOOGLE_CLIENT_SECRET" = "your-google-client-secret" ]; then
    echo "❌ GOOGLE_CLIENT_SECRET não está configurado ou está com valor padrão"
    echo ""
    NEEDS_CONFIG=true
else
    echo "✅ GOOGLE_CLIENT_SECRET está configurado"
fi

if [ -z "$GOOGLE_CALLBACK_URL" ] || [ "$GOOGLE_CALLBACK_URL" != "http://localhost:3000/api/auth/google/callback" ]; then
    echo "⚠️  GOOGLE_CALLBACK_URL não está configurado corretamente para desenvolvimento local"
    echo "   Valor atual: ${GOOGLE_CALLBACK_URL:-'(não definido)'}"
    echo "   Deve ser: http://localhost:3000/api/auth/google/callback"
    echo ""
    NEEDS_CONFIG=true
else
    echo "✅ GOOGLE_CALLBACK_URL está configurado corretamente: $GOOGLE_CALLBACK_URL"
fi

echo ""

if [ "$NEEDS_CONFIG" = true ]; then
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🔧 CONFIGURAÇÃO NECESSÁRIA"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "Para configurar o OAuth localmente:"
    echo ""
    echo "1. Acesse: https://console.cloud.google.com/apis/credentials"
    echo "2. Selecione o projeto: bartab-475300"
    echo "3. Crie um novo 'ID do cliente OAuth' ou use um existente"
    echo "4. Configure as URIs de redirecionamento:"
    echo "   http://localhost:3000/api/auth/google/callback"
    echo "5. Copie o Client ID e Client Secret"
    echo "6. Edite o arquivo: $BACKEND_DIR/.env"
    echo ""
    echo "Ou consulte o guia completo:"
    echo "   docs/OAUTH_LOCAL_SETUP.md"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    exit 1
else
    echo "✅ Todas as variáveis OAuth estão configuradas!"
    echo ""
    echo "💡 Dica: Se ainda estiver com erro 'deleted_client', verifique se:"
    echo "   1. O cliente OAuth existe no Google Cloud Console"
    echo "   2. A URI de callback está configurada corretamente no Console"
    echo "   3. O backend foi reiniciado após atualizar o .env"
    echo ""
    exit 0
fi

