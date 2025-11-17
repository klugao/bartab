#!/bin/bash

# Script de deploy completo para GCP
# Este script faz o deploy do backend e frontend no Cloud Run

set -e

echo "🚀 Deploy BarTab - GCP Cloud Run"
echo "================================="
echo ""

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Verificar se está logado
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" &>/dev/null; then
    echo -e "${RED}❌ Você não está logado no gcloud${NC}"
    echo "Execute: gcloud auth login"
    exit 1
fi

# Obter projeto e região
PROJECT_ID=$(gcloud config get-value project)
REGION=${REGION:-us-central1}

if [ -z "$PROJECT_ID" ]; then
    echo -e "${RED}❌ Nenhum projeto configurado${NC}"
    exit 1
fi

echo "📋 Projeto: $PROJECT_ID"
echo "🌍 Região: $REGION"
echo ""

# Calcular diretório raiz do projeto (uma vez, antes de qualquer cd)
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
echo "📁 Diretório raiz do projeto: $PROJECT_ROOT"
echo ""

# Perguntar o que fazer
echo "O que você deseja fazer?"
echo "  1) Deploy completo (Backend + Frontend)"
echo "  2) Deploy apenas Backend"
echo "  3) Deploy apenas Frontend"
echo ""
read -p "Escolha uma opção [1-3]: " OPTION

case $OPTION in
    1)
        DEPLOY_BACKEND=true
        DEPLOY_FRONTEND=true
        ;;
    2)
        DEPLOY_BACKEND=true
        DEPLOY_FRONTEND=false
        ;;
    3)
        DEPLOY_BACKEND=false
        DEPLOY_FRONTEND=true
        ;;
    *)
        echo -e "${RED}❌ Opção inválida${NC}"
        exit 1
        ;;
esac

echo ""

# ====== BACKEND ======
if [ "$DEPLOY_BACKEND" = true ]; then
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}📦 BACKEND - Build e Deploy${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    
    # Ir para diretório do backend (PROJECT_ROOT já foi calculado no início)
    BACKEND_DIR="$PROJECT_ROOT/backend"
    
    if [ ! -d "$BACKEND_DIR" ]; then
        echo -e "${RED}❌ Diretório backend não encontrado em: $BACKEND_DIR${NC}"
        exit 1
    fi
    cd "$BACKEND_DIR" || exit 1
    
    echo "🔨 Building imagem Docker do backend..."
    docker build --platform linux/amd64 -t gcr.io/$PROJECT_ID/bartab-backend:latest .
    
    echo ""
    echo "📤 Enviando imagem para Container Registry..."
    docker push gcr.io/$PROJECT_ID/bartab-backend:latest
    
    echo ""
    echo "🚀 Fazendo deploy no Cloud Run..."
    
    # Obter connection name do Cloud SQL
    SQL_INSTANCE=$(gcloud sql instances list --filter="name:bartab-postgres" --format="value(connectionName)" 2>/dev/null || echo "")
    
    if [ -z "$SQL_INSTANCE" ]; then
        echo -e "${YELLOW}⚠️  Instância Cloud SQL não encontrada. Deploy sem conexão com banco.${NC}"
        SQL_ARGS=""
    else
        SQL_ARGS="--add-cloudsql-instances=$SQL_INSTANCE"
        echo "🗄️  Conectando ao Cloud SQL: $SQL_INSTANCE"
    fi
    
    # Obter project number para construir URLs com formato com project number
    PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format="value(projectNumber)")
    
    # Construir URLs usando project number (formato preferido)
    FRONTEND_URL_EXISTING="https://bartab-frontend-${PROJECT_NUMBER}.${REGION}.run.app"
    BACKEND_URL_EXISTING="https://bartab-backend-${PROJECT_NUMBER}.${REGION}.run.app"
    CALLBACK_URL="${BACKEND_URL_EXISTING}/api/auth/google/callback"
    
    echo "🔗 Frontend URL: $FRONTEND_URL_EXISTING"
    echo "🔗 Backend URL: $BACKEND_URL_EXISTING"
    
    echo ""
    echo "📋 Configurando variáveis de ambiente:"
    if [ -n "$FRONTEND_URL_EXISTING" ]; then
        echo "   FRONTEND_URL: $FRONTEND_URL_EXISTING"
        echo "   CORS_ORIGIN: $FRONTEND_URL_EXISTING"
    else
        echo "   ⚠️  FRONTEND_URL: não configurado (será necessário atualizar depois)"
    fi
    if [ -n "$CALLBACK_URL" ]; then
        echo "   GOOGLE_CALLBACK_URL: $CALLBACK_URL"
    else
        echo "   ⚠️  GOOGLE_CALLBACK_URL: será atualizado após deploy"
    fi
    echo ""
    
    # Construir string de env vars apenas com valores não vazios
    # NOTA: PORT é reservado pelo Cloud Run e não pode ser definido manualmente
    ENV_VARS="NODE_ENV=production"
    if [ -n "$FRONTEND_URL_EXISTING" ]; then
        ENV_VARS="${ENV_VARS},FRONTEND_URL=${FRONTEND_URL_EXISTING},CORS_ORIGIN=${FRONTEND_URL_EXISTING}"
    fi
    if [ -n "$CALLBACK_URL" ]; then
        ENV_VARS="${ENV_VARS},GOOGLE_CALLBACK_URL=${CALLBACK_URL}"
    fi
    ENV_VARS="${ENV_VARS},REGION=${REGION}"
    
    gcloud run deploy bartab-backend \
        --image=gcr.io/$PROJECT_ID/bartab-backend:latest \
        --platform=managed \
        --region=$REGION \
        --allow-unauthenticated \
        --service-account=bartab-backend-sa@$PROJECT_ID.iam.gserviceaccount.com \
        --set-env-vars="${ENV_VARS}" \
        --set-secrets="DATABASE_URL=bartab-database-url:latest,JWT_SECRET=bartab-jwt-secret:latest,GOOGLE_CLIENT_ID=bartab-google-client-id:latest,GOOGLE_CLIENT_SECRET=bartab-google-client-secret:latest,SMTP_USER=bartab-smtp-user:latest,SMTP_PASS=bartab-smtp-pass:latest" \
        --memory=512Mi \
        --cpu=1 \
        --timeout=300s \
        --max-instances=10 \
        --min-instances=0 \
        $SQL_ARGS
    
    # Atualizar variáveis com URLs usando project number (formato preferido)
    echo ""
    echo "🔄 Atualizando variáveis com URLs usando project number..."
    UPDATE_ENV="GOOGLE_CALLBACK_URL=${CALLBACK_URL},FRONTEND_URL=${FRONTEND_URL_EXISTING},CORS_ORIGIN=${FRONTEND_URL_EXISTING},PROJECT_NUMBER=${PROJECT_NUMBER},REGION=${REGION}"
    
    gcloud run services update bartab-backend \
        --platform=managed \
        --region=$REGION \
        --update-env-vars="${UPDATE_ENV}" \
        --quiet
    
    echo ""
    echo -e "${GREEN}✅ Backend deployed com sucesso!${NC}"
    echo -e "${GREEN}🔗 URL: ${BACKEND_URL_EXISTING}${NC}"
    echo ""
    
    # Voltar para o diretório raiz
    cd ..
