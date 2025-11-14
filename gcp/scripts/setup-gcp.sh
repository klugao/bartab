#!/bin/bash

# Script de configuração inicial do GCP
# Este script prepara todo o ambiente GCP para o BarTab

set -e

echo "🚀 Configuração inicial do GCP para BarTab"
echo "=========================================="
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar se está logado no gcloud
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" &>/dev/null; then
    echo -e "${RED}❌ Você não está logado no gcloud${NC}"
    echo "Execute: gcloud auth login"
    exit 1
fi

echo -e "${GREEN}✅ Autenticado no gcloud${NC}"

# Pedir Project ID
read -p "Digite o ID do seu projeto GCP: " PROJECT_ID

if [ -z "$PROJECT_ID" ]; then
    echo -e "${RED}❌ Project ID não pode ser vazio${NC}"
    exit 1
fi

echo ""
echo "📋 Configurando projeto: $PROJECT_ID"

# Configurar projeto padrão
gcloud config set project $PROJECT_ID

# Habilitar APIs necessárias
echo ""
echo "🔧 Habilitando APIs necessárias..."
gcloud services enable \
    run.googleapis.com \
    cloudbuild.googleapis.com \
    sqladmin.googleapis.com \
    secretmanager.googleapis.com \
    containerregistry.googleapis.com \
    cloudresourcemanager.googleapis.com

echo -e "${GREEN}✅ APIs habilitadas${NC}"

# Criar Service Account
echo ""
echo "👤 Criando Service Account..."
SA_NAME="bartab-backend-sa"
SA_EMAIL="$SA_NAME@$PROJECT_ID.iam.gserviceaccount.com"

if gcloud iam service-accounts describe $SA_EMAIL &>/dev/null; then
    echo -e "${YELLOW}⚠️  Service Account já existe${NC}"
else
    gcloud iam service-accounts create $SA_NAME \
        --display-name="BarTab Backend Service Account" \
        --description="Service account para o backend do BarTab"
    echo -e "${GREEN}✅ Service Account criada${NC}"
fi

# Atribuir permissões
echo ""
echo "🔐 Atribuindo permissões..."
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SA_EMAIL" \
    --role="roles/cloudsql.client" \
    --condition=None

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SA_EMAIL" \
    --role="roles/secretmanager.secretAccessor" \
    --condition=None

echo -e "${GREEN}✅ Permissões atribuídas${NC}"

# Criar secrets vazios (serão preenchidos depois)
echo ""
echo "🔒 Criando secrets no Secret Manager..."

SECRETS=(
    "bartab-database-url:URL de conexão com o banco de dados"
    "bartab-jwt-secret:Secret para JWT"
    "bartab-google-client-id:Google OAuth Client ID"
    "bartab-google-client-secret:Google OAuth Client Secret"
    "bartab-smtp-user:Usuário SMTP"
    "bartab-smtp-pass:Senha SMTP"
)

for secret_info in "${SECRETS[@]}"; do
    IFS=':' read -r secret_id description <<< "$secret_info"
    
    if gcloud secrets describe $secret_id --project=$PROJECT_ID &>/dev/null; then
        echo -e "${YELLOW}⚠️  Secret $secret_id já existe${NC}"
    else
        echo "placeholder" | gcloud secrets create $secret_id \
            --data-file=- \
            --replication-policy="automatic" \
            --project=$PROJECT_ID
        echo -e "${GREEN}✅ Secret $secret_id criado${NC}"
    fi
done

echo ""
echo -e "${GREEN}=========================================="
echo "✅ Configuração inicial concluída!"
echo "==========================================${NC}"
echo ""
echo "📝 Próximos passos:"
echo "  1. Configure os secrets com valores reais:"
echo "     ./update-secrets.sh"
echo ""
echo "  2. Crie a infraestrutura com Terraform:"
echo "     cd gcp/terraform"
echo "     terraform init"
echo "     terraform plan"
echo "     terraform apply"
echo ""
echo "  3. Faça o deploy das aplicações:"
echo "     ./deploy.sh"
echo ""

