#!/bin/bash

echo "🧹 Limpando ambiente e iniciando projeto do zero..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${YELLOW}📦 Parando todos os processos relacionados...${NC}"

# Matar processos Node/NestJS/npm
pkill -f "nest start" 2>/dev/null || true
pkill -f "npm run start" 2>/dev/null || true
pkill -f "node.*nest" 2>/dev/null || true
pkill -f "vite" 2>/dev/null || true

# Limpar portas específicas
echo -e "${YELLOW}🔌 Limpando portas 3000 e 5175...${NC}"
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
lsof -ti:5175 | xargs kill -9 2>/dev/null || true

# Aguardar um pouco para garantir que os processos pararam
sleep 2

echo -e "${BLUE}🐘 Verificando PostgreSQL...${NC}"
cd /Users/eduardoklug/Documents/bartab

# Iniciar PostgreSQL se não estiver rodando
if ! docker-compose ps | grep -q "Up"; then
    echo -e "${YELLOW}Iniciando PostgreSQL...${NC}"
    docker-compose up -d db
    sleep 5
else
    echo -e "${GREEN}PostgreSQL já está rodando${NC}"
fi

# Verificar se o arquivo .env existe no backend
if [ ! -f "backend/.env" ]; then
    echo -e "${YELLOW}📄 Criando arquivo .env...${NC}"
    cp backend/env.example backend/.env
fi

echo -e "${BLUE}🚀 Iniciando Backend...${NC}"
cd backend

# Instalar dependências se necessário
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Instalando dependências do backend...${NC}"
    npm install
fi

# Iniciar backend
echo -e "${GREEN}🔥 Iniciando servidor backend na porta 3000...${NC}"
npm run start:dev &
BACKEND_PID=$!

# Aguardar o backend inicializar
sleep 10

# Verificar se o backend está rodando
if curl -s http://localhost:3000/api > /dev/null; then
    echo -e "${GREEN}✅ Backend rodando com sucesso na porta 3000!${NC}"
else
    echo -e "${RED}❌ Erro ao iniciar o backend${NC}"
    exit 1
fi

echo -e "${BLUE}🌐 Iniciando Frontend...${NC}"
cd ../frontend

# Instalar dependências se necessário
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Instalando dependências do frontend...${NC}"
    npm install
fi

# Iniciar frontend
echo -e "${GREEN}🔥 Iniciando frontend na porta 5175...${NC}"
npm run dev &
FRONTEND_PID=$!

# Aguardar o frontend inicializar
sleep 5

echo -e "${GREEN}🎉 Projeto iniciado com sucesso!${NC}"
echo -e "${BLUE}📊 Backend: http://localhost:3000/api${NC}"
echo -e "${BLUE}🌐 Frontend: http://localhost:5175${NC}"
echo ""
echo -e "${YELLOW}Para parar os serviços:${NC}"
echo "  Backend PID: $BACKEND_PID"
echo "  Frontend PID: $FRONTEND_PID"
echo "  Ou use: ./stop-project.sh"

# Manter o script rodando para mostrar logs
wait
