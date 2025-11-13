#!/bin/bash

# Script para Configurar Organização do SonarCloud
# Uso: ./configurar-sonar.sh NOME-DA-ORGANIZACAO

set -e

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Verificar se foi passado o nome da organização
if [ -z "$1" ]; then
    echo -e "${RED}Erro:${NC} Você precisa fornecer o nome da organização"
    echo ""
    echo "Uso:"
    echo "  ./configurar-sonar.sh NOME-DA-ORGANIZACAO"
    echo ""
    echo "Para encontrar o nome da organização:"
    echo "  1. Acesse: https://sonarcloud.io/"
    echo "  2. Clique em 'My Organizations'"
    echo "  3. O nome aparece na URL: sonarcloud.io/organizations/NOME-AQUI"
    echo ""
    exit 1
fi

ORG=$1

echo -e "${BLUE}🔧 Configurando SonarCloud...${NC}"
echo ""
echo "Organização: $ORG"
echo ""

# Função para configurar um arquivo
configure_file() {
    local file=$1
    local name=$2
    
    echo -e "📝 Configurando $name..."
    
    if [ ! -f "$file" ]; then
        echo -e "${RED}✗${NC} Arquivo $file não encontrado"
        return 1
    fi
    
    # Criar backup
    cp "$file" "$file.backup"
    echo -e "${GREEN}✓${NC} Backup criado: $file.backup"
    
    # Descomentar e configurar a organização
    if grep -q "^# sonar.organization=" "$file"; then
        # Linha está comentada
        sed -i.tmp "s|^# sonar.organization=.*|sonar.organization=$ORG|" "$file"
        rm -f "$file.tmp"
        echo -e "${GREEN}✓${NC} Organização configurada"
    elif grep -q "^sonar.organization=" "$file"; then
        # Linha já está descomentada, apenas atualizar
        sed -i.tmp "s|^sonar.organization=.*|sonar.organization=$ORG|" "$file"
        rm -f "$file.tmp"
        echo -e "${GREEN}✓${NC} Organização atualizada"
    else
        # Linha não existe, adicionar após projectVersion
        sed -i.tmp "/^sonar.projectVersion=/a\\
\\
# Organização do SonarCloud\\
sonar.organization=$ORG" "$file"
        rm -f "$file.tmp"
        echo -e "${GREEN}✓${NC} Organização adicionada"
    fi
    
    # Mostrar a configuração
    echo -e "${BLUE}Configuração:${NC}"
    grep -E "^sonar\.(projectKey|projectName|organization)=" "$file" | sed 's/^/  /'
    echo ""
}

# Configurar Backend
configure_file "backend/sonar-project.properties" "Backend"

# Configurar Frontend
configure_file "frontend/sonar-project.properties" "Frontend"

echo "=========================================="
echo ""
echo -e "${GREEN}✓ Configuração concluída!${NC}"
echo ""
echo "Próximos passos:"
echo ""
echo "1️⃣  Verifique as alterações:"
echo "   git diff backend/sonar-project.properties"
echo "   git diff frontend/sonar-project.properties"
echo ""
echo "2️⃣  Configure o secret SONAR_TOKEN no GitHub (se ainda não fez):"
echo "   a) Acesse: https://sonarcloud.io/"
echo "   b) Avatar → My Account → Security → Generate Tokens"
echo "   c) Gere um 'User Token' sem expiração"
echo "   d) Copie o token"
echo "   e) Acesse: https://github.com/SEU-USUARIO/bartab/settings/secrets/actions"
echo "   f) Adicione um novo secret:"
echo "      - Name: SONAR_TOKEN"
echo "      - Value: [cole o token]"
echo ""
echo "3️⃣  Verifique se os projetos existem no SonarCloud:"
echo "   Acesse: https://sonarcloud.io/organizations/$ORG/projects"
echo "   Deve haver:"
echo "   - bartab-backend"
echo "   - bartab-frontend"
echo ""
echo "4️⃣  Faça commit e push:"
echo "   git add backend/sonar-project.properties frontend/sonar-project.properties"
echo "   git commit -m 'chore: configurar organização do SonarCloud'"
echo "   git push"
echo ""
echo "5️⃣  Acompanhe o workflow no GitHub Actions:"
echo "   https://github.com/SEU-USUARIO/bartab/actions"
echo ""
echo "Para reverter as alterações:"
echo "   mv backend/sonar-project.properties.backup backend/sonar-project.properties"
echo "   mv frontend/sonar-project.properties.backup frontend/sonar-project.properties"
echo ""
echo "Para verificar a configuração:"
echo "   ./verificar-sonar.sh"
echo ""


