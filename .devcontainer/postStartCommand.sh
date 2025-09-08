#!/bin/bash

# Original Spark setup (preserving as per instructions)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LATEST_RELEASE=$(bash "$SCRIPT_DIR/refreshTools.sh")

sudo cp .devcontainer/spark.conf /etc/supervisor/conf.d/

cd /tmp/spark
bash spark-sdk-dist/repair.sh
LATEST_RELEASE="$LATEST_RELEASE" WORKSPACE_DIR="$WORKSPACE_DIR" bash /tmp/spark/spark-sdk-dist/install-tools.sh services
cd /workspaces/spark-template

sudo chown node /var/run/
sudo chown -R node /var/log/

supervisord
supervisorctl reread
supervisorctl update

# Check if SNAPSHOT_SAS_URL was passed, if so run hydrate.sh
if [ -n "$SNAPSHOT_SAS_URL" ]; then
    WORKSPACE_DIR="/workspaces/spark-template"
    SAS_URI="$SNAPSHOT_SAS_URL" /usr/local/bin/hydrate.sh $WORKSPACE_DIR
fi

cd /tmp/spark
LATEST_RELEASE="$LATEST_RELEASE" WORKSPACE_DIR="$WORKSPACE_DIR" bash /tmp/spark/spark-sdk-dist/install-tools.sh sdk
cd /workspaces/spark-template

# Keep reflog commits "forever"
git config gc.reflogExpire 500.years.ago
git config gc.reflogExpireUnreachable 500.years.ago

# Set up post-commit hook and also run the build script to perform a one-time build for static preview
ln -fs /usr/local/bin/post-commit .git/hooks/post-commit
/usr/local/bin/static-preview-build.sh

cd /tmp/spark
LATEST_RELEASE="$LATEST_RELEASE" WORKSPACE_DIR="$WORKSPACE_DIR" bash /tmp/spark/spark-sdk-dist/install-tools.sh cli
cd /workspaces/spark-template

# TrakNor CMMS - PostgreSQL native setup for Codespaces
echo "🐘 Configurando TrakNor CMMS para Codespaces..."

# Navigate to project directory
if [ -d "/workspaces/traknor-cmms-sistema" ]; then
    cd /workspaces/traknor-cmms-sistema
    
    # Run our Codespaces setup script
    if [ -f ".devcontainer/post-start.sh" ]; then
        echo "Executando setup automático do TrakNor..."
        ./.devcontainer/post-start.sh
    else
        echo "⚠️ Setup script não encontrado, executando setup básico..."
        # Fallback basic setup
        if [ -f "scripts/setup_postgres_codespaces.sh" ]; then
            ./scripts/setup_postgres_codespaces.sh
        fi
    fi
else
    echo "⚠️ Diretório do projeto TrakNor não encontrado"
fi
