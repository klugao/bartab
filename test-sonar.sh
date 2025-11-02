#!/bin/bash

# Script para testar a configuração do SonarQube localmente
# Uso: ./test-sonar.sh [backend|frontend|all]

set -e

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

SONAR_HOST_URL="${SONAR_HOST_URL:-http://localhost:9000}"
SONAR_TOKEN="${SONAR_TOKEN:-sqa_38ad5c3247d3aa2765223a9e033bbae8a648cfb2}"

echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   Teste SonarQube - Projeto BarTab    ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
echo ""

# Função para verificar se o SonarQube está rodando
check_sonarqube() {
    echo -e "${YELLOW}→ Verificando se o SonarQube está acessível...${NC}"
    if curl -s -f "$SONAR_HOST_URL" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ SonarQube está rodando em: $SONAR_HOST_URL${NC}"
        return 0
    else
        echo -e "${RED}✗ SonarQube não está acessível em: $SONAR_HOST_URL${NC}"
        echo -e "${RED}  Certifique-se que o SonarQube está rodando.${NC}"
        return 1
    fi
}

# Função para verificar se o sonar-scanner está instalado
check_scanner() {
    echo -e "${YELLOW}→ Verificando sonar-scanner...${NC}"
    if command -v sonar-scanner &> /dev/null; then
        echo -e "${GREEN}✓ sonar-scanner está instalado${NC}"
        return 0
    else
        echo -e "${RED}✗ sonar-scanner não encontrado${NC}"
        echo -e "${YELLOW}  Instale com: npm install -g sonarqube-scanner${NC}"
        return 1
    fi
}

# Função para executar análise do backend
analyze_backend() {
    echo ""
    echo -e "${GREEN}═══════════════════════════════════════${NC}"
    echo -e "${GREEN}   Analisando Backend (NestJS)${NC}"
    echo -e "${GREEN}═══════════════════════════════════════${NC}"
    
    cd backend
    
    echo -e "${YELLOW}→ Instalando dependências...${NC}"
    npm ci --silent
    
    echo -e "${YELLOW}→ Executando testes com cobertura...${NC}"
    npm run test:cov
    
    if [[ ! -f "coverage/lcov.info" ]]; then
        echo -e "${RED}✗ Arquivo coverage/lcov.info não encontrado${NC}"
        cd ..
        return 1
    fi
    
    echo -e "${GREEN}✓ Cobertura gerada com sucesso${NC}"
    
    echo -e "${YELLOW}→ Executando análise SonarQube...${NC}"
    sonar-scanner \
        -Dsonar.host.url="$SONAR_HOST_URL"
    
    echo -e "${GREEN}✓ Análise do backend concluída!${NC}"
    echo -e "${GREEN}  Acesse: $SONAR_HOST_URL/dashboard?id=bartab-backend${NC}"
    
    cd ..
    return 0
}

# Função para executar análise do frontend
analyze_frontend() {
    echo ""
    echo -e "${GREEN}═══════════════════════════════════════${NC}"
    echo -e "${GREEN}   Analisando Frontend (React)${NC}"
    echo -e "${GREEN}═══════════════════════════════════════${NC}"
    
    cd frontend
    
    echo -e "${YELLOW}→ Instalando dependências...${NC}"
    npm ci --silent
    
    echo -e "${YELLOW}→ Executando testes com cobertura...${NC}"
    npm run test:coverage
    
    if [[ ! -f "coverage/lcov.info" ]]; then
        echo -e "${RED}✗ Arquivo coverage/lcov.info não encontrado${NC}"
        cd ..
        return 1
    fi
    
    echo -e "${GREEN}✓ Cobertura gerada com sucesso${NC}"
    
    echo -e "${YELLOW}→ Executando análise SonarQube...${NC}"
    sonar-scanner \
        -Dsonar.host.url="$SONAR_HOST_URL"
    
    echo -e "${GREEN}✓ Análise do frontend concluída!${NC}"
    echo -e "${GREEN}  Acesse: $SONAR_HOST_URL/dashboard?id=bartab-frontend${NC}"
    
    cd ..
    return 0
}

# Main
main() {
    local target="${1:-all}"
    
    # Verificações iniciais
    check_sonarqube || exit 1
    check_scanner || exit 1
    
    echo ""
    
    case "$target" in
        backend)
            analyze_backend
            ;;
        frontend)
            analyze_frontend
            ;;
        all)
            analyze_backend
            analyze_frontend
            ;;
        *)
            echo -e "${RED}Uso: $0 [backend|frontend|all]${NC}"
            exit 1
            ;;
    esac
    
    echo ""
    echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║          Análise Concluída! ✓          ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${YELLOW}Próximos passos:${NC}"
    echo -e "  1. Acesse o SonarQube: $SONAR_HOST_URL"
    echo -e "  2. Verifique os dashboards dos projetos"
    echo -e "  3. Configure os secrets no GitHub para CI/CD"
    echo ""
    return 0
}

# Executar
main "$@"

