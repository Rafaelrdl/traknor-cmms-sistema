#!/usr/bin/env bash
set -euo pipefail

fail() { 
    echo "❌ $1" 
    exit 1 
}

echo "🔍 Verificando referências proibidas ao PostgreSQL nativo..."

# Verificar comandos proibidos (excluindo este próprio script)
if grep -RIEn 'sudo -u postgres|pg_ctlcluster|service postgresql|dockerd' . 2>/dev/null | grep -v "scripts/assert_no_native_pg.sh"; then
    fail "Referência a PostgreSQL nativo encontrada. Use service containers."
fi

# Verificar DATABASE_URL com localhost/127.0.0.1
if grep -RIEn 'postgres://[^ ]*@(localhost|127\.0\.0\.1):5432/' . 2>/dev/null; then
    fail "DATABASE_URL aponta para localhost/127.0.0.1. Use db:5432."
fi

echo "✅ Nenhuma referência proibida encontrada."
echo "✅ Sistema configurado para PostgreSQL service container apenas."
