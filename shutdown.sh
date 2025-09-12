#!/bin/bash
set -euo pipefail

echo "🛑 Parando todos os serviços..."

if command -v supervisorctl >/dev/null 2>&1; then
  supervisorctl stop all || true
  echo "✅ Serviços do Supervisor parados"
else
  echo "⚠️ Supervisor não encontrado"
fi

echo "🏁 Shutdown concluído"