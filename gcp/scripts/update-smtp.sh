#!/bin/bash

# Script para configurar SMTP no GCP
# Atualiza os secrets no Secret Manager

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📧 Configuração SMTP - BarTab"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verificar se está logado no gcloud
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" &>/dev/null; then
    echo -e "${RED}❌ Você não está logado no gcloud${NC}"
    echo "Execute: gcloud auth login"
    exit 1
fi

PROJECT_ID=$(gcloud config get-value project)
echo -e "${BLUE}📋 Projeto atual: $PROJECT_ID${NC}"
echo ""

# Menu de opções
echo "Escolha o provedor de email:"
echo ""
echo "  1) Gmail (mais fácil, bom para testes)"
echo "  2) SendGrid (recomendado para produção)"
echo "  3) AWS SES (melhor para alto volume)"
echo "  4) Outro (manual)"
echo ""
read -p "Opção [1-4]: " OPTION

case $OPTION in
  1)
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}📧 Configurando Gmail${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "${YELLOW}IMPORTANTE:${NC} Você precisa criar uma 'Senha de App' no Gmail"
    echo ""
    echo "1. Acesse: https://myaccount.google.com/apppasswords"
    echo "2. Nome do app: BarTab"
    echo "3. Copie a senha de 16 dígitos (ex: abcd efgh ijkl mnop)"
    echo ""
    read -p "Pressione ENTER quando estiver pronto..."
    echo ""
    
    read -p "Digite seu email do Gmail: " SMTP_USER
    read -sp "Digite a senha de app (16 dígitos, sem espaços): " SMTP_PASS
    echo ""
    
    SMTP_HOST="smtp.gmail.com"
    SMTP_PORT="587"
    ;;
    
  2)
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}📧 Configurando SendGrid${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "${YELLOW}IMPORTANTE:${NC} Você precisa criar uma API Key no SendGrid"
    echo ""
    echo "1. Acesse: https://app.sendgrid.com/settings/api_keys"
    echo "2. Crie uma API Key com permissão 'Mail Send'"
    echo "3. Copie a API Key (começa com SG.)"
    echo ""
    echo "4. Verifique seu sender:"
    echo "   https://app.sendgrid.com/settings/sender_auth"
    echo ""
    read -p "Pressione ENTER quando estiver pronto..."
    echo ""
    
    read -p "Digite o email remetente (verificado no SendGrid): " SENDER_EMAIL
    echo ""
    echo -e "${YELLOW}NOTA:${NC} O username para SendGrid é sempre 'apikey'"
    SMTP_USER="apikey"
    read -sp "Digite sua API Key do SendGrid: " SMTP_PASS
    echo ""
    
    SMTP_HOST="smtp.sendgrid.net"
    SMTP_PORT="587"
    ;;
    
  3)
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}📧 Configurando AWS SES${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo "1. Acesse: https://console.aws.amazon.com/ses"
    echo "2. Vá em 'SMTP Settings'"
    echo "3. Clique em 'Create SMTP Credentials'"
    echo "4. Copie Username e Password"
    echo ""
    read -p "Pressione ENTER quando estiver pronto..."
    echo ""
    
    echo "Regiões disponíveis:"
    echo "  us-east-1, us-west-2, eu-west-1, etc."
    read -p "Digite a região (padrão: us-east-1): " AWS_REGION
    AWS_REGION=${AWS_REGION:-us-east-1}
    
    read -p "Digite o SMTP Username: " SMTP_USER
    read -sp "Digite o SMTP Password: " SMTP_PASS
    echo ""
    
    SMTP_HOST="email-smtp.$AWS_REGION.amazonaws.com"
    SMTP_PORT="587"
    ;;
    
  4)
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}📧 Configuração Manual${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    
    read -p "SMTP Host: " SMTP_HOST
    read -p "SMTP Port: " SMTP_PORT
    read -p "SMTP User: " SMTP_USER
    read -sp "SMTP Password: " SMTP_PASS
    echo ""
    ;;
    
  *)
    echo -e "${RED}❌ Opção inválida${NC}"
    exit 1
    ;;
esac

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📝 Resumo da Configuração${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "SMTP Host: $SMTP_HOST"
echo "SMTP Port: $SMTP_PORT"
echo "SMTP User: $SMTP_USER"
echo "SMTP Pass: ${SMTP_PASS:0:4}****"
echo ""
read -p "Confirma essas configurações? [s/N]: " CONFIRM

if [[ ! $CONFIRM =~ ^[Ss]$ ]]; then
    echo -e "${YELLOW}❌ Cancelado${NC}"
    exit 0
fi

echo ""
echo -e "${BLUE}🔄 Atualizando secrets no GCP...${NC}"
echo ""

# Atualizar SMTP_USER
echo "$SMTP_USER" | gcloud secrets versions add bartab-smtp-user --data-file=- 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ bartab-smtp-user atualizado${NC}"
else
    echo -e "${RED}❌ Erro ao atualizar bartab-smtp-user${NC}"
    exit 1
fi

# Atualizar SMTP_PASS
echo "$SMTP_PASS" | gcloud secrets versions add bartab-smtp-pass --data-file=- 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ bartab-smtp-pass atualizado${NC}"
else
    echo -e "${RED}❌ Erro ao atualizar bartab-smtp-pass${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Secrets atualizados com sucesso!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo -e "${YELLOW}⚠️  PRÓXIMOS PASSOS:${NC}"
echo ""
echo "1. Reiniciar o backend para carregar os novos secrets:"
echo -e "${BLUE}   gcloud run deploy bartab-backend \\${NC}"
echo -e "${BLUE}     --image=gcr.io/$PROJECT_ID/bartab-backend:latest \\${NC}"
echo -e "${BLUE}     --region=us-central1${NC}"
echo ""
echo "2. Verificar os logs para confirmar:"
echo -e "${BLUE}   gcloud run services logs read bartab-backend --limit=50 | grep -i smtp${NC}"
echo ""
echo "3. Testar envio de email (no frontend ou via API)"
echo ""

read -p "Deseja reiniciar o backend agora? [s/N]: " RESTART

if [[ $RESTART =~ ^[Ss]$ ]]; then
    echo ""
    echo -e "${BLUE}🔄 Reiniciando backend...${NC}"
    gcloud run deploy bartab-backend \
        --image=gcr.io/$PROJECT_ID/bartab-backend:latest \
        --region=us-central1 \
        --quiet
    
    if [ $? -eq 0 ]; then
        echo ""
        echo -e "${GREEN}✅ Backend reiniciado com sucesso!${NC}"
        echo ""
        echo "Aguarde alguns segundos e verifique os logs:"
        echo -e "${BLUE}gcloud run services logs read bartab-backend --limit=20${NC}"
    else
        echo ""
        echo -e "${RED}❌ Erro ao reiniciar o backend${NC}"
        echo "Tente reiniciar manualmente"
    fi
else
    echo ""
    echo -e "${YELLOW}⚠️  Lembre-se de reiniciar o backend manualmente!${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Configuração concluída!${NC}"
echo ""