fi

# ====== FRONTEND ======
if [ "$DEPLOY_FRONTEND" = true ]; then
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}🎨 FRONTEND - Build e Deploy${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    
    # Obter project number para construir URL do backend com project number
    PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format="value(projectNumber)")
    
    # Usar URL com project number (formato preferido)
    BACKEND_URL="https://bartab-backend-${PROJECT_NUMBER}.${REGION}.run.app"
    
    echo "🔗 Backend URL (usando project number): $BACKEND_URL"
    echo "🔗 API URL: ${BACKEND_URL}/api"
    
    # Ir para diretório do frontend (PROJECT_ROOT já foi calculado no início)
    FRONTEND_DIR="$PROJECT_ROOT/frontend"
    
    if [ ! -d "$FRONTEND_DIR" ]; then
        echo -e "${RED}❌ Diretório frontend não encontrado em: $FRONTEND_DIR${NC}"
        exit 1
    fi
    cd "$FRONTEND_DIR" || exit 1
    
    echo ""
    echo "🔨 Building imagem Docker do frontend..."
    docker build \
        --platform linux/amd64 \
        --build-arg VITE_API_BASE_URL=${BACKEND_URL}/api \
        -t gcr.io/$PROJECT_ID/bartab-frontend:latest .
    
    echo ""
    echo "📤 Enviando imagem para Container Registry..."
    docker push gcr.io/$PROJECT_ID/bartab-frontend:latest
    
    echo ""
    echo "🚀 Fazendo deploy no Cloud Run..."
    gcloud run deploy bartab-frontend \
        --image=gcr.io/$PROJECT_ID/bartab-frontend:latest \
        --platform=managed \
        --region=$REGION \
        --allow-unauthenticated \
        --memory=256Mi \
        --cpu=1 \
        --timeout=60s \
        --max-instances=10 \
        --min-instances=0
    
    # Obter URL do frontend
    FRONTEND_URL=$(gcloud run services describe bartab-frontend --platform=managed --region=$REGION --format="value(status.url)")
    
    echo ""
    echo -e "${GREEN}✅ Frontend deployed com sucesso!${NC}"
    echo -e "${GREEN}🔗 URL: $FRONTEND_URL${NC}"
    echo ""
    
    # Atualizar CORS no backend
    if [ "$DEPLOY_BACKEND" = false ] && [ ! -z "$FRONTEND_URL" ]; then
        echo -e "${YELLOW}⚠️  Lembre-se de atualizar o CORS do backend com a URL do frontend:${NC}"
        echo "   CORS_ORIGIN=$FRONTEND_URL"
        echo "   FRONTEND_URL=$FRONTEND_URL"
        echo ""
        echo "   Execute: ./update-backend-env.sh"
    fi
    
    cd ..
fi

echo ""
echo -e "${GREEN}=========================================="
echo "✅ Deploy concluído com sucesso!"
echo "==========================================${NC}"
echo ""

if [ ! -z "$BACKEND_URL" ]; then
    echo "📦 Backend: $BACKEND_URL"
fi

if [ ! -z "$FRONTEND_URL" ]; then
    echo "🎨 Frontend: $FRONTEND_URL"
fi

echo ""
echo "📝 Próximos passos:"
echo "  • Testar a aplicação"
echo "  • Configurar domínio customizado (opcional)"
echo "  • Configurar Cloud CDN (opcional)"
echo "  • Configurar monitoramento e alertas"
echo ""

