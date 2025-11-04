#!/bin/bash

# Script de build para Render - Força instalação limpa
# Resolve problema com dependências opcionais do Rollup

set -e  # Para em caso de erro

echo "🧹 Limpando cache e node_modules..."
cd frontend
rm -rf node_modules
rm -rf .cache
rm -rf dist

echo "📦 Instalando dependências..."
# Força Rollup a NÃO usar binários nativos
export ROLLUP_USE_NATIVE=false
npm install --include=dev --no-audit

echo "🏗️ Executando build..."
# Garante que Rollup use JavaScript puro
export ROLLUP_USE_NATIVE=false
npm run build

echo "✅ Build concluído!"

