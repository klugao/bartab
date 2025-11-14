#!/bin/bash

# Script para monitorar deploys no GCP
# Mostra status de builds e serviços em tempo real

set -e

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

PROJECT_ID=$(gcloud config get-value project 2>/dev/null)

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Monitor de Deploys - BarTab"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Projeto: $PROJECT_ID"
echo ""

# Menu
echo "Escolha uma opção:"
echo ""
echo "  1) Ver últimos builds"
echo "  2) Acompanhar build em tempo real"
echo "  3) Ver status dos serviços"
echo "  4) Ver logs do backend"
echo "  5) Ver logs do frontend"
echo "  6) Monitoramento completo (tudo)"
echo "  7) Abrir Cloud Build no navegador"
echo "  8) Abrir Cloud Run no navegador"
echo ""
read -p "Opção [1-8]: " OPTION

case $OPTION in
  1)
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}📦 Últimos 10 Builds${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    
    gcloud builds list --limit=10 --format="table(
      id,
      status,
      source.repoSource.branchName,
      createTime.date('%Y-%m-%d %H:%M:%S'),
      duration()
    )"
    ;;
    
  2)
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}📡 Acompanhando Build em Tempo Real${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    
    # Ver se tem build em andamento
    ONGOING=$(gcloud builds list --ongoing --limit=1 --format="value(id)")
    
    if [ -z "$ONGOING" ]; then
      echo -e "${YELLOW}⚠️  Nenhum build em andamento${NC}"
      echo ""
      echo "Último build:"
      LAST_BUILD=$(gcloud builds list --limit=1 --format="value(id)")
      gcloud builds describe $LAST_BUILD
    else
      echo -e "${GREEN}✅ Build em andamento: $ONGOING${NC}"
      echo ""
      echo "Logs em tempo real (Ctrl+C para sair):"
      echo ""
      gcloud builds log --stream $ONGOING
    fi
    ;;
    
  3)
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}☁️  Status dos Serviços Cloud Run${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    
    gcloud run services list --platform=managed --format="table(
      metadata.name:label=SERVICE,
      status.url:label=URL,
      status.latestReadyRevisionName:label=LATEST_REVISION,
      metadata.creationTimestamp.date('%Y-%m-%d %H:%M'):label=CREATED
    )"
    
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}🔍 Health Checks${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    
    BACKEND_URL=$(gcloud run services describe bartab-backend --region=us-central1 --format="value(status.url)")
    FRONTEND_URL=$(gcloud run services describe bartab-frontend --region=us-central1 --format="value(status.url)")
    
    echo -n "Backend:  "
    if curl -sf "$BACKEND_URL/api/health" > /dev/null 2>&1; then
      echo -e "${GREEN}✅ ONLINE${NC} ($BACKEND_URL)"
    else
      echo -e "${RED}❌ OFFLINE${NC} ($BACKEND_URL)"
    fi
    
    echo -n "Frontend: "
    if curl -sf "$FRONTEND_URL" > /dev/null 2>&1; then
      echo -e "${GREEN}✅ ONLINE${NC} ($FRONTEND_URL)"
    else
      echo -e "${RED}❌ OFFLINE${NC} ($FRONTEND_URL)"
    fi
    ;;
    
  4)
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}📋 Logs do Backend (últimas 50 linhas)${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    
    gcloud run services logs read bartab-backend \
      --region=us-central1 \
      --limit=50
    ;;
    
  5)
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}📋 Logs do Frontend (últimas 50 linhas)${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    
    gcloud run services logs read bartab-frontend \
      --region=us-central1 \
      --limit=50
    ;;
    
  6)
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}📊 Monitoramento Completo${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    
    # Último build
    echo -e "${YELLOW}📦 Último Build:${NC}"
    LAST_BUILD=$(gcloud builds list --limit=1 --format="value(id)")
    LAST_STATUS=$(gcloud builds list --limit=1 --format="value(status)")
    LAST_TIME=$(gcloud builds list --limit=1 --format="value(createTime)")
    
    if [ "$LAST_STATUS" = "SUCCESS" ]; then
      echo -e "  Status: ${GREEN}✅ SUCCESS${NC}"
    else
      echo -e "  Status: ${RED}❌ $LAST_STATUS${NC}"
    fi
    echo "  ID: $LAST_BUILD"
    echo "  Horário: $LAST_TIME"
    echo ""
    
    # Builds em andamento
    echo -e "${YELLOW}🔄 Builds em Andamento:${NC}"
    ONGOING_COUNT=$(gcloud builds list --ongoing --format="value(id)" | wc -l | tr -d ' ')
    if [ "$ONGOING_COUNT" -gt 0 ]; then
      echo -e "  ${BLUE}$ONGOING_COUNT build(s) em andamento${NC}"
      gcloud builds list --ongoing --format="table(id, status, createTime)"
    else
      echo "  Nenhum"
    fi
    echo ""
    
    # Serviços
    echo -e "${YELLOW}☁️  Serviços Cloud Run:${NC}"
    
    BACKEND_URL=$(gcloud run services describe bartab-backend --region=us-central1 --format="value(status.url)")
    BACKEND_REVISION=$(gcloud run services describe bartab-backend --region=us-central1 --format="value(status.latestReadyRevisionName)")
    
    echo -n "  Backend:  "
    if curl -sf "$BACKEND_URL/api/health" > /dev/null 2>&1; then
      echo -e "${GREEN}✅ ONLINE${NC}"
    else
      echo -e "${RED}❌ OFFLINE${NC}"
    fi
    echo "    URL: $BACKEND_URL"
    echo "    Revisão: $BACKEND_REVISION"
    echo ""
    
    FRONTEND_URL=$(gcloud run services describe bartab-frontend --region=us-central1 --format="value(status.url)")
    FRONTEND_REVISION=$(gcloud run services describe bartab-frontend --region=us-central1 --format="value(status.latestReadyRevisionName)")
    
    echo -n "  Frontend: "
    if curl -sf "$FRONTEND_URL" > /dev/null 2>&1; then
      echo -e "${GREEN}✅ ONLINE${NC}"
    else
      echo -e "${RED}❌ OFFLINE${NC}"
    fi
    echo "    URL: $FRONTEND_URL"
    echo "    Revisão: $FRONTEND_REVISION"
    echo ""
    
    # Erros recentes
    echo -e "${YELLOW}🐛 Erros Recentes (últimas 24h):${NC}"
    ERROR_COUNT=$(gcloud run services logs read bartab-backend --region=us-central1 --limit=1000 --filter="severity>=ERROR" --format="value(textPayload)" 2>/dev/null | wc -l | tr -d ' ')
    
    if [ "$ERROR_COUNT" -gt 0 ]; then
      echo -e "  ${RED}⚠️  $ERROR_COUNT erro(s) encontrado(s)${NC}"
      echo ""
      echo "  Últimos 5 erros:"
      gcloud run services logs read bartab-backend \
        --region=us-central1 \
        --limit=5 \
        --filter="severity>=ERROR" \
        --format="table(timestamp, severity, textPayload)" 2>/dev/null || echo "  Nenhum erro recente"
    else
      echo -e "  ${GREEN}✅ Nenhum erro${NC}"
    fi
    echo ""
    
    # Database
    echo -e "${YELLOW}🗄️  Database (Cloud SQL):${NC}"
    DB_STATUS=$(gcloud sql instances describe bartab-postgres --format="value(state)" 2>/dev/null || echo "UNKNOWN")
    
    if [ "$DB_STATUS" = "RUNNABLE" ]; then
      echo -e "  Status: ${GREEN}✅ RUNNABLE${NC}"
    else
      echo -e "  Status: ${RED}❌ $DB_STATUS${NC}"
    fi
    
    DB_IP=$(gcloud sql instances describe bartab-postgres --format="value(ipAddresses[0].ipAddress)" 2>/dev/null || echo "N/A")
    echo "  IP: $DB_IP"
    echo ""
    
    # Links úteis
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}🔗 Links Úteis${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo "  Cloud Build: https://console.cloud.google.com/cloud-build/builds?project=$PROJECT_ID"
    echo "  Cloud Run:   https://console.cloud.google.com/run?project=$PROJECT_ID"
    echo "  Logs:        https://console.cloud.google.com/logs?project=$PROJECT_ID"
    echo ""
    ;;
    
  7)
    echo ""
    echo "🌐 Abrindo Cloud Build no navegador..."
    open "https://console.cloud.google.com/cloud-build/builds?project=$PROJECT_ID"
    ;;
    
  8)
    echo ""
    echo "🌐 Abrindo Cloud Run no navegador..."
    open "https://console.cloud.google.com/run?project=$PROJECT_ID"
    ;;
    
  *)
    echo -e "${RED}❌ Opção inválida${NC}"
    exit 1
    ;;
esac

echo ""

