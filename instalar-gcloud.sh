#!/bin/bash

# Script para instalar o Google Cloud SDK no macOS
# Uso: ./instalar-gcloud.sh

set -e

echo "📦 Instalação do Google Cloud SDK"
echo "=================================="
echo ""

# Verificar se já está instalado
if command -v gcloud &> /dev/null; then
    echo "✅ Google Cloud SDK já está instalado!"
    gcloud version
    echo ""
    echo "Para atualizar, execute: gcloud components update"
    exit 0
fi

echo "🔄 Baixando e instalando o Google Cloud SDK..."
echo ""

# Baixar e instalar
curl https://sdk.cloud.google.com | bash

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Google Cloud SDK instalado!"
echo ""
echo "📝 Próximos passos:"
echo ""
echo "1. Reinicie seu terminal ou execute:"
echo "   exec -l \$SHELL"
echo ""
echo "2. Inicialize o gcloud:"
echo "   gcloud init"
echo ""
echo "3. Ou configure manualmente:"
echo "   gcloud auth login"
echo "   gcloud config set project bartab-475300"
echo ""
echo "4. Depois, execute o script de atualização do OAuth:"
echo "   ./atualizar-oauth.sh"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

