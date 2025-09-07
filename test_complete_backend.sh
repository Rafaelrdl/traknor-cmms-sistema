#!/bin/bash

echo "🧪 TESTE FINAL - BACKEND DJANGO SUBSTITUINDO MOCK SERVER"
echo "=========================================================="
echo ""

# Check if we're in the right directory
if [ ! -f "backend_django/manage.py" ]; then
    echo "❌ Execute este script da raiz do projeto (onde está o package.json)"
    exit 1
fi

# Check if PostgreSQL is running
if ! pg_isready -h localhost -p 5432 -U postgres >/dev/null 2>&1; then
    echo "🗄️ Starting PostgreSQL..."
    sudo service postgresql start
    sleep 3
fi

# Setup Django if not done
if [ ! -d "backend_django/venv" ]; then
    echo "🐍 Setting up Django backend..."
    cd backend_django
    python -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    cd ..
fi

# Create database if needed
createdb traknor 2>/dev/null || echo "Database traknor already exists"

cd backend_django
source venv/bin/activate

# Run migrations and create data
echo "🗄️ Setting up database..."
python manage.py migrate
python manage.py create_initial_data

# Start Django backend in background
echo "🚀 Starting Django backend on port 3333..."
python manage.py runserver 0.0.0.0:3333 > /tmp/django_test.log 2>&1 &
DJANGO_PID=$!

# Wait for Django to start
echo "⏳ Waiting for Django to start..."
sleep 8

cd ..

# Test the backend
echo "🧪 Testing Django backend..."
python test_django_integration.py

TEST_RESULT=$?

# Kill Django process
kill $DJANGO_PID 2>/dev/null || true

if [ $TEST_RESULT -eq 0 ]; then
    echo ""
    echo "🎉 SUCESSO TOTAL!"
    echo "================="
    echo ""
    echo "✅ Backend Django criado e funcionando"
    echo "✅ Todos os endpoints testados"
    echo "✅ Compatibilidade 100% com mock server"
    echo "✅ Mesmas credenciais funcionando"
    echo "✅ Mesmos dados iniciais"
    echo ""
    echo "🔥 O BACKEND DJANGO SUBSTITUI PERFEITAMENTE O MOCK SERVER!"
    echo ""
    echo "Para usar:"
    echo "  make dev    # Inicia Django + React"
    echo "  make check  # Verifica se tudo funciona"
    echo ""
    echo "URLs:"
    echo "  Frontend: http://localhost:5173"
    echo "  Backend:  http://localhost:3333"
    echo "  API Docs: http://localhost:3333/api/docs/"
    echo ""
    echo "Login:"
    echo "  admin@traknor.com / admin123"
else
    echo ""
    echo "❌ FALHA NOS TESTES"
    echo "=================="
    echo ""
    echo "Verifique os logs:"
    cat /tmp/django_test.log
    exit 1
fi