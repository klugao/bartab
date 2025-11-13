#!/bin/bash

echo "🏥 Testando Health Check do Backend"
echo "===================================="
echo ""

BACKEND_URL="https://bartab-backend-n6nm.onrender.com"

echo "🌐 URL: $BACKEND_URL/api/health"
echo ""
echo "🔄 Fazendo requisição..."
echo ""

RESPONSE=$(curl -s -w "\n%{http_code}" "$BACKEND_URL/api/health")
HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
BODY=$(echo "$RESPONSE" | head -n -1)

echo "📊 Status HTTP: $HTTP_CODE"
echo "📄 Resposta:"
echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
echo ""

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Backend está funcionando perfeitamente!"
    echo ""
    echo "🎉 Próximos passos:"
    echo "1. O GitHub Actions vai pingar este endpoint a cada hora"
    echo "2. Para testar o workflow:"
    echo "   → Acesse: https://github.com/klugao/bartab/actions"
    echo "   → Clique em 'Keep Render Backend Alive'"
    echo "   → Clique em 'Run workflow'"
    exit 0
elif [ "$HTTP_CODE" = "404" ]; then
    echo "⚠️  Endpoint ainda não disponível (404)"
    echo ""
    echo "💡 Isso significa que o deploy ainda não foi feito ou está em andamento."
    echo ""
    echo "📋 Próximos passos:"
    echo "1. Acesse: https://dashboard.render.com"
    echo "2. Selecione o serviço 'bartab-backend'"
    echo "3. Verifique se há um deploy em andamento"
    echo "4. Se não houver, clique em 'Manual Deploy' → 'Deploy latest commit'"
    echo "5. Aguarde o deploy terminar e execute este script novamente"
    exit 1
else
    echo "❌ Erro ao acessar o backend"
    echo ""
    echo "Possíveis causas:"
    echo "- Backend está acordando (aguarde 30 segundos e tente novamente)"
    echo "- Backend está offline"
    echo "- Problema de rede"
    exit 2
fi

