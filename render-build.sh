#!/bin/bash

# Script de build para Render
# Configurado para funcionar com ou sem dependências opcionais

set -e  # Para em caso de erro

echo "🚀 Iniciando build do frontend..."
cd frontend

echo "🧹 Limpando arquivos antigos..."
rm -rf dist
rm -rf .cache

echo "📦 Instalando dependências..."
# Usar npm install normal que lida melhor com dependências opcionais
npm install --include=dev --no-audit

echo "🏗️ Executando build..."
# ROLLUP_USE_NATIVE=false já está no script package.json
npm run build

echo "✅ Build concluído com sucesso!"
ls -lh dist/

