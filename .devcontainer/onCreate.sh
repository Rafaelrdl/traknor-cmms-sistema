#!/bin/bash

set -e

echo "=== Starting onCreate.sh script ==="

echo "Installing the GitHub CLI"
(type -p wget >/dev/null || (sudo apt update && sudo apt-get install wget -y)) \
  && sudo mkdir -p -m 755 /etc/apt/keyrings \
        && out=$(mktemp) && wget -nv -O$out https://cli.github.com/packages/githubcli-archive-keyring.gpg \
        && cat $out | sudo tee /etc/apt/keyrings/githubcli-archive-keyring.gpg > /dev/null \
  && sudo chmod go+r /etc/apt/keyrings/githubcli-archive-keyring.gpg \
  && echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null \
  && sudo apt update \
  && sudo apt install gh inotify-tools ripgrep fd-find -y

echo "GitHub CLI installation completed"

echo "Installing azcopy"
if ! command -v azcopy &> /dev/null; then
    sudo wget -O /usr/local/bin/azcopytar https://aka.ms/downloadazcopy-v10-linux || {
        echo "ERROR: Failed to download azcopy"
        exit 1
    }
    sudo tar -xvf /usr/local/bin/azcopytar -C /usr/local/bin/ || {
        echo "ERROR: Failed to extract azcopy"
        exit 1
    }
    sudo rm /usr/local/bin/azcopytar
    azcopy_dir=$(find /usr/local/bin/ -type d -name "azcopy*" | head -n 1)
    if [ -n "$azcopy_dir" ]; then
        sudo mv "$azcopy_dir/azcopy" /usr/local/bin/azcopy
        sudo rm -rf "$azcopy_dir"
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
    LATEST_RELEASE="$LATEST_RELEASE" WORKSPACE_DIR="$WORKSPACE_DIR" bash spark-sdk-dist/install-tools.sh
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
    npm run optimize --override
    echo "Asset optimization completed"
else
    echo "WARNING: Vite not found, skipping optimization"
fi

echo "Installing supervisor"
sudo apt-get update && sudo apt-get install -y supervisor
echo "supervisor installation completed"

echo "=== onCreate.sh script completed successfully ==="