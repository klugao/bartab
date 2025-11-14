#!/bin/bash

# Script para fazer backup manual do banco de dados Cloud SQL
# Backups automáticos já são feitos pelo GCP, mas este script permite backups manuais

set -e

echo "💾 Backup Manual - Cloud SQL"
echo "============================"
echo ""

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Verificar se está logado
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" &>/dev/null; then
    echo -e "${RED}❌ Você não está logado no gcloud${NC}"
    exit 1
fi

# Obter informações
PROJECT_ID=$(gcloud config get-value project)
SQL_INSTANCE=$(gcloud sql instances list --filter="name:bartab-postgres" --format="value(name)" | head -n1)

if [ -z "$SQL_INSTANCE" ]; then
    echo -e "${RED}❌ Instância Cloud SQL não encontrada${NC}"
    exit 1
fi

echo "📋 Projeto: $PROJECT_ID"
echo "🗄️  Instância: $SQL_INSTANCE"
echo ""

# Nome do backup
BACKUP_ID="manual-backup-$(date +%Y%m%d-%H%M%S)"

echo "💾 Criando backup: $BACKUP_ID"
echo ""

# Criar backup
gcloud sql backups create \
    --instance=$SQL_INSTANCE \
    --description="Backup manual criado em $(date)"

echo ""
echo -e "${GREEN}✅ Backup criado com sucesso!${NC}"
echo ""

# Listar backups recentes
echo "📋 Backups recentes:"
gcloud sql backups list \
    --instance=$SQL_INSTANCE \
    --limit=5

echo ""
echo "📝 Para restaurar um backup:"
echo "   gcloud sql backups restore BACKUP_ID --backup-instance=$SQL_INSTANCE"
echo ""

