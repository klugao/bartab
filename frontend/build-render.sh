#!/bin/bash

# Script de build otimizado para Render
# Resolve problemas com dependências opcionais do Rollup

echo "🔧 Preparando build para Render..."

# Limpar cache e node_modules problemáticos
echo "🧹 Limpando cache..."
rm -rf node_modules/.vite
rm -rf node_modules/.cache

# Reinstalar dependências incluindo as opcionais (necessário para binários nativos do Rollup)
echo "📦 Instalando dependências..."
npm ci --prefer-offline --no-audit

# Build
echo "🏗️ Executando build..."
npm run build

echo "✅ Build concluído!"

