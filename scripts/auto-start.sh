#!/bin/bash

echo "🚀 Iniciando TrakNor CMMS com Spark Support..."
echo "📋 IMPORTANTE: Mantendo integração essencial com GitHub Spark"

# Verifica se as portas estão em uso
if lsof -i :4000 > /dev/null 2>&1; then
  echo "⚠️  Porta 4000 em uso, matando processo..."
  fuser -k 4000/tcp 2>/dev/null || true
fi

if lsof -i :5175 > /dev/null 2>&1; then
  echo "⚠️  Porta 5175 em uso, matando processo..."
  fuser -k 5175/tcp 2>/dev/null || true
fi

# Aguarda um momento para as portas serem liberadas
sleep 2

# Inicia o proxy primeiro
echo "📡 Iniciando Spark Proxy (porta 4000)..."
npm run dev:backend &
PROXY_PID=$!

# Aguarda proxy inicializar
sleep 3

# Verifica se o proxy iniciou corretamente
if ! lsof -i :4000 > /dev/null 2>&1; then
  echo "❌ Erro: Proxy não conseguiu iniciar na porta 4000"
  exit 1
fi

# Inicia o Vite
echo "⚡ Iniciando Vite Dev Server (porta 5175)..."
npm run dev &
VITE_PID=$!

# Aguarda Vite inicializar
sleep 5

# Verifica se o Vite iniciou corretamente
if ! lsof -i :5175 > /dev/null 2>&1; then
  echo "❌ Erro: Vite não conseguiu iniciar na porta 5175"
  kill $PROXY_PID 2>/dev/null || true
  exit 1
fi

echo "✅ Serviços iniciados com sucesso:"
echo "   - Proxy: PID $PROXY_PID (porta 4000)"
echo "   - Vite:  PID $VITE_PID (porta 5175)"
echo ""
echo "🔗 Acesse via:"
echo "   - Direto: http://localhost:5175"
echo "   - Proxy:  http://localhost:4000"
echo "   - Health: http://localhost:4000/health"
echo ""
echo "🎯 GitHub Spark Preview: https://spark-preview--traknor-cmms-sistema--rafaelrdl.github.app"
echo ""
echo "Para parar: Ctrl+C ou kill $PROXY_PID $VITE_PID"

# Função para cleanup quando script é interrompido
cleanup() {
  echo "🛑 Parando serviços..."
  kill $PROXY_PID 2>/dev/null || true
  kill $VITE_PID 2>/dev/null || true
  echo "✅ Serviços parados"
  exit 0
}

# Captura sinais de interrupção
trap cleanup SIGINT SIGTERM

# Mantém script rodando
wait
