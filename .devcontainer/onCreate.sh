#!/bin/bash
set -euo pipefail

WS="$(pwd)" # raiz do workspace no Codespaces

echo "Installing the GitHub CLI"
(type -p wget >/dev/null || (sudo apt update && sudo apt-get install wget -y)) \
  && sudo mkdir -p -m 755 /etc/apt/keyrings \
  && out=$(mktemp) && wget -nv -O$out https://cli.github.com/packages/githubcli-archive-keyring.gpg \
  && cat $out | sudo tee /etc/apt/keyrings/githubcli-archive-keyring.gpg > /dev/null \
  && sudo chmod go+r /etc/apt/keyrings/githubcli-archive-keyring.gpg \
  && echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null \
  && sudo apt update \
  && sudo apt install -y gh inotify-tools ripgrep fd-find jq unzip curl

echo "Installing azcopy"
sudo wget -O /usr/local/bin/azcopytar https://aka.ms/downloadazcopy-v10-linux
sudo tar -xvf /usr/local/bin/azcopytar -C /usr/local/bin/
sudo rm /usr/local/bin/azcopytar
azcopy_dir=$(find /usr/local/bin/ -type d -name "azcopy*" | head -n 1 || true)
if [ -n "${azcopy_dir:-}" ] && [ -f "$azcopy_dir/azcopy" ]; then
  sudo mv "$azcopy_dir/azcopy" /usr/local/bin/azcopy
  sudo rm -rf "$azcopy_dir"
fi

# preparar node_modules (não falha se não houver package.json)
if [ -f "$WS/package.json" ]; then
  (cd "$WS" && (npm ci || npm install) || true)
  (cd "$WS" && npm run optimize --override || true)
fi

echo "Installing supervisor"
sudo apt-get update && sudo apt-get install -y supervisor
