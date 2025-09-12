#!/bin/bash
set -euo pipefail

# Detecta WORKSPACE_DIR dinamicamente
WORKSPACE_DIR="${WORKSPACE_DIR:-$(git rev-parse --show-toplevel 2>/dev/null || echo "/workspaces/${GITHUB_REPOSITORY##*/}")}"
export WORKSPACE_DIR

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LATEST_RELEASE=$(bash "$SCRIPT_DIR/refreshTools.sh")

# Config do supervisord
sudo cp .devcontainer/spark.conf /etc/supervisor/conf.d/

# Repara/instala serviços do SDK
cd /tmp/spark
bash spark-sdk-dist/repair.sh || true
LATEST_RELEASE="$LATEST_RELEASE" WORKSPACE_DIR="$WORKSPACE_DIR" bash /tmp/spark/spark-sdk-dist/install-tools.sh services
cd "$WORKSPACE_DIR"

# Ajusta permissões para o usuário 'node'
sudo chown node /var/run/ || true
sudo chown -R node /var/log/ || true

# Sobe o supervisor e recarrega programas
supervisord || true
supervisorctl reread || true
supervisorctl update || true

# Se SNAPSHOT_SAS_URL vier setado, executa hydrate.sh (se existir)
if [ -n "${SNAPSHOT_SAS_URL:-}" ]; then
  if command -v /usr/local/bin/hydrate.sh >/dev/null 2>&1; then
    SAS_URI="$SNAPSHOT_SAS_URL" /usr/local/bin/hydrate.sh "$WORKSPACE_DIR" || true
  fi
fi

# Instala SDK (cli) e roda build estático (se existir o script)
cd /tmp/spark
LATEST_RELEASE="$LATEST_RELEASE" WORKSPACE_DIR="$WORKSPACE_DIR" bash /tmp/spark/spark-sdk-dist/install-tools.sh sdk
cd "$WORKSPACE_DIR"

# Preserva reflog por muito tempo
git config gc.reflogExpire 500.years.ago || true
git config gc.reflogExpireUnreachable 500.years.ago || true

# Hook post-commit e build de preview estático (se existir)
if [ -x /usr/local/bin/post-commit ]; then
  ln -fs /usr/local/bin/post-commit .git/hooks/post-commit
fi
if command -v /usr/local/bin/static-preview-build.sh >/dev/null 2>&1; then
  /usr/local/bin/static-preview-build.sh || true
fi

# Instala CLI por último
cd /tmp/spark
LATEST_RELEASE="$LATEST_RELEASE" WORKSPACE_DIR="$WORKSPACE_DIR" bash /tmp/spark/spark-sdk-dist/install-tools.sh cli
cd "$WORKSPACE_DIR"