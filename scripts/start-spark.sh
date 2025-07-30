#!/bin/bash

echo "🚀 Iniciando TrakNor CMMS com GitHub Spark Proxy..."
echo "📋 IMPORTANTE: Mantendo integração essencial com GitHub Spark"

# Instalar dependências se necessário
if [ ! -f "node_modules/express/package.json" ]; then
  echo "📦 Instalando dependências do proxy para GitHub Spark..."
  npm install express cors http-proxy-middleware concurrently
fi

# Matar processos anteriores nas portas
echo "🧹 Limpando portas para GitHub Spark communication..."
lsof -ti:4000 | xargs kill -9 2>/dev/null || true
lsof -ti:5175 | xargs kill -9 2>/dev/null || true

# Configurar variáveis de ambiente para GitHub Spark
export SPARK_ENVIRONMENT=true
export VITE_PORT=5175
export NODE_ENV=development
export GITHUB_SPARK=true

# Limpar cache
echo "🧹 Limpando cache..."
rm -rf node_modules/.vite 2>/dev/null || true
rm -rf dist 2>/dev/null || true

# Iniciar servidor proxy e Vite em paralelo para GitHub Spark
echo "✨ Iniciando servidores para GitHub Spark integration..."
npm run dev:spark
