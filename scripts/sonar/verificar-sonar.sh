#!/bin/bash

# Script de Verificação da Configuração do SonarCloud
# Este script verifica se tudo está configurado corretamente para o SonarCloud

set -e

echo "🔍 Verificando Configuração do SonarCloud..."
echo ""

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

# Verificar arquivo backend
echo "📦 Verificando Backend..."
if [ -f "backend/sonar-project.properties" ]; then
    echo -e "${GREEN}✓${NC} Arquivo backend/sonar-project.properties existe"
    
    # Verificar projectKey
    if grep -q "sonar.projectKey=bartab-backend" backend/sonar-project.properties; then
        echo -e "${GREEN}✓${NC} projectKey configurado corretamente"
    else
        echo -e "${RED}✗${NC} projectKey não está como 'bartab-backend'"
        ERRORS=$((ERRORS+1))
    fi
    
    # Verificar organização
    if grep -q "^sonar.organization=" backend/sonar-project.properties; then
        ORG=$(grep "^sonar.organization=" backend/sonar-project.properties | cut -d'=' -f2)
        if [ -z "$ORG" ]; then
            echo -e "${RED}✗${NC} Organização está vazia no backend"
            ERRORS=$((ERRORS+1))
        else
            echo -e "${GREEN}✓${NC} Organização configurada: $ORG"
        fi
    else
        echo -e "${RED}✗${NC} Organização não está descomentada no backend"
        echo -e "${YELLOW}  →${NC} Edite backend/sonar-project.properties e descomente a linha 'sonar.organization'"
        ERRORS=$((ERRORS+1))
    fi
else
    echo -e "${RED}✗${NC} Arquivo backend/sonar-project.properties não encontrado"
    ERRORS=$((ERRORS+1))
fi

echo ""

# Verificar arquivo frontend
echo "🌐 Verificando Frontend..."
if [ -f "frontend/sonar-project.properties" ]; then
    echo -e "${GREEN}✓${NC} Arquivo frontend/sonar-project.properties existe"
    
    # Verificar projectKey
    if grep -q "sonar.projectKey=bartab-frontend" frontend/sonar-project.properties; then
        echo -e "${GREEN}✓${NC} projectKey configurado corretamente"
    else
        echo -e "${RED}✗${NC} projectKey não está como 'bartab-frontend'"
        ERRORS=$((ERRORS+1))
    fi
    
    # Verificar organização
    if grep -q "^sonar.organization=" frontend/sonar-project.properties; then
        ORG=$(grep "^sonar.organization=" frontend/sonar-project.properties | cut -d'=' -f2)
        if [ -z "$ORG" ]; then
            echo -e "${RED}✗${NC} Organização está vazia no frontend"
            ERRORS=$((ERRORS+1))
        else
            echo -e "${GREEN}✓${NC} Organização configurada: $ORG"
        fi
    else
        echo -e "${RED}✗${NC} Organização não está descomentada no frontend"
        echo -e "${YELLOW}  →${NC} Edite frontend/sonar-project.properties e descomente a linha 'sonar.organization'"
        ERRORS=$((ERRORS+1))
    fi
else
    echo -e "${RED}✗${NC} Arquivo frontend/sonar-project.properties não encontrado"
    ERRORS=$((ERRORS+1))
fi

echo ""

# Verificar workflow do GitHub Actions
echo "⚙️  Verificando GitHub Actions..."
if [ -f ".github/workflows/main.yml" ]; then
    echo -e "${GREEN}✓${NC} Arquivo .github/workflows/main.yml existe"
    
    if grep -q "SONAR_TOKEN" .github/workflows/main.yml; then
        echo -e "${GREEN}✓${NC} SONAR_TOKEN está configurado no workflow"
    else
        echo -e "${RED}✗${NC} SONAR_TOKEN não encontrado no workflow"
        ERRORS=$((ERRORS+1))
    fi
    
    if grep -q "sonarcloud-github-action" .github/workflows/main.yml; then
        echo -e "${GREEN}✓${NC} SonarCloud action está configurada"
    else
        echo -e "${YELLOW}⚠${NC} SonarCloud action pode não estar configurada"
        WARNINGS=$((WARNINGS+1))
    fi
else
    echo -e "${RED}✗${NC} Arquivo .github/workflows/main.yml não encontrado"
    ERRORS=$((ERRORS+1))
fi

echo ""
echo "=========================================="
echo ""

# Resumo
if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✓ TUDO CERTO!${NC}"
    echo ""
    echo "Próximos passos:"
    echo "1. Verifique se o secret SONAR_TOKEN está configurado no GitHub:"
    echo "   https://github.com/SEU-USUARIO/bartab/settings/secrets/actions"
    echo ""
    echo "2. Se o secret não estiver configurado:"
    echo "   a) Acesse: https://sonarcloud.io/"
    echo "   b) Avatar → My Account → Security"
    echo "   c) Gere um novo token (User Token)"
    echo "   d) Adicione no GitHub como secret 'SONAR_TOKEN'"
    echo ""
    echo "3. Faça commit e push se fez alterações:"
    echo "   git add backend/sonar-project.properties frontend/sonar-project.properties"
    echo "   git commit -m 'chore: configurar SonarCloud'"
    echo "   git push"
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠ $WARNINGS aviso(s) encontrado(s)${NC}"
    echo ""
    echo "A configuração parece estar OK, mas há alguns avisos acima."
    echo "Revise e corrija se necessário."
else
    echo -e "${RED}✗ $ERRORS erro(s) encontrado(s)${NC}"
    if [ $WARNINGS -gt 0 ]; then
        echo -e "${YELLOW}⚠ $WARNINGS aviso(s) encontrado(s)${NC}"
    fi
    echo ""
    echo "Corrija os erros acima antes de fazer push."
    echo ""
    echo "Para configurar a organização automaticamente, execute:"
    echo "  ./configurar-sonar.sh SUA-ORGANIZACAO"
    exit 1
fi

echo ""
echo "Para mais informações, consulte:"
echo "  - CORRECAO_RAPIDA_SONAR.md (guia rápido)"
echo "  - SONARCLOUD_SETUP.md (guia completo)"


