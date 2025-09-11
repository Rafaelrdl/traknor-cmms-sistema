#!/bin/bash

set -e

# Definir explicitamente o diretório de trabalho
WORKSPACE_DIR="/workspaces/traknor-cmms-sistema"

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
mkdir -p /tmp/spark
LATEST_RELEASE=$(bash "$SCRIPT_DIR/refreshTools.sh")
if [ -d "/tmp/spark/spark-sdk-dist" ]; then
    cd /tmp/spark
    LATEST_RELEASE="$LATEST_RELEASE" WORKSPACE_DIR="$WORKSPACE_DIR" bash spark-sdk-dist/install-tools.sh
else
    echo "Warning: /tmp/spark/spark-sdk-dist directory not found"
fi

cd "$WORKSPACE_DIR"
echo "Pre-starting the server and generating the optimized assets"
if [ -f "package.json" ]; then
    if grep -q "\"optimize\"" package.json; then
        npm run optimize --override
    else
        echo "optimize script not found in package.json, running npm install instead"
        npm install
    fi
else
    echo "package.json not found"
    npm install
fi

echo "Installing supervisor"
sudo apt-get update && sudo apt-get install -y supervisor