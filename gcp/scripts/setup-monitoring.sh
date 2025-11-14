#!/bin/bash
# Script para configurar monitoramento gratuito do GCP
# Configura Uptime Checks e Alertas básicos

set -e

PROJECT_ID=$(gcloud config get-value project 2>/dev/null || echo "")
REGION="us-central1"
BACKEND_SERVICE="bartab-backend"
FRONTEND_SERVICE="bartab-frontend"

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}╔════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║  Setup de Monitoramento Gratuito - BarTab GCP     ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════╝${NC}"
echo ""

# Verificar projeto
if [ -z "$PROJECT_ID" ]; then
    echo -e "${RED}✗ Projeto GCP não configurado!${NC}"
    echo "Execute: gcloud config set project SEU_PROJECT_ID"
    exit 1
fi

echo -e "${GREEN}✓ Projeto: $PROJECT_ID${NC}"
echo ""

# Obter URLs dos serviços
echo "🔍 Buscando URLs dos serviços..."
BACKEND_URL=$(gcloud run services describe $BACKEND_SERVICE \
    --region=$REGION \
    --format="value(status.url)" 2>/dev/null || echo "")

FRONTEND_URL=$(gcloud run services describe $FRONTEND_SERVICE \
    --region=$REGION \
    --format="value(status.url)" 2>/dev/null || echo "")

if [ -z "$BACKEND_URL" ]; then
    echo -e "${YELLOW}⚠ Backend não encontrado. Pulando configuração do backend.${NC}"
else
    echo -e "${GREEN}✓ Backend: $BACKEND_URL${NC}"
fi

if [ -z "$FRONTEND_URL" ]; then
    echo -e "${YELLOW}⚠ Frontend não encontrado. Pulando configuração do frontend.${NC}"
else
    echo -e "${GREEN}✓ Frontend: $FRONTEND_URL${NC}"
fi

echo ""

# Função para criar uptime check
create_uptime_check() {
    local NAME=$1
    local HOST=$2
    local PATH=$3
    
    echo "📊 Criando Uptime Check: $NAME"
    
    # Verificar se já existe
    EXISTING=$(gcloud monitoring uptime list --filter="displayName=$NAME" --format="value(name)" 2>/dev/null || echo "")
    
    if [ -n "$EXISTING" ]; then
        echo -e "${YELLOW}  ⚠ Uptime check '$NAME' já existe. Pulando.${NC}"
        return
    fi
    
    # Criar uptime check
    gcloud alpha monitoring uptime create $NAME \
        --resource-type=uptime-url \
        --host="$HOST" \
        --path="$PATH" \
        --check-interval=60 \
        --timeout=10 \
        --display-name="$NAME" 2>/dev/null || {
            echo -e "${YELLOW}  ⚠ Não foi possível criar uptime check (pode precisar habilitar API)${NC}"
            return
        }
    
    echo -e "${GREEN}  ✓ Uptime check criado com sucesso!${NC}"
}

# Criar uptime checks
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 CONFIGURANDO UPTIME CHECKS (Gratuito até 100 checks)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ -n "$BACKEND_URL" ]; then
    BACKEND_HOST=$(echo "$BACKEND_URL" | sed 's|https://||' | sed 's|/.*||')
    create_uptime_check "bartab-backend-health" "$BACKEND_HOST" "/api/health"
fi

if [ -n "$FRONTEND_URL" ]; then
    FRONTEND_HOST=$(echo "$FRONTEND_URL" | sed 's|https://||' | sed 's|/.*||')
    create_uptime_check "bartab-frontend-health" "$FRONTEND_HOST" "/"
fi

echo ""

# Criar canal de notificação por email
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📧 CONFIGURANDO CANAL DE NOTIFICAÇÃO"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

read -p "Digite seu email para receber alertas (Enter para pular): " USER_EMAIL

if [ -n "$USER_EMAIL" ]; then
    echo "Criando canal de notificação..."
    
    # Criar arquivo temporário com a configuração
    cat > /tmp/notification-channel.json <<EOF
{
  "type": "email",
  "displayName": "BarTab Admin Email",
  "labels": {
    "email_address": "$USER_EMAIL"
  },
  "enabled": true
}
EOF
    
    gcloud alpha monitoring channels create \
        --channel-content-from-file=/tmp/notification-channel.json 2>/dev/null && {
        echo -e "${GREEN}✓ Canal de notificação criado!${NC}"
        echo -e "${YELLOW}  ⚠ Verifique seu email e confirme a inscrição.${NC}"
    } || {
        echo -e "${YELLOW}⚠ Não foi possível criar canal (pode já existir ou API não habilitada)${NC}"
    }
    
    rm /tmp/notification-channel.json
else
    echo -e "${YELLOW}⚠ Pulando criação de canal de notificação${NC}"
fi

echo ""

# Informações finais
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ CONFIGURAÇÃO CONCLUÍDA!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 Ferramentas gratuitas configuradas:"
echo "   • Uptime Checks (verifica disponibilidade a cada 60s)"
echo "   • Cloud Logging (150MB/mês grátis)"
echo "   • Cloud Monitoring (métricas básicas)"
echo "   • Error Reporting (gratuito)"
echo ""
echo "🔧 Próximos passos:"
echo ""
echo "1. Ver status atual:"
echo "   ./monitor.sh status"
echo ""
echo "2. Monitorar logs em tempo real:"
echo "   ./monitor.sh logs"
echo ""
echo "3. Ver erros recentes:"
echo "   ./monitor.sh errors"
echo ""
echo "4. Health check:"
echo "   ./monitor.sh health"
echo ""
echo "5. Visão completa:"
echo "   ./monitor.sh all"
echo ""
echo "6. Modo contínuo (atualiza automaticamente):"
echo "   ./monitor.sh watch"
echo ""
echo "📈 Acessar dashboards no console:"
echo "   https://console.cloud.google.com/monitoring/dashboards?project=$PROJECT_ID"
echo ""
echo "📊 Ver uptime checks:"
echo "   https://console.cloud.google.com/monitoring/uptime?project=$PROJECT_ID"
echo ""
echo "🔥 Ver logs:"
echo "   https://console.cloud.google.com/logs?project=$PROJECT_ID"
echo ""
echo "⚠️  Ver erros:"
echo "   https://console.cloud.google.com/errors?project=$PROJECT_ID"
echo ""

