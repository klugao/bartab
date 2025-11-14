#!/bin/bash

# Script para migrar dados do Supabase para Cloud SQL
# Este script ajuda na migração segura dos dados

set -e

echo "🗄️  Migração de Banco de Dados - Supabase → Cloud SQL"
echo "===================================================="
echo ""

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Verificar dependências
command -v pg_dump >/dev/null 2>&1 || { echo -e "${RED}❌ pg_dump não encontrado. Instale o PostgreSQL client.${NC}"; exit 1; }
command -v gcloud >/dev/null 2>&1 || { echo -e "${RED}❌ gcloud não encontrado.${NC}"; exit 1; }

echo -e "${YELLOW}⚠️  IMPORTANTE: Este script irá:${NC}"
echo "  1. Fazer backup do banco Supabase"
echo "  2. Criar/atualizar o schema no Cloud SQL"
echo "  3. Importar os dados para o Cloud SQL"
echo ""
echo -e "${YELLOW}⚠️  Certifique-se de que o backend está parado para evitar inconsistências.${NC}"
echo ""
read -p "Deseja continuar? (s/N): " CONFIRM

if [ "$CONFIRM" != "s" ] && [ "$CONFIRM" != "S" ]; then
    echo "Operação cancelada."
    exit 0
fi

echo ""

# ====== PASSO 1: BACKUP DO SUPABASE ======
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📥 PASSO 1: Backup do Supabase${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

read -p "Digite a URL de conexão do Supabase: " SUPABASE_URL

if [ -z "$SUPABASE_URL" ]; then
    echo -e "${RED}❌ URL não pode ser vazia${NC}"
    exit 1
fi

BACKUP_FILE="backup_supabase_$(date +%Y%m%d_%H%M%S).sql"

echo "💾 Criando backup em: $BACKUP_FILE"
pg_dump "$SUPABASE_URL" \
    --no-owner \
    --no-acl \
    --clean \
    --if-exists \
    > "$BACKUP_FILE"

echo -e "${GREEN}✅ Backup criado com sucesso!${NC}"
echo ""

# ====== PASSO 2: PREPARAR CLOUD SQL ======
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}☁️  PASSO 2: Preparar Cloud SQL${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Obter informações do Cloud SQL
PROJECT_ID=$(gcloud config get-value project)
SQL_INSTANCE=$(gcloud sql instances list --filter="name:bartab-postgres" --format="value(name)" | head -n1)

if [ -z "$SQL_INSTANCE" ]; then
    echo -e "${RED}❌ Instância Cloud SQL não encontrada${NC}"
    echo "Execute o Terraform primeiro para criar a infraestrutura."
    exit 1
fi

echo "🗄️  Instância Cloud SQL: $SQL_INSTANCE"
echo ""

# Obter IP da instância
SQL_IP=$(gcloud sql instances describe $SQL_INSTANCE --format="value(ipAddresses[0].ipAddress)")
echo "📍 IP: $SQL_IP"

# Adicionar seu IP à whitelist temporariamente
echo ""
echo "🔓 Adicionando seu IP à whitelist..."
MY_IP=$(curl -s https://api.ipify.org)
echo "📍 Seu IP: $MY_IP"

gcloud sql instances patch $SQL_INSTANCE \
    --authorized-networks=$MY_IP \
    --quiet

echo -e "${GREEN}✅ IP autorizado${NC}"
echo ""

# Aguardar um momento para a configuração ser aplicada
echo "⏳ Aguardando configuração..."
sleep 10

# ====== PASSO 3: IMPORTAR DADOS ======
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📤 PASSO 3: Importar dados para Cloud SQL${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Obter credenciais do banco
read -p "Digite o usuário do Cloud SQL [bartab]: " DB_USER
DB_USER=${DB_USER:-bartab}

read -sp "Digite a senha do Cloud SQL: " DB_PASSWORD
echo ""

read -p "Digite o nome do banco [bartab_production]: " DB_NAME
DB_NAME=${DB_NAME:-bartab_production}

# Construir connection string
CLOUD_SQL_URL="postgresql://$DB_USER:$DB_PASSWORD@$SQL_IP:5432/$DB_NAME?sslmode=require"

echo ""
echo "📥 Importando dados..."

# Importar o backup
psql "$CLOUD_SQL_URL" < "$BACKUP_FILE"

echo ""
echo -e "${GREEN}✅ Dados importados com sucesso!${NC}"

# ====== PASSO 4: VERIFICAÇÃO ======
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}✅ PASSO 4: Verificação${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo "🔍 Verificando tabelas..."
psql "$CLOUD_SQL_URL" -c "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;"

echo ""
echo "🔍 Contando registros..."
psql "$CLOUD_SQL_URL" -c "SELECT 'customers' as table, COUNT(*) as count FROM customers
UNION ALL SELECT 'items', COUNT(*) FROM items
UNION ALL SELECT 'tabs', COUNT(*) FROM tabs
UNION ALL SELECT 'tab_items', COUNT(*) FROM tab_items
UNION ALL SELECT 'payments', COUNT(*) FROM payments;"

# ====== PASSO 5: LIMPEZA ======
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🧹 PASSO 5: Limpeza${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo "🔒 Removendo seu IP da whitelist..."
gcloud sql instances patch $SQL_INSTANCE \
    --clear-authorized-networks \
    --quiet

echo -e "${GREEN}✅ IP removido${NC}"

echo ""
echo -e "${GREEN}=========================================="
echo "✅ Migração concluída com sucesso!"
echo "==========================================${NC}"
echo ""
echo "📋 Arquivo de backup salvo em: $BACKUP_FILE"
echo ""
echo "📝 Próximos passos:"
echo "  1. Atualizar o DATABASE_URL no Secret Manager:"
echo "     ./update-secrets.sh"
echo ""
echo "  2. Fazer deploy do backend:"
echo "     ./deploy.sh"
echo ""
echo "  3. Testar a aplicação"
echo ""
echo -e "${YELLOW}⚠️  Mantenha o backup em local seguro!${NC}"
echo ""

