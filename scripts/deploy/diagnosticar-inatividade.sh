#!/bin/bash

echo "🔍 Diagnóstico do Backend Render - BarTab"
echo "=========================================="
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# URLs para testar
URLS=(
  "https://bartab-backend.onrender.com"
  "https://bartab-backend-n6nm.onrender.com"
)

WORKING_URL=""

echo "1️⃣  Testando conectividade com o backend..."
echo ""

for URL in "${URLS[@]}"; do
  echo "🌐 Testando: $URL/api/health"
  
  # Fazer requisição com timeout de 60s (para acordar se estiver dormindo)
  RESPONSE=$(curl -s -w "\n%{http_code}" --max-time 60 "$URL/api/health" 2>&1)
  EXIT_CODE=$?
  
  if [ $EXIT_CODE -ne 0 ]; then
    echo -e "${RED}❌ Erro de conexão (código: $EXIT_CODE)${NC}"
    echo ""
    continue
  fi
  
  HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
  BODY=$(echo "$RESPONSE" | sed '$d')
  
  if [[ "$HTTP_CODE" == "200" ]]; then
    echo -e "${GREEN}✅ FUNCIONANDO!${NC}"
    echo "📄 Resposta: $BODY"
    WORKING_URL="$URL"
    echo ""
    break
  else
    echo -e "${YELLOW}⚠️  Status HTTP: $HTTP_CODE${NC}"
    if [[ ! -z "$BODY" ]]; then
      echo "📄 Resposta: $BODY"
    fi
  fi
  echo ""
done

echo ""
echo "2️⃣  Verificando configuração do GitHub Actions..."
echo ""

if [ -f ".github/workflows/keep-render-alive.yml" ]; then
  WORKFLOW_URL=$(grep "BACKEND_URL=" .github/workflows/keep-render-alive.yml | cut -d'"' -f2)
  echo "📄 URL configurada no workflow: $WORKFLOW_URL"
  
  if [[ ! -z "$WORKING_URL" ]]; then
    if [[ "$WORKFLOW_URL" == "$WORKING_URL" ]]; then
      echo -e "${GREEN}✅ URL do workflow está correta${NC}"
    else
      echo -e "${RED}❌ URL do workflow está INCORRETA!${NC}"
      echo ""
      echo "🔧 Ação necessária:"
      echo "   Edite o arquivo: .github/workflows/keep-render-alive.yml"
      echo "   Linha 25: Altere para BACKEND_URL=\"$WORKING_URL\""
    fi
  fi
else
  echo -e "${RED}❌ Arquivo do workflow não encontrado!${NC}"
fi

echo ""
echo "3️⃣  Resumo e Recomendações"
echo ""

if [[ ! -z "$WORKING_URL" ]]; then
  echo -e "${GREEN}✅ Backend está acessível${NC}"
  echo "🎯 URL funcionando: $WORKING_URL"
  echo ""
  echo "📋 Próximos passos:"
  echo ""
  echo "1. Verificar se GitHub Actions está habilitado:"
  echo "   → Acesse: https://github.com/[seu-usuario]/bartab/actions"
  echo "   → Procure pelo workflow 'Keep Render Backend Alive'"
  echo "   → Verifique se há execuções recentes (deve ter a cada 14 min)"
  echo ""
  echo "2. Se não houver execuções:"
  echo "   → Workflow pode estar desabilitado"
  echo "   → Clique em 'Enable workflow'"
  echo "   → Ou clique em 'Run workflow' para testar manualmente"
  echo ""
  echo "3. Se houver execuções com erro (❌):"
  echo "   → Clique na execução falhada"
  echo "   → Verifique os logs de erro"
  echo "   → Pode ser problema de URL incorreta"
  echo ""
  echo "4. Alternativa: Usar serviço externo de cron"
  echo "   → https://cron-job.org (gratuito)"
  echo "   → Configurar ping a cada 10 minutos"
  echo "   → URL: $WORKING_URL/api/health"
else
  echo -e "${RED}❌ Backend NÃO está acessível${NC}"
  echo ""
  echo "🔍 Possíveis causas:"
  echo ""
  echo "1. Backend está suspenso no Render"
  echo "   → Acesse: https://dashboard.render.com"
  echo "   → Verifique o status do serviço"
  echo "   → Veja se há mensagens de erro ou suspensão"
  echo ""
  echo "2. URL do backend mudou"
  echo "   → No dashboard do Render, copie a URL correta"
  echo "   → Atualize o arquivo .github/workflows/keep-render-alive.yml"
  echo "   → Atualize o arquivo scripts/deploy/test-health-check.sh"
  echo ""
  echo "3. Serviço excedeu limites do plano free"
  echo "   → Plano free: 750 horas/mês"
  echo "   → Se tiver múltiplos serviços, pode ter excedido"
  echo "   → Considere upgrade para plano pago ($7/mês)"
  echo ""
  echo "4. Erro no código ou no deploy"
  echo "   → Verifique os logs do serviço no Render"
  echo "   → Procure por erros de build ou runtime"
  echo "   → Verifique se o endpoint /api/health existe"
fi

echo ""
echo "📚 Mais informações:"
echo "   → Documentação completa: scripts/deploy/diagnostico-render-inativo.md"
echo ""

