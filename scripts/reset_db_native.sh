#!/bin/bash

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${RED}╔════════════════════════════════════════════╗${NC}"
echo -e "${RED}║   🔴 RESET COMPLETO DO POSTGRESQL 🔴      ║${NC}"
echo -e "${RED}║                                            ║${NC}"
echo -e "${RED}║   ATENÇÃO: Isso irá DELETAR TODOS os      ║${NC}"
echo -e "${RED}║   dados do banco de dados!                ║${NC}"
echo -e "${RED}╚════════════════════════════════════════════╝${NC}"
echo ""

# Verificação de ambiente
if [ "$NODE_ENV" == "production" ] || [ "$RAILS_ENV" == "production" ] || [ "$DJANGO_ENV" == "production" ]; then
    echo -e "${RED}❌ ERRO: Não é permitido resetar o banco em produção!${NC}"
    exit 1
fi

# Confirmação
echo -e "${YELLOW}Digite 'CONFIRMO' para continuar:${NC}"
read -r confirmacao

if [ "$confirmacao" != "CONFIRMO" ]; then
    echo -e "${YELLOW}Operação cancelada.${NC}"
    exit 0
fi

echo ""
echo -e "${BLUE}[1/5] Parando aplicações...${NC}"

# Parar aplicações que possam estar usando o banco
pkill -f "python manage.py" 2>/dev/null || true
pkill -f "npm run dev" 2>/dev/null || true
sleep 2

echo -e "${BLUE}[2/5] Verificando PostgreSQL...${NC}"

# Verificar se PostgreSQL está rodando
if ! sudo service postgresql status &> /dev/null; then
    echo "Iniciando PostgreSQL..."
    sudo service postgresql start
    sleep 2
fi

echo -e "${BLUE}[3/5] Removendo database existente...${NC}"

# Dropar database forçando desconexões
sudo -u postgres psql << EOF
SELECT pg_terminate_backend(pid) 
FROM pg_stat_activity 
WHERE datname = 'traknor' AND pid <> pg_backend_pid();
DROP DATABASE IF EXISTS traknor;
EOF

echo -e "${BLUE}[4/5] Criando novo database...${NC}"

# Criar novo database
sudo -u postgres createdb traknor

# Garantir senha do usuário postgres
sudo -u postgres psql << EOF
ALTER USER postgres PASSWORD 'postgres';
GRANT ALL PRIVILEGES ON DATABASE traknor TO postgres;
EOF

echo -e "${BLUE}[5/5] Validando configuração...${NC}"

# Testar conexão
PGPASSWORD=postgres psql -h localhost -U postgres -d traknor -c "SELECT 1;" &> /dev/null

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}╔════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║        ✅ RESET CONCLUÍDO!                ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════╝${NC}"
    echo ""
    echo "📊 Relatório:"
    echo "  • Database 'traknor' recriado"
    echo "  • Usuário 'postgres' configurado"
    echo "  • Senha 'postgres' aplicada"
    echo ""
    echo "🚀 Próximos passos:"
    echo "  1. cd backend_django"
    echo "  2. source venv/bin/activate"
    echo "  3. python manage.py migrate"
    echo "  4. python manage.py create_initial_data"
else
    echo -e "${RED}❌ Erro na validação da configuração${NC}"
    exit 1
fi
