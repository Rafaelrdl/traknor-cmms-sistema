#!/bin/bash

echo "🔧 Corrigindo configuração para GitHub Spark..."

# Tornar o script de preview executável
chmod +x start-spark-preview.sh

# Limpar builds anteriores
echo "🧹 Limpando builds anteriores..."
rm -rf dist
rm -rf node_modules/.vite

# Reinstalar dependências
echo "📦 Reinstalando dependências..."
npm ci

# Fazer build de produção
echo "🔨 Criando build de produção..."
npm run build

# Iniciar servidor de preview na porta esperada pelo Spark
echo "🚀 Iniciando servidor na porta 4173..."
npx vite preview --port 4173 --host 0.0.0.0 --strictPort
