#!/bin/bash

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

# Check if SNAPSHOT_SAS_URL was passed, if so run selective hydration for gitignored files
if [ -n "$SNAPSHOT_SAS_URL" ]; then
    echo "Performing selective hydration to restore .gitignore files only..."
    WORKSPACE_DIR="/workspaces/spark-template"
    
    # Create temporary directory for snapshot
    TEMP_DIR=$(mktemp -d)
    
    # Download snapshot to temporary directory
    SAS_URI="$SNAPSHOT_SAS_URL" /usr/local/bin/hydrate.sh "$TEMP_DIR"
    
    # Lista de diretórios e arquivos a serem verificados/restaurados
    ITEMS_TO_CHECK=(
        ".devcontainer"
        "dist"
        "node_modules"
        "packages"
        ".file-manifest"
        ".vite.log"
    )
    
    # Restaura cada item se existir no snapshot mas não no workspace
    for ITEM in "${ITEMS_TO_CHECK[@]}"; do
        if [ -e "$TEMP_DIR/$ITEM" ] && [ ! -e "$WORKSPACE_DIR/$ITEM" ]; then
            echo "Restaurando $ITEM..."
            mkdir -p "$(dirname "$WORKSPACE_DIR/$ITEM")"
            cp -r "$TEMP_DIR/$ITEM" "$WORKSPACE_DIR/$ITEM"
        fi
    done
    
    # Clean up
    rm -rf "$TEMP_DIR"
    echo "Hidratação seletiva concluída"
fi

# Ensure we're always on the latest commit of main branch
echo "Ensuring we're on the latest commit of main branch..."
git fetch origin --quiet || echo "Warning: Could not fetch from origin"
git checkout main --quiet || echo "Warning: Could not checkout main"
git pull origin main --quiet || echo "Warning: Could not pull latest changes"
echo "Git status check completed"

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
