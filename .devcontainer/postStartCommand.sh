#!/bin/bash

set -e

# Define workspace directory explicitly
WORKSPACE_DIR="/workspaces/traknor-cmms-sistema"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Ensure required directories exist
mkdir -p /tmp/spark

# Check if refreshTools.sh exists and is executable
if [ -f "$SCRIPT_DIR/refreshTools.sh" ] && [ -x "$SCRIPT_DIR/refreshTools.sh" ]; then
    LATEST_RELEASE=$(bash "$SCRIPT_DIR/refreshTools.sh")
else
    echo "Warning: refreshTools.sh not found or not executable"
    LATEST_RELEASE=""
fi

# Check if spark.conf exists
if [ -f "$SCRIPT_DIR/spark.conf" ]; then
    sudo cp "$SCRIPT_DIR/spark.conf" /etc/supervisor/conf.d/
else
    echo "Warning: spark.conf not found in $SCRIPT_DIR"
fi

# Check if /tmp/spark/spark-sdk-dist directory exists
if [ -d "/tmp/spark/spark-sdk-dist" ]; then
    cd /tmp/spark
    
    # Check if repair.sh exists
    if [ -f "spark-sdk-dist/repair.sh" ]; then
        bash spark-sdk-dist/repair.sh
    else
        echo "Warning: repair.sh not found in /tmp/spark/spark-sdk-dist"
    fi
    
    # Check if install-tools.sh exists
    if [ -f "spark-sdk-dist/install-tools.sh" ]; then
        LATEST_RELEASE="$LATEST_RELEASE" WORKSPACE_DIR="$WORKSPACE_DIR" bash /tmp/spark/spark-sdk-dist/install-tools.sh services
    else
        echo "Warning: install-tools.sh not found in /tmp/spark/spark-sdk-dist"
    fi
else
    echo "Warning: /tmp/spark/spark-sdk-dist directory not found"
fi

cd "$WORKSPACE_DIR"

# Set up permissions for node user
sudo chown node /var/run/ || echo "Warning: Failed to set permissions on /var/run/"
sudo chown -R node /var/log/ || echo "Warning: Failed to set permissions on /var/log/"

# Start supervisor
if command -v supervisord &>/dev/null; then
    supervisord || echo "Warning: Failed to start supervisord"
    supervisorctl reread
    supervisorctl update
else
    echo "Warning: supervisord not installed"
fi

# Check if SNAPSHOT_SAS_URL was passed, if so run hydrate.sh
if [ -n "$SNAPSHOT_SAS_URL" ]; then
    if [ -f "/usr/local/bin/hydrate.sh" ]; then
        SAS_URI="$SNAPSHOT_SAS_URL" /usr/local/bin/hydrate.sh "$WORKSPACE_DIR"
    else
        echo "Warning: hydrate.sh not found in /usr/local/bin/"
    fi
fi

# Install SDK tools if available
if [ -d "/tmp/spark/spark-sdk-dist" ] && [ -f "/tmp/spark/spark-sdk-dist/install-tools.sh" ]; then
    cd /tmp/spark
    LATEST_RELEASE="$LATEST_RELEASE" WORKSPACE_DIR="$WORKSPACE_DIR" bash /tmp/spark/spark-sdk-dist/install-tools.sh sdk
else
    echo "Warning: /tmp/spark/spark-sdk-dist directory or install-tools.sh not found"
fi

cd "$WORKSPACE_DIR"

# Configure git
git config gc.reflogExpire 500.years.ago || echo "Warning: Failed to set git config gc.reflogExpire"
git config gc.reflogExpireUnreachable 500.years.ago || echo "Warning: Failed to set git config gc.reflogExpireUnreachable"

# Set up post-commit hook
if [ -d ".git/hooks" ] && [ -f "/usr/local/bin/post-commit" ]; then
    ln -fs /usr/local/bin/post-commit .git/hooks/post-commit
else
    echo "Warning: .git/hooks directory or post-commit file not found"
fi

# Run static preview build if script exists
if [ -f "/usr/local/bin/static-preview-build.sh" ]; then
    /usr/local/bin/static-preview-build.sh
else
    echo "Warning: static-preview-build.sh not found in /usr/local/bin/"
fi

# Install CLI tools if available
if [ -d "/tmp/spark/spark-sdk-dist" ] && [ -f "/tmp/spark/spark-sdk-dist/install-tools.sh" ]; then
    cd /tmp/spark
    LATEST_RELEASE="$LATEST_RELEASE" WORKSPACE_DIR="$WORKSPACE_DIR" bash /tmp/spark/spark-sdk-dist/install-tools.sh cli
else
    echo "Warning: /tmp/spark/spark-sdk-dist directory or install-tools.sh not found"
fi

cd "$WORKSPACE_DIR"