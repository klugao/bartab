#!/bin/bash

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 SCRIPT DE TESTE - PROBLEMA DE REGISTRO"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Este script irá:"
echo "  1. Parar processos antigos do backend e frontend"
echo "  2. Iniciar o backend com logs detalhados"
echo "  3. Iniciar o frontend"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Parar processos antigos
echo "🔴 Parando processos antigos..."
pkill -f "nest start" 2>/dev/null
pkill -f "vite" 2>/dev/null
sleep 2

# Limpar logs antigos
echo "🧹 Limpando logs antigos..."
rm -f backend.log frontend.log 2>/dev/null

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 INICIANDO BACKEND"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Iniciar backend
cd backend
npm run start:dev > ../backend.log 2>&1 &
BACKEND_PID=$!
cd ..

echo "✅ Backend iniciado (PID: $BACKEND_PID)"
echo "📄 Logs do backend: backend.log"
echo ""
echo "⏳ Aguardando backend inicializar (15 segundos)..."
sleep 15

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 INICIANDO FRONTEND"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Iniciar frontend
cd frontend
npm run dev > ../frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

echo "✅ Frontend iniciado (PID: $FRONTEND_PID)"
echo "📄 Logs do frontend: frontend.log"
echo ""
echo "⏳ Aguardando frontend inicializar (5 segundos)..."
sleep 5

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ TUDO PRONTO PARA TESTE!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🌐 ACESSE: http://localhost:5173"
echo ""
echo "📋 INSTRUÇÕES:"
echo ""
echo "  1. Abra o navegador em: http://localhost:5173"
echo "  2. Faça login com Google"
echo "  3. Preencha o nome do estabelecimento"
echo "  4. Clique em 'Criar conta'"
echo "  5. Abra o Console do Navegador (F12 → Console)"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 MONITORAR LOGS:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  Ver logs do BACKEND em tempo real:"
echo "  → tail -f backend.log"
echo ""
echo "  Ver logs do FRONTEND em tempo real:"
echo "  → tail -f frontend.log"
echo ""
echo "  Ver ÚLTIMOS logs do backend:"
echo "  → tail -100 backend.log | grep -E '(REGISTER|ERROR|ERRO)'"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🛑 PARAR TUDO:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  Execute:"
echo "  → kill $BACKEND_PID $FRONTEND_PID"
echo ""
echo "  OU use Ctrl+C nos terminais"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🔍 PROCURE POR:"
echo ""
echo "  No Console do Navegador (F12):"
echo "    • 🟢 [FRONTEND] ← logs normais"
echo "    • ✅ [FRONTEND] ← sucesso"
echo "    • ❌ [FRONTEND] ← erro"
echo ""
echo "  Nos logs do backend (backend.log):"
echo "    • 🔵 [REGISTER] ← processando"
echo "    • ✅ [REGISTER] ← sucesso"
echo "    • ❌ [REGISTER] ← AQUI ESTARÁ O ERRO!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Pressione Ctrl+C para parar este script (backend e frontend continuarão rodando)"
echo ""

# Manter o script rodando e monitorando
tail -f backend.log

