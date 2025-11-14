#!/bin/bash

# Script para atualizar secrets no Secret Manager
# Este script ajuda a configurar os valores secretos de forma segura

set -e

echo "🔒 Atualização de Secrets - BarTab"
echo "=================================="
echo ""

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

# Obter projeto atual
PROJECT_ID=$(gcloud config get-value project)

if [ -z "$PROJECT_ID" ]; then
    echo -e "${RED}❌ Nenhum projeto configurado${NC}"
    echo "Execute: gcloud config set project SEU_PROJECT_ID"
    exit 1
fi

echo "📋 Projeto: $PROJECT_ID"
echo ""

# Função para atualizar secret
update_secret() {
    local secret_id=$1
    local description=$2
    local secret_value
    
    echo ""
    echo "🔑 $description"
    echo "   Secret ID: $secret_id"
    read -sp "   Digite o valor (entrada oculta): " secret_value
    echo ""
    
    if [ -z "$secret_value" ]; then
        echo -e "${YELLOW}⚠️  Valor vazio, pulando...${NC}"
        return
    fi
    
    echo "$secret_value" | gcloud secrets versions add $secret_id \
        --data-file=- \
        --project=$PROJECT_ID
    
    echo -e "${GREEN}✅ Secret $secret_id atualizado${NC}"
}

echo "Digite os valores dos secrets. Pressione Enter sem digitar para pular."
echo ""

# DATABASE_URL
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📌 DATABASE_URL"
echo "   Formato: postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
echo "   Exemplo para Cloud SQL:"
echo "   postgresql://bartab:SUA_SENHA@/bartab_production?host=/cloudsql/PROJECT:REGION:INSTANCE"
update_secret "bartab-database-url" "DATABASE_URL"

# JWT_SECRET
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📌 JWT_SECRET"
echo "   Use uma string longa e aleatória"
echo "   Exemplo: $(openssl rand -base64 32)"
update_secret "bartab-jwt-secret" "JWT_SECRET"

# GOOGLE_CLIENT_ID
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📌 GOOGLE_CLIENT_ID"
echo "   Obtenha em: https://console.cloud.google.com/apis/credentials"
update_secret "bartab-google-client-id" "GOOGLE_CLIENT_ID"

# GOOGLE_CLIENT_SECRET
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📌 GOOGLE_CLIENT_SECRET"
echo "   Obtenha em: https://console.cloud.google.com/apis/credentials"
update_secret "bartab-google-client-secret" "GOOGLE_CLIENT_SECRET"

# SMTP_USER
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📌 SMTP_USER"
echo "   Email para envio (ex: seu-email@gmail.com)"
update_secret "bartab-smtp-user" "SMTP_USER"

# SMTP_PASS
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📌 SMTP_PASS"
echo "   Para Gmail, use 'Senhas de app': https://myaccount.google.com/apppasswords"
update_secret "bartab-smtp-pass" "SMTP_PASS"

echo ""
echo -e "${GREEN}=========================================="
echo "✅ Secrets atualizados com sucesso!"
echo "==========================================${NC}"
echo ""
echo "📝 Para verificar os secrets:"
echo "   gcloud secrets list --project=$PROJECT_ID"
echo ""

