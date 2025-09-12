#!/bin/bash
set -euo pipefail

# Detecta o diretório do workspace de forma robusta no Codespaces
WORKSPACE_DIR="${WORKSPACE_DIR:-$(git rev-parse --show-toplevel 2>/dev/null || echo "/workspaces/${GITHUB_REPOSITORY##*/}")}"
export WORKSPACE_DIR

echo "Installing the GitHub CLI and essentials"
(type -p wget >/dev/null || (sudo apt update && sudo apt-get install -y wget)) \
  && sudo mkdir -p -m 755 /etc/apt/keyrings \
  && out=$(mktemp) && wget -nv -O"$out" https://cli.github.com/packages/githubcli-archive-keyring.gpg \
  && cat "$out" | sudo tee /etc/apt/keyrings/githubcli-archive-keyring.gpg > /dev/null \
  && sudo chmod go+r /etc/apt/keyrings/githubcli-archive-keyring.gpg \
  && echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" \
      | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null \
  && sudo apt update \
  # Dependências mínimas adicionais requeridas pelos scripts: jq e unzip
  && sudo apt install -y gh inotify-tools ripgrep fd-find jq unzip

echo "Installing azcopy"
sudo wget -O /usr/local/bin/azcopytar https://aka.ms/downloadazcopy-v10-linux
sudo tar -xvf /usr/local/bin/azcopytar -C /usr/local/bin/
sudo rm /usr/local/bin/azcopytar
azcopy_dir=$(find /usr/local/bin/ -type d -name "azcopy*" | head -n 1 || true)
if [ -n "${azcopy_dir:-}" ] && [ -f "$azcopy_dir/azcopy" ]; then
  sudo mv "$azcopy_dir/azcopy" /usr/local/bin/azcopy
  sudo rm -rf "$azcopy_dir"
fi

echo "Installing sdk"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LATEST_RELEASE=$(bash "$SCRIPT_DIR/refreshTools.sh")
cd /tmp/spark
LATEST_RELEASE="$LATEST_RELEASE" WORKSPACE_DIR="$WORKSPACE_DIR" bash spark-sdk-dist/install-tools.sh

cd "$WORKSPACE_DIR"
echo "Pre-starting the server and generating the optimized assets"
if [ -f package.json ]; then
  npm run optimize --override || true
fi

echo "Installing supervisor"
sudo apt-get update && sudo apt-get install -y supervisor