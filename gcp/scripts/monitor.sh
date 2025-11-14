#!/bin/bash
# Script de Monitoramento BarTab - Ferramentas Gratuitas do GCP
# Uso: ./monitor.sh [opção]
# Opções: status, logs, metrics, errors, health, all

set -e

PROJECT_ID=$(gcloud config get-value project 2>/dev/null || echo "")
REGION="us-central1"
BACKEND_SERVICE="bartab-backend"
FRONTEND_SERVICE="bartab-frontend"
DB_INSTANCE="bartab-postgres"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Funções auxiliares
print_header() {
    echo -e "\n${CYAN}═══════════════════════════════════════════════════${NC}"
    echo -e "${CYAN}  $1${NC}"
    echo -e "${CYAN}═══════════════════════════════════════════════════${NC}\n"
}

print_section() {
    echo -e "\n${BLUE}▶ $1${NC}\n"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Verificar se gcloud está configurado
check_setup() {
    if [ -z "$PROJECT_ID" ]; then
        print_error "Projeto GCP não configurado!"
        echo "Execute: gcloud config set project SEU_PROJECT_ID"
        exit 1
    fi
    print_success "Projeto: $PROJECT_ID"
}

# Status dos serviços
show_status() {
    print_header "STATUS DOS SERVIÇOS"
    
    print_section "Cloud Run Services"
    gcloud run services list \
        --platform=managed \
        --region=$REGION \
        --format="table(
            SERVICE:label='Serviço',
            REGION:label='Região',
            URL:label='URL',
            LAST_DEPLOYED_BY:label='Última Deploy Por',
            LAST_DEPLOYED_AT:label='Última Deploy'
        )" 2>/dev/null || print_error "Erro ao buscar serviços Cloud Run"
    
    print_section "Cloud SQL Database"
    gcloud sql instances describe $DB_INSTANCE \
        --format="table(
            state:label='Status',
            databaseVersion:label='Versão',
            settings.tier:label='Tier',
            settings.dataDiskSizeGb:label='Disco (GB)',
            region:label='Região'
        )" 2>/dev/null || print_warning "Banco não encontrado ou sem permissão"
}

# Métricas em tempo real
show_metrics() {
    print_header "MÉTRICAS (ÚLTIMOS 5 MINUTOS)"
    
    print_section "Backend - Requisições"
    echo "Buscando dados..."
    
    # Request count por código de resposta
    REQUEST_DATA=$(gcloud monitoring time-series list \
        --filter="metric.type=\"run.googleapis.com/request_count\" AND resource.labels.service_name=\"$BACKEND_SERVICE\"" \
        --format="json" \
        --limit=1 2>/dev/null)
    
    if [ -n "$REQUEST_DATA" ] && [ "$REQUEST_DATA" != "[]" ]; then
        print_success "Requisições ativas"
    else
        print_warning "Sem dados de requisições (pode estar em cold start)"
    fi
    
    print_section "Backend - Latência"
    # Latência média
    LATENCY=$(gcloud monitoring time-series list \
        --filter="metric.type=\"run.googleapis.com/request_latencies\" AND resource.labels.service_name=\"$BACKEND_SERVICE\"" \
        --format="value(points[0].value.distributionValue.mean)" \
        --limit=1 2>/dev/null || echo "0")
    
    if [ -n "$LATENCY" ] && [ "$LATENCY" != "0" ]; then
        LATENCY_MS=$(echo "scale=2; $LATENCY / 1000000" | bc)
        if (( $(echo "$LATENCY_MS < 500" | bc -l) )); then
            print_success "Latência: ${LATENCY_MS}ms (Ótima)"
        elif (( $(echo "$LATENCY_MS < 1000" | bc -l) )); then
            print_warning "Latência: ${LATENCY_MS}ms (Normal)"
        else
            print_error "Latência: ${LATENCY_MS}ms (Alta!)"
        fi
    else
        print_warning "Sem dados de latência"
    fi
    
    print_section "Instâncias Ativas"
    INSTANCES=$(gcloud monitoring time-series list \
        --filter="metric.type=\"run.googleapis.com/container/instance_count\" AND resource.labels.service_name=\"$BACKEND_SERVICE\"" \
        --format="value(points[0].value.int64Value)" \
        --limit=1 2>/dev/null || echo "0")
    
    if [ "$INSTANCES" -gt 0 ]; then
        print_success "Backend: $INSTANCES instância(s)"
    else
        print_warning "Backend: 0 instâncias (scaled to zero)"
    fi
}

# Logs recentes
show_logs() {
    print_header "LOGS RECENTES (ÚLTIMOS 10 MINUTOS)"
    
    OPTION=${1:-backend}
    
    if [ "$OPTION" == "backend" ] || [ "$OPTION" == "all" ]; then
        print_section "Backend Logs"
        gcloud logging read \
            "resource.type=cloud_run_revision AND resource.labels.service_name=$BACKEND_SERVICE" \
            --limit=20 \
            --format="table(timestamp,severity,jsonPayload.message)" \
            --freshness=10m 2>/dev/null || print_warning "Sem logs recentes do backend"
    fi
    
    if [ "$OPTION" == "frontend" ] || [ "$OPTION" == "all" ]; then
        print_section "Frontend Logs"
        gcloud logging read \
            "resource.type=cloud_run_revision AND resource.labels.service_name=$FRONTEND_SERVICE" \
            --limit=20 \
            --format="table(timestamp,severity,jsonPayload.message)" \
            --freshness=10m 2>/dev/null || print_warning "Sem logs recentes do frontend"
    fi
}

