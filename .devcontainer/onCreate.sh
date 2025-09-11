#!/bin/bash

set -e

echo "Installing the GitHub CLI"
(type -p wget >/dev/null || (sudo apt update && sudo apt-get install wget -y)) \
  && sudo mkdir -p -m 755 /etc/apt/keyrings \
        && out=$(mktemp) && wget -nv -O$out https://cli.github.com/packages/githubcli-archive-keyring.gpg \
        && cat $out | sudo tee /etc/apt/keyrings/githubcli-archive-keyring.gpg > /dev/null \
  && sudo chmod go+r /etc/apt/keyrings/githubcli-archive-keyring.gpg \
  && echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null \
  && sudo apt update \
  && sudo apt install gh inotify-tools ripgrep fd-find -y

echo "Installing azcopy"

sudo wget -O /usr/local/bin/azcopytar https://aka.ms/downloadazcopy-v10-linux
sudo tar -xvf /usr/local/bin/azcopytar -C /usr/local/bin/
sudo rm /usr/local/bin/azcopytar
azcopy_dir=$(find /usr/local/bin/ -type d -name "azcopy*" | head -n 1)
sudo mv "$azcopy_dir/azcopy" /usr/local/bin/azcopy
sudo rm -rf "$azcopy_dir"

echo "Installing sdk"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORKSPACE_DIR="/workspaces/traknor-cmms-sistema"

# Ensure /tmp/spark directory exists
mkdir -p /tmp/spark

# Check if refreshTools.sh script exists and is executable
if [ -f "$SCRIPT_DIR/refreshTools.sh" ] && [ -x "$SCRIPT_DIR/refreshTools.sh" ]; then
    LATEST_RELEASE=$(bash "$SCRIPT_DIR/refreshTools.sh")
    
    # Check if spark-sdk-dist directory exists
    if [ -d "/tmp/spark/spark-sdk-dist" ] && [ -f "/tmp/spark/spark-sdk-dist/install-tools.sh" ]; then
        cd /tmp/spark
        LATEST_RELEASE="$LATEST_RELEASE" WORKSPACE_DIR="$WORKSPACE_DIR" bash spark-sdk-dist/install-tools.sh
    else
        echo "Warning: spark-sdk-dist directory or install-tools.sh not found in /tmp/spark"
    fi
else
    echo "Warning: refreshTools.sh script not found or not executable"
fi

cd "$WORKSPACE_DIR"
echo "Pre-starting the server and generating the optimized assets"
# Check if package.json exists and has the optimize script
if [ -f "package.json" ] && grep -q "\"optimize\"" package.json; then
    npm run optimize --override
else
    echo "Warning: package.json not found or optimize script not defined"
    # Fallback to npm install if optimize script doesn't exist
    npm install
fi

echo "Installing supervisor"
sudo apt-get update && sudo apt-get install -y supervisor