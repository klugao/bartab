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
# Instala todas as dependências incluindo opcionais
# O npm automaticamente instala apenas as compatíveis com a plataforma
npm install --include=optional --include=dev --no-audit

echo "🏗️ Executando build..."
# ROLLUP_USE_NATIVE=false já está no script package.json
npm run build

echo "✅ Build concluído com sucesso!"
ls -lh dist/

