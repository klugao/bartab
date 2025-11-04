#!/bin/bash

# Script de build para Render - Força instalação limpa
# Resolve problema com dependências opcionais do Rollup

set -e  # Para em caso de erro

echo "🧹 Limpando cache e node_modules..."
cd frontend
rm -rf node_modules
rm -rf .cache
rm -rf dist

echo "📦 Instalando dependências (sem opcionais)..."
npm install --include=dev --omit=optional --no-audit

echo "🏗️ Executando build..."
npm run build

echo "✅ Build concluído!"

