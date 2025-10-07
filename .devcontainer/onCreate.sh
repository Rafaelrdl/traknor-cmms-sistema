#!/bin/bash

set -e

echo "=== Starting onCreate.sh script for Alpine Linux ==="

echo "Installing basic tools and GitHub CLI"
sudo apk update
sudo apk add --no-cache wget curl git bash github-cli ripgrep fd
echo "GitHub CLI installation completed"

echo "Installing azcopy"
if ! command -v azcopy &> /dev/null; then
    wget -O /tmp/azcopytar https://aka.ms/downloadazcopy-v10-linux || {
        echo "ERROR: Failed to download azcopy"
        exit 1
    }
    tar -xvf /tmp/azcopytar -C /tmp/ || {
        echo "ERROR: Failed to extract azcopy"
        exit 1
    }
    rm /tmp/azcopytar
    azcopy_dir=$(find /tmp/ -type d -name "azcopy*" | head -n 1)
    if [ -n "$azcopy_dir" ]; then
        sudo mv "$azcopy_dir/azcopy" /usr/local/bin/azcopy
        rm -rf "$azcopy_dir"
        sudo chmod +x /usr/local/bin/azcopy
        echo "azcopy installed successfully"
    else
        echo "ERROR: azcopy directory not found after extraction"
        exit 1
    fi
else
    echo "azcopy already installed"
fi

echo "Installing sdk"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LATEST_RELEASE=$(bash "$SCRIPT_DIR/refreshTools.sh")
if [ -d "/tmp/spark" ]; then
    cd /tmp/spark
    # Set npm to use sudo for global installations in Alpine
    sudo LATEST_RELEASE="$LATEST_RELEASE" WORKSPACE_DIR="$WORKSPACE_DIR" bash spark-sdk-dist/install-tools.sh || {
        echo "WARNING: SDK installation failed, continuing..."
    }
else
    echo "WARNING: /tmp/spark directory not found, skipping SDK installation"
fi

cd /workspaces/spark-template
echo "Installing npm dependencies..."
npm install || {
    echo "npm install failed, trying to clean and reinstall..."
    rm -rf node_modules package-lock.json
    npm install
}
echo "npm dependencies installed successfully"

echo "Pre-starting the server and generating the optimized assets"
if [ -f "node_modules/.bin/vite" ]; then
    # Fix permissions for spark package
    sudo chmod -R 755 node_modules/@github/spark/ 2>/dev/null || true
    npm run optimize 2>/dev/null || {
        echo "WARNING: Asset optimization failed, but continuing..."
    }
    echo "Asset optimization completed"
else
    echo "WARNING: Vite not found, skipping optimization"
fi

echo "Installing supervisor"
sudo apk add --no-cache supervisor
echo "supervisor installation completed"

echo "=== onCreate.sh script completed successfully ==="