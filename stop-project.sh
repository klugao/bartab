#!/bin/bash

echo "🛑 Parando todos os serviços do projeto..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}📦 Parando processos Node/NestJS/Vite...${NC}"

# Matar processos específicos
pkill -f "nest start" 2>/dev/null || true
pkill -f "npm run start" 2>/dev/null || true
pkill -f "npm run dev" 2>/dev/null || true
pkill -f "node.*nest" 2>/dev/null || true
pkill -f "vite" 2>/dev/null || true

# Limpar portas
echo -e "${YELLOW}🔌 Liberando portas 3000 e 5173...${NC}"
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
lsof -ti:5173 | xargs kill -9 2>/dev/null || true

sleep 2

echo -e "${GREEN}✅ Todos os serviços foram parados!${NC}"
echo -e "${YELLOW}💡 Para parar o PostgreSQL também: docker-compose down${NC}"
