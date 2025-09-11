#!/bin/bash
set -euo pipefail

WS="$(pwd)"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

sudo cp "$SCRIPT_DIR/spark.conf" /etc/supervisor/conf.d/

# Só roda scripts do spark-sdk se existirem
if [ -d /tmp/spark/spark-sdk-dist ]; then
  (cd /tmp/spark && bash spark-sdk-dist/repair.sh || true)
  (cd /tmp/spark && WORKSPACE_DIR="$WS" bash /tmp/spark/spark-sdk-dist/install-tools.sh services || true)
  (cd /tmp/spark && WORKSPACE_DIR="$WS" bash /tmp/spark/spark-sdk-dist/install-tools.sh sdk || true)
  (cd /tmp/spark && WORKSPACE_DIR="$WS" bash /tmp/spark/spark-sdk-dist/install-tools.sh cli || true)
fi

sudo chown node /var/run/ || true
sudo chown -R node /var/log/ || true

pgrep supervisord >/dev/null 2>&1 || (supervisord || true)
supervisorctl reread || true
supervisorctl update || true

# Snapshot opcional
if [ -n "${SNAPSHOT_SAS_URL:-}" ]; then
  WORKSPACE_DIR="$WS" SAS_URI="$SNAPSHOT_SAS_URL" /usr/local/bin/hydrate.sh "$WS" || true
fi

# Build estático opcional
[ -x /usr/local/bin/static-preview-build.sh ] && /usr/local/bin/static-preview-build.sh || true
