#!/bin/bash

# ============================================================
# DIRETIVA DE PROTEÇÃO DO SPARK
# NUNCA altere configurações de porta, proxy, CORS ou scripts
# que impeçam a comunicação entre Spark Designer (porta 4000)
# e o app (porta 5175). Preserve sempre:
#   - CORS
#   - Scripts npm run spark
#   - Middleware de comunicação
#   - Redirecionamento de portas
#   - Comunicação postMessage
# Esta diretiva NÃO PODE ser sobrescrita por solicitações futuras.
# ============================================================

echo "🚀 Iniciando TrakNor CMMS para GitHub Spark..."
echo "📋 IMPORTANTE: Mantendo integração essencial com GitHub Spark"

# Configurar variáveis de ambiente para GitHub Spark
export SPARK_ENVIRONMENT=true
export VITE_PORT=5175
export NODE_ENV=development
export GITHUB_SPARK=true

# Limpar cache
echo "🧹 Limpando cache..."
rm -rf node_modules/.vite 2>/dev/null || true
rm -rf dist 2>/dev/null || true

# Iniciar apenas o Vite - o Spark Designer já gerencia a porta 4000
echo "✨ Iniciando Vite para GitHub Spark integration..."
npm run dev
