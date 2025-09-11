#!/bin/bash

# Definir explicitamente o diretório de trabalho
WORKSPACE_DIR="/workspaces/traknor-cmms-sistema"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [ -f "$SCRIPT_DIR/refreshTools.sh" ]; then
    LATEST_RELEASE=$(bash "$SCRIPT_DIR/refreshTools.sh")
else
    echo "Warning: refreshTools.sh not found"
    LATEST_RELEASE=""
fi

if [ -f "$SCRIPT_DIR/spark.conf" ]; then
    sudo cp "$SCRIPT_DIR/spark.conf" /etc/supervisor/conf.d/
else
    echo "Warning: spark.conf not found"
fi

if [ -d "/tmp/spark/spark-sdk-dist" ]; then
    cd /tmp/spark
    if [ -f "spark-sdk-dist/repair.sh" ]; then
        bash spark-sdk-dist/repair.sh
    fi
    if [ -f "spark-sdk-dist/install-tools.sh" ]; then
        LATEST_RELEASE="$LATEST_RELEASE" WORKSPACE_DIR="$WORKSPACE_DIR" bash /tmp/spark/spark-sdk-dist/install-tools.sh services
    fi
fi

cd "$WORKSPACE_DIR"

sudo chown node /var/run/
sudo chown -R node /var/log/

supervisord
supervisorctl reread
supervisorctl update

# Check if SNAPSHOT_SAS_URL was passed, if so run hydrate.sh
if [ -n "$SNAPSHOT_SAS_URL" ]; then
    if [ -f "/usr/local/bin/hydrate.sh" ]; then
        SAS_URI="$SNAPSHOT_SAS_URL" /usr/local/bin/hydrate.sh "$WORKSPACE_DIR"
    else
        echo "Warning: hydrate.sh not found"
    fi
fi

if [ -d "/tmp/spark/spark-sdk-dist" ]; then
    cd /tmp/spark
    if [ -f "spark-sdk-dist/install-tools.sh" ]; then
        LATEST_RELEASE="$LATEST_RELEASE" WORKSPACE_DIR="$WORKSPACE_DIR" bash /tmp/spark/spark-sdk-dist/install-tools.sh sdk
    fi
fi

cd "$WORKSPACE_DIR"

# Keep reflog commits "forever"
git config gc.reflogExpire 500.years.ago
git config gc.reflogExpireUnreachable 500.years.ago

# Set up post-commit hook and also run the build script to perform a one-time build for static preview
if [ -f "/usr/local/bin/post-commit" ]; then
    ln -fs /usr/local/bin/post-commit .git/hooks/post-commit
fi

if [ -f "/usr/local/bin/static-preview-build.sh" ]; then
    /usr/local/bin/static-preview-build.sh
fi

if [ -d "/tmp/spark/spark-sdk-dist" ]; then
    cd /tmp/spark
    if [ -f "spark-sdk-dist/install-tools.sh" ]; then
        LATEST_RELEASE="$LATEST_RELEASE" WORKSPACE_DIR="$WORKSPACE_DIR" bash /tmp/spark/spark-sdk-dist/install-tools.sh cli
    fi
fi

cd "$WORKSPACE_DIR"