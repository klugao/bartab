#!/bin/bash

# Script para preparar o projeto BarTab para deploy no Render
# Uso: ./prepare-deploy.sh

set -e

echo "🚀 Preparando projeto BarTab para deploy no Render..."
echo ""

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verificar se estamos na raiz do projeto
if [ ! -f "render.yaml" ]; then
    echo -e "${RED}❌ Erro: Execute este script na raiz do projeto BarTab${NC}"
    exit 1
fi

# Verificar se git está instalado
if ! command -v git &> /dev/null; then
    echo -e "${RED}❌ Git não está instalado${NC}"
    exit 1
fi

echo -e "${BLUE}📋 Verificando arquivos necessários...${NC}"

# Verificar arquivos essenciais
files=(
    "render.yaml"
    "frontend/public/_redirects"
    "backend/package.json"
    "frontend/package.json"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC} $file"
    else
        echo -e "${RED}✗${NC} $file ${RED}(não encontrado)${NC}"
        exit 1
    fi
done

echo ""
echo -e "${BLUE}🔍 Verificando configurações...${NC}"

# Verificar se env.example existe
if [ -f "backend/env.example" ]; then
    echo -e "${GREEN}✓${NC} backend/env.example"
else
    echo -e "${YELLOW}⚠${NC} backend/env.example não encontrado"
fi

if [ -f "frontend/env.example" ]; then
    echo -e "${GREEN}✓${NC} frontend/env.example"
else
    echo -e "${YELLOW}⚠${NC} frontend/env.example não encontrado"
fi

echo ""
echo -e "${BLUE}📦 Testando instalação de dependências...${NC}"

# Testar backend
echo -e "${BLUE}Backend...${NC}"
cd backend
if npm install --dry-run > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Dependências do backend OK"
else
    echo -e "${RED}✗${NC} Erro nas dependências do backend"
    exit 1
fi
cd ..

# Testar frontend
echo -e "${BLUE}Frontend...${NC}"
cd frontend
if npm install --dry-run > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Dependências do frontend OK"
else
    echo -e "${RED}✗${NC} Erro nas dependências do frontend"
    exit 1
fi
cd ..

echo ""
echo -e "${BLUE}🔨 Testando builds...${NC}"

# Build backend
echo -e "${BLUE}Build do backend...${NC}"
cd backend
if npm run build > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Build do backend OK"
else
    echo -e "${RED}✗${NC} Erro no build do backend"
    cd ..
    exit 1
fi
cd ..

# Build frontend
echo -e "${BLUE}Build do frontend...${NC}"
cd frontend
if npm run build > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Build do frontend OK"
else
    echo -e "${RED}✗${NC} Erro no build do frontend"
    cd ..
    exit 1
fi
cd ..

echo ""
echo -e "${BLUE}📝 Verificando Git...${NC}"

# Verificar se há mudanças não commitadas
if [ -n "$(git status --porcelain)" ]; then
    echo -e "${YELLOW}⚠${NC} Há mudanças não commitadas"
    echo ""
    git status --short
    echo ""
    read -p "Deseja fazer commit agora? (s/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Ss]$ ]]; then
        read -p "Mensagem do commit: " commit_msg
        git add .
        git commit -m "$commit_msg"
        echo -e "${GREEN}✓${NC} Commit realizado"
    fi
else
    echo -e "${GREEN}✓${NC} Não há mudanças pendentes"
fi

# Verificar branch
current_branch=$(git branch --show-current)
echo -e "${GREEN}✓${NC} Branch atual: ${BLUE}$current_branch${NC}"

# Verificar remote
if git remote -v | grep -q "origin"; then
    echo -e "${GREEN}✓${NC} Remote origin configurado"
    remote_url=$(git remote get-url origin)
    echo -e "  URL: ${BLUE}$remote_url${NC}"
else
    echo -e "${RED}✗${NC} Remote origin não configurado"
    exit 1
fi

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Projeto pronto para deploy no Render!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${BLUE}📚 Próximos passos:${NC}"
echo ""
echo "1. Fazer push para o repositório:"
echo -e "   ${YELLOW}git push origin $current_branch${NC}"
echo ""
echo "2. Acessar o Render:"
echo -e "   ${YELLOW}https://dashboard.render.com${NC}"
echo ""
echo "3. Criar novo Blueprint:"
echo "   - Clique em 'New +' → 'Blueprint'"
echo "   - Conecte seu repositório"
echo "   - O Render detectará o render.yaml"
echo ""
echo "4. Configurar variáveis secretas no dashboard:"
echo "   - GOOGLE_CLIENT_ID"
echo "   - GOOGLE_CLIENT_SECRET"
echo "   - SMTP_USER"
echo "   - SMTP_PASS"
echo ""
echo "5. Consultar o guia completo:"
echo -e "   ${YELLOW}cat DEPLOY_RENDER.md${NC}"
echo ""
echo -e "${BLUE}💡 Dica:${NC} O primeiro deploy pode demorar 5-10 minutos"
echo ""

