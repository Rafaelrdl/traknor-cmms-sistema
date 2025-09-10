#!/bin/bash

echo "🐘 Configurando PostgreSQL para Codespaces..."

# Instalar PostgreSQL se necessário
if ! command -v psql &> /dev/null; then
    echo "Instalando PostgreSQL..."
    sudo apt-get update
    sudo apt-get install -y postgresql postgresql-client
fi

# Iniciar serviço
sudo service postgresql start

# Aguardar PostgreSQL iniciar
sleep 3

# Configurar usuário e database
sudo -u postgres psql << EOF
ALTER USER postgres PASSWORD 'postgres';
CREATE DATABASE traknor;
GRANT ALL PRIVILEGES ON DATABASE traknor TO postgres;
EOF

echo "✅ PostgreSQL configurado!"
echo ""
echo "Conexão:"
echo "  Host: localhost"
echo "  Port: 5432"
echo "  Database: traknor"
echo "  User: postgres"
echo "  Password: postgres"
