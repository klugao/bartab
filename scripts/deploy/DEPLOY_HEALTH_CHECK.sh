#!/bin/bash

echo "🚀 Deploy do Health Check para o Render"
echo "========================================"
echo ""

# Verificar se estamos no diretório correto
if [ ! -f "backend/src/app.controller.ts" ]; then
    echo "❌ Erro: Execute este script na raiz do projeto bartab"
    exit 1
fi

echo "📝 Verificando mudanças..."
git status

echo ""
echo "📦 Fazendo commit das mudanças (se houver)..."
git add .
git commit -m "feat: adiciona health check endpoint para Render" || echo "✅ Sem mudanças para commitar"

echo ""
echo "📤 Enviando para o GitHub..."
git push origin main

echo ""
echo "✅ Push concluído!"
echo ""
echo "🎯 Próximos passos:"
echo "1. Acesse: https://dashboard.render.com"
echo "2. Selecione seu serviço 'bartab-backend'"
echo "3. O deploy deve iniciar automaticamente em alguns segundos"
echo "4. Aguarde o deploy terminar (~2-5 minutos)"
echo "5. Teste: curl https://bartab-backend.onrender.com/api/health"
echo ""
echo "Se o deploy não iniciar automaticamente:"
echo "  → Clique em 'Manual Deploy' → 'Deploy latest commit'"

