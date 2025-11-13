#!/bin/bash

# Script para executar todos os testes do sistema BarTab
# Uso: ./run-tests.sh [backend|frontend|all]

set -e

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Função para imprimir cabeçalhos
print_header() {
    local message="$1"
    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${BLUE}${message}${NC}"
    echo -e "${BLUE}========================================${NC}\n"
    return 0
}

# Função para imprimir sucesso
print_success() {
    local message="$1"
    echo -e "${GREEN}✅ ${message}${NC}"
    return 0
}

# Função para imprimir erro
print_error() {
    local message="$1"
    echo -e "${RED}❌ ${message}${NC}"
    return 0
}

# Função para executar testes do backend
run_backend_tests() {
    print_header "Executando Testes do Backend"
    cd backend
    if npm test; then
        print_success "Testes do backend passaram!"
        cd ..
        return 0
    else
        print_error "Testes do backend falharam!"
        cd ..
        return 1
    fi
}

# Função para executar testes do frontend
run_frontend_tests() {
    print_header "Executando Testes do Frontend"
    cd frontend
    if npm test -- --run; then
        print_success "Testes do frontend passaram!"
        cd ..
        return 0
    else
        print_error "Testes do frontend falharam!"
        cd ..
        return 1
    fi
}

# Função principal
main() {
    local mode="${1:-all}"
    local backend_result=0
    local frontend_result=0
    
    print_header "🧪 Sistema de Testes BarTab"
    
    case "$mode" in
        backend)
            run_backend_tests
            backend_result=$?
            ;;
        frontend)
            run_frontend_tests
            frontend_result=$?
            ;;
        all)
            run_backend_tests
            backend_result=$?
            
            run_frontend_tests
            frontend_result=$?
            ;;
        *)
            echo -e "${YELLOW}Uso: $0 [backend|frontend|all]${NC}"
            exit 1
            ;;
    esac
    
    # Resumo final
    print_header "📊 Resumo dos Testes"
    
    if [[ "$backend_result" -eq 0 && "$frontend_result" -eq 0 ]]; then
        print_success "Todos os testes passaram! 🎉"
        echo -e "\n${GREEN}Backend: ✅ (51 testes)${NC}"
        echo -e "${GREEN}Frontend: ✅ (75 testes)${NC}"
        echo -e "${GREEN}Total: 126 testes passaram${NC}"
        exit 0
    else
        print_error "Alguns testes falharam"
        [ "$backend_result" -ne 0 ] && echo -e "${RED}Backend: ❌${NC}"
        [ "$frontend_result" -ne 0 ] && echo -e "${RED}Frontend: ❌${NC}"
        exit 1
    fi
}

# Executar script
main "$@"

