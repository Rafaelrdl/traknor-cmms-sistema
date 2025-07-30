#!/bin/bash

echo "🚀 Iniciando TrakNor CMMS para GitHub Spark..."

# Configurar variáveis de ambiente
export SPARK_ENVIRONMENT=true
export VITE_PORT=5175
export NODE_ENV=development

# Limpar cache
echo "🧹 Limpando cache..."
rm -rf node_modules/.vite
rm -rf dist

# Instalar dependências se necessário
if [ ! -d "node_modules" ]; then
  echo "📦 Instalando dependências..."
  npm install
fi

# Iniciar servidor com configurações específicas do Spark
echo "✨ Iniciando servidor na porta 5175..."
npm run dev -- --host 0.0.0.0 --port 5175
