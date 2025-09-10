#!/bin/bash

echo "🔄 Reiniciando servidor Vite com suporte IPv4/IPv6..."

# Mata processos existentes na porta 5000
echo "Parando processos na porta 5000..."
lsof -ti:5000 | xargs kill -9 2>/dev/null || true

# Aguarda um momento para liberar a porta
sleep 2

# Inicia o servidor em background com a nova configuração
echo "Iniciando servidor Vite..."
npm run dev -- --host 0.0.0.0 --port 5000 &

# Aguarda o servidor iniciar
sleep 5

# Verifica se está escutando em IPv4 e IPv6
echo "Verificando conectividade..."
netstat -tlnp 2>/dev/null | grep :5000 || ss -tlnp | grep :5000

# Testa conectividade IPv4
echo "Testando IPv4..."
curl -s -o /dev/null -w "IPv4 Status: %{http_code}\n" http://127.0.0.1:5000

# Testa conectividade IPv6
echo "Testando IPv6..."
curl -s -o /dev/null -w "IPv6 Status: %{http_code}\n" http://[::1]:5000

echo "✅ Servidor Vite configurado para IPv4 e IPv6!"
