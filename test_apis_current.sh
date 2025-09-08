#!/bin/bash

echo "🚀 TESTE DE APIs - TrakNor CMMS"
echo "==============================="
echo ""

# Verificar se o backend está rodando
if curl -s --connect-timeout 2 http://localhost:3333 >/dev/null 2>&1; then
    echo "✅ Backend Django respondendo na porta 3333"
    
    # Testar endpoint de health (se existir)
    echo ""
    echo "🔍 Testando endpoints da API..."
    
    # Health check
    echo -n "Health Check: "
    if curl -s http://localhost:3333/api/health/ >/dev/null 2>&1; then
        echo "✅ OK"
    else
        echo "❌ Não disponível"
    fi
    
    # Companies
    echo -n "Companies API: "
    if curl -s http://localhost:3333/api/companies/ >/dev/null 2>&1; then
        echo "✅ OK"
    else
        echo "❌ Não disponível"
    fi
    
    # Work Orders  
    echo -n "Work Orders API: "
    if curl -s http://localhost:3333/api/work-orders/ >/dev/null 2>&1; then
        echo "✅ OK"
    else
        echo "❌ Não disponível"
    fi
    
    # Equipment
    echo -n "Equipment API: "
    if curl -s http://localhost:3333/api/equipment/ >/dev/null 2>&1; then
        echo "✅ OK"
    else
        echo "❌ Não disponível"
    fi
    
    echo ""
    echo "📊 Testando estrutura da API..."
    
    # Tentar listar endpoints disponíveis
    API_ROOT=$(curl -s http://localhost:3333/api/ 2>/dev/null)
    if [ $? -eq 0 ] && [ -n "$API_ROOT" ]; then
        echo "✅ API Root acessível"
        echo "Endpoints disponíveis:"
        echo "$API_ROOT" | grep -o '"[^"]*":\s*"[^"]*"' | head -10
    else
        echo "❌ API Root não acessível"
    fi
    
else
    echo "❌ Backend não está rodando na porta 3333"
    echo ""
    echo "Para iniciar o backend:"
    echo "  cd backend_django"
    echo "  python manage.py runserver 0.0.0.0:3333"
    echo ""
    
    # Verificar se conseguimos ao menos testar a configuração Django
    if [ -f "backend_django/manage.py" ]; then
        echo "🔧 Testando configuração Django..."
        
        cd backend_django
        
        # Testar se consegue importar settings
        if python -c "from django.conf import settings; print('✅ Django settings OK')" 2>/dev/null; then
            echo "✅ Django configurado corretamente"
            
            # Mostrar configuração do banco
            echo ""
            echo "🗄️ Configuração do banco:"
            python -c "
from django.conf import settings
import os
db_url = os.getenv('DATABASE_URL', 'Não definido')
print(f'DATABASE_URL: {db_url}')
"
        else
            echo "❌ Erro na configuração Django"
        fi
        
        cd ..
    fi
fi

echo ""
echo "🌐 Frontend React..."

if curl -s --connect-timeout 2 http://localhost:5173 >/dev/null 2>&1; then
    echo "✅ Frontend respondendo na porta 5173"
else
    echo "❌ Frontend não está rodando na porta 5173"
    echo ""
    echo "Para iniciar o frontend:"
    echo "  npm run dev"
fi

echo ""
echo "📋 Resumo do Ambiente:"
echo "======================"

# Verificar arquivos importantes
echo -n "📁 Backend Django: "
[ -f "backend_django/manage.py" ] && echo "✅ Presente" || echo "❌ Ausente"

echo -n "📁 Frontend package.json: "
[ -f "package.json" ] && echo "✅ Presente" || echo "❌ Ausente"

echo -n "🔧 Node.js: "
if command -v node >/dev/null 2>&1; then
    echo "✅ $(node --version)"
else
    echo "❌ Não instalado"
fi

echo -n "🐍 Python: "
if command -v python >/dev/null 2>&1; then
    echo "✅ $(python --version 2>&1)"
else
    echo "❌ Não instalado"
fi

echo -n "📦 NPM: "
if command -v npm >/dev/null 2>&1; then
    echo "✅ v$(npm --version)"
else
    echo "❌ Não instalado"
fi

echo ""
echo "🎯 Próximos passos:"
echo "1. Reiniciar Codespace para ativar service container"
echo "2. Aguardar configuração automática"
echo "3. Executar: make test-integration"
echo "4. Iniciar serviços com make dev"
