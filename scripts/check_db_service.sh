#!/usr/bin/env bash
set -euo pipefail

echo "⏳ Checando PostgreSQL service container (host=db:5432)..."

# Verificar se pg_isready está disponível
if ! command -v pg_isready &> /dev/null; then
    echo "❌ pg_isready não encontrado. Instale postgresql-client."
    exit 1
fi

# Testar conectividade básica
if ! pg_isready -h db -p 5432 -U "${POSTGRES_USER:-postgres}" >/dev/null 2>&1; then
    echo "❌ PostgreSQL service container não está acessível em db:5432"
    echo "💡 Execute: Command Palette → 'Codespaces: Rebuild Container'"
    exit 1
fi

echo "✅ pg_isready OK. Testando query SQL..."

# Testar query SQL simples
PGPASSWORD="${POSTGRES_PASSWORD:-postgres}" \
psql -h db -U "${POSTGRES_USER:-postgres}" -d "${POSTGRES_DB:-traknor}" \
-c "SELECT now() as db_time, current_database() as db_name, current_user as db_user;" >/dev/null

if [ $? -eq 0 ]; then
    echo "✅ Query SQL OK no banco ${POSTGRES_DB:-traknor} (host=db)."
    echo "🎯 PostgreSQL service container funcionando perfeitamente!"
else
    echo "❌ Query SQL falhou."
    exit 1
fi
