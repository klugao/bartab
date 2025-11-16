#!/bin/bash

# Comandos prontos para corrigir o OAuth - COPIE E COLE NO SEU TERMINAL

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 COMANDOS PARA CORRIGIR O OAUTH"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "📋 PASSO 1: Configure no Google Cloud Console"
echo ""
echo "1. Acesse: https://console.cloud.google.com/apis/credentials"
echo ""
echo "2. Clique nas suas credenciais OAuth 2.0"
echo ""
echo "3. Adicione estas URLs:"
echo ""
echo "   URIs de redirecionamento autorizadas:"
echo "   https://bartab-backend-312426210115.us-central1.run.app/api/auth/google/callback"
echo ""
echo "   Origens JavaScript autorizadas:"
echo "   https://bartab-frontend-312426210115.us-central1.run.app"
echo ""
echo "4. Clique em SALVAR"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

read -p "Você já configurou no Google Console? (s/n) " -n 1 -r
echo ""
echo ""

if [[ ! $REPLY =~ ^[Ss]$ ]]; then
    echo "⚠️  Configure primeiro no Google Console e execute este script novamente."
    exit 0
fi

echo "🔄 PASSO 2: Atualizando Cloud Run..."
echo ""

# Atualizar backend
echo "Atualizando bartab-backend..."
gcloud run services update bartab-backend \
    --platform=managed \
    --region=us-central1 \
    --update-env-vars="GOOGLE_CALLBACK_URL=https://bartab-backend-312426210115.us-central1.run.app/api/auth/google/callback,FRONTEND_URL=https://bartab-frontend-312426210115.us-central1.run.app,CORS_ORIGIN=https://bartab-frontend-312426210115.us-central1.run.app" \
    --quiet

if [ $? -eq 0 ]; then
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "✅ SUCESSO! Configuração atualizada!"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "🧪 TESTE AGORA:"
    echo ""
    echo "1. Aguarde 1-2 minutos (propagação)"
    echo "2. Abra: https://bartab-frontend-312426210115.us-central1.run.app"
    echo "3. Limpe o cache (Cmd+Shift+R ou Ctrl+Shift+R)"
    echo "4. Clique em 'Entrar com Google'"
    echo "5. Deve funcionar! 🎉"
    echo ""
    echo "❓ Ainda não funciona?"
    echo "   • Tente em aba anônima"
    echo "   • Verifique se salvou no Google Console"
    echo "   • Veja os logs: gcloud run services logs read bartab-backend --limit=30"
    echo ""
else
    echo ""
    echo "❌ Erro ao atualizar Cloud Run"
    echo ""
    echo "Tente executar manualmente:"
    echo ""
    echo "gcloud run services update bartab-backend \\"
    echo "    --platform=managed \\"
    echo "    --region=us-central1 \\"
    echo "    --update-env-vars=\"GOOGLE_CALLBACK_URL=https://bartab-backend-312426210115.us-central1.run.app/api/auth/google/callback,FRONTEND_URL=https://bartab-frontend-312426210115.us-central1.run.app,CORS_ORIGIN=https://bartab-frontend-312426210115.us-central1.run.app\""
    echo ""
fi


