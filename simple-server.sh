#!/bin/bash

echo "🌐 Iniciando servidor HTTP simples..."

# Build se necessário
if [ ! -d "dist" ]; then
    echo "📦 Fazendo build..."
    npm run build
fi

# Iniciar servidor Python na porta 4173
echo "🚀 Iniciando servidor na porta 4173..."
cd dist
python3 -m http.server 4173 --bind 0.0.0.0
