#!/bin/bash
set -euo pipefail

# Detecta WORKSPACE_DIR dinamicamente (substitui hardcode)
WORKSPACE_DIR="${WORKSPACE_DIR:-$(git rev-parse --show-toplevel 2>/dev/null || echo "/workspaces/${GITHUB_REPOSITORY##*/}")}"
export WORKSPACE_DIR

# Pré-checagens de utilitários usados aqui
command -v curl >/dev/null 2>&1 || { echo "curl não encontrado"; exit 1; }
command -v jq >/dev/null 2>&1   || { echo "jq não encontrado"; exit 1; }
command -v unzip >/dev/null 2>&1 || { echo "unzip não encontrado"; exit 1; }

LATEST_RELEASE=$(curl -s https://api.github.com/repos/github/spark-template/releases/latest)
RELEASE_ID=$(echo "$LATEST_RELEASE" | jq -r '.id')

TEMP_DIR=/tmp/spark
rm -rf "$TEMP_DIR"
mkdir -p "$TEMP_DIR"

DOWNLOAD_URL=$(echo "$LATEST_RELEASE" | jq -r '.assets[0].url')
curl -L -o "$TEMP_DIR/dist.zip" -H "Accept: application/octet-stream" "$DOWNLOAD_URL"

unzip -o "$TEMP_DIR/dist.zip" -d "$TEMP_DIR"
rm "$TEMP_DIR/dist.zip"

echo "$RELEASE_ID"