#!/bin/bash

echo "🚀 Iniciando servidor para GitHub Spark Preview..."
echo "================================================"

# Verificar se as dependências estão instaladas
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências..."
    npm install
fi

# Verificar se o backend está rodando
BACKEND_PID=$(lsof -ti:3333 2>/dev/null || echo "")
if [ -z "$BACKEND_PID" ]; then
    echo "🔧 Iniciando backend na porta 3333..."
    if [ -d "backend" ]; then
        cd backend && npm start &
        BACKEND_PID=$!
        echo "Backend PID: $BACKEND_PID"
        sleep 5
        cd ..
    else
        echo "⚠️  Diretório backend não encontrado, continuando sem backend..."
    fi
fi

# Parar qualquer servidor anterior nas portas do Vite
echo "🛑 Parando servidores anteriores..."
lsof -ti:5173 2>/dev/null | xargs kill -9 2>/dev/null || true
lsof -ti:4173 2>/dev/null | xargs kill -9 2>/dev/null || true
lsof -ti:5000 2>/dev/null | xargs kill -9 2>/dev/null || true

# Build da aplicação
echo "🔨 Fazendo build da aplicação..."
npm run build

# Iniciar servidor de preview na porta 4173 (esperada pelo Spark)
echo "🌐 Iniciando servidor de preview na porta 4173..."
npm run preview -- --port 4173 --host 0.0.0.0 &
PREVIEW_PID=$!

echo ""
echo "✅ Servidor iniciado com sucesso!"
echo "================================================"
echo "📍 Preview URL: http://localhost:4173"
echo "📍 Backend API: http://localhost:3333"
echo ""
echo "Para parar os servidores, use: kill $PREVIEW_PID $BACKEND_PID"
echo ""
echo "🔄 Aguardando servidor inicializar..."
sleep 3

# Manter o script rodando
wait $PREVIEW_PID