# Erros recentes
show_errors() {
    print_header "ERROS RECENTES (ÚLTIMAS 2 HORAS)"
    
    print_section "Erros do Backend"
    ERROR_COUNT=$(gcloud logging read \
        "resource.type=cloud_run_revision AND resource.labels.service_name=$BACKEND_SERVICE AND severity>=ERROR" \
        --limit=1000 \
        --format="value(timestamp)" \
        --freshness=2h 2>/dev/null | wc -l)
    
    if [ "$ERROR_COUNT" -gt 0 ]; then
        print_error "Encontrados $ERROR_COUNT erros!"
        echo ""
        gcloud logging read \
            "resource.type=cloud_run_revision AND resource.labels.service_name=$BACKEND_SERVICE AND severity>=ERROR" \
            --limit=10 \
            --format="table(timestamp,severity,jsonPayload.message:label='Mensagem')" \
            --freshness=2h 2>/dev/null
    else
        print_success "Nenhum erro nas últimas 2 horas!"
    fi
    
    print_section "Erros do Frontend"
    FRONTEND_ERROR_COUNT=$(gcloud logging read \
        "resource.type=cloud_run_revision AND resource.labels.service_name=$FRONTEND_SERVICE AND severity>=ERROR" \
        --limit=1000 \
        --format="value(timestamp)" \
        --freshness=2h 2>/dev/null | wc -l)
    
    if [ "$FRONTEND_ERROR_COUNT" -gt 0 ]; then
        print_error "Encontrados $FRONTEND_ERROR_COUNT erros!"
        echo ""
        gcloud logging read \
            "resource.type=cloud_run_revision AND resource.labels.service_name=$FRONTEND_SERVICE AND severity>=ERROR" \
            --limit=10 \
            --format="table(timestamp,severity,textPayload:label='Mensagem')" \
            --freshness=2h 2>/dev/null
    else
        print_success "Nenhum erro no frontend nas últimas 2 horas!"
    fi
}

# Health check
show_health() {
    print_header "HEALTH CHECK"
    
    print_section "Backend Health"
    BACKEND_URL=$(gcloud run services describe $BACKEND_SERVICE \
        --region=$REGION \
        --format="value(status.url)" 2>/dev/null)
    
    if [ -n "$BACKEND_URL" ]; then
        echo "URL: $BACKEND_URL/api/health"
        echo ""
        
        HEALTH_RESPONSE=$(curl -s "${BACKEND_URL}/api/health" 2>/dev/null || echo "{}")
        
        if [ -n "$HEALTH_RESPONSE" ] && [ "$HEALTH_RESPONSE" != "{}" ]; then
            echo "$HEALTH_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$HEALTH_RESPONSE"
            print_success "Backend está saudável!"
        else
            print_error "Backend não está respondendo!"
        fi
    else
        print_warning "Backend não encontrado"
    fi
    
    print_section "Frontend Health"
    FRONTEND_URL=$(gcloud run services describe $FRONTEND_SERVICE \
        --region=$REGION \
        --format="value(status.url)" 2>/dev/null)
    
    if [ -n "$FRONTEND_URL" ]; then
        echo "URL: $FRONTEND_URL"
        echo ""
        
        HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_URL" 2>/dev/null)
        
        if [ "$HTTP_CODE" == "200" ]; then
            print_success "Frontend está acessível! (HTTP $HTTP_CODE)"
        else
            print_error "Frontend retornou HTTP $HTTP_CODE"
        fi
    else
        print_warning "Frontend não encontrado"
    fi
}

# Monitoramento contínuo
watch_mode() {
    print_header "MODO CONTÍNUO (Atualiza a cada 30s)"
    echo "Pressione Ctrl+C para sair"
    echo ""
    
    while true; do
        clear
        show_status
        show_metrics
        show_errors
        echo ""
        echo -e "${CYAN}Próxima atualização em 30 segundos...${NC}"
        sleep 30
    done
}

# Menu principal
show_menu() {
    print_header "MONITORAMENTO BARTAB - GCP"
    echo "Escolha uma opção:"
    echo ""
    echo "  1) Status dos serviços"
    echo "  2) Métricas em tempo real"
    echo "  3) Logs recentes"
    echo "  4) Erros recentes"
    echo "  5) Health check"
    echo "  6) Visão completa"
    echo "  7) Modo contínuo (watch)"
    echo "  0) Sair"
    echo ""
    read -p "Opção: " choice
    
    case $choice in
        1) show_status ;;
        2) show_metrics ;;
        3) show_logs all ;;
        4) show_errors ;;
        5) show_health ;;
        6) show_status; show_metrics; show_errors; show_health ;;
        7) watch_mode ;;
        0) exit 0 ;;
        *) print_error "Opção inválida!" ;;
    esac
}

# Execução principal
main() {
    check_setup
    
    if [ $# -eq 0 ]; then
        # Modo interativo
        while true; do
            show_menu
            echo ""
            read -p "Pressione Enter para continuar..."
        done
    else
        # Modo com argumentos
        case $1 in
            status) show_status ;;
            metrics) show_metrics ;;
            logs) show_logs ${2:-all} ;;
            errors) show_errors ;;
            health) show_health ;;
            watch) watch_mode ;;
            all) show_status; show_metrics; show_errors; show_health ;;
            *)
                echo "Uso: $0 [opção]"
                echo "Opções: status, metrics, logs, errors, health, watch, all"
                echo "Ou execute sem argumentos para modo interativo"
                exit 1
                ;;
        esac
    fi
}

main "$@"

