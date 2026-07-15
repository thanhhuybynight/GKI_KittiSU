#!/usr/bin/env bash
# Prepare static site for Vercel (or any static host).
# - Builds webpack assets into web/dist/
# - Copies repo data/ → web/data/ (JSON used by the dashboard)
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WEB="$ROOT/web"
DATA_SRC="$ROOT/data"

echo "==> GKI_KittiSU Vercel build"
echo "    root: $ROOT"

if [[ ! -d "$WEB" ]]; then
  echo "error: web/ not found" >&2
  exit 1
fi

if [[ ! -d "$DATA_SRC" ]]; then
  echo "error: data/ not found" >&2
  exit 1
fi

cd "$WEB"

# Install if node_modules missing (local runs); Vercel already ran installCommand
if [[ ! -d node_modules ]]; then
  echo "==> npm ci (web)"
  npm ci
fi

echo "==> webpack production build"
npm run build

echo "==> copy data/ → web/data/"
rm -rf "$WEB/data"
cp -a "$DATA_SRC" "$WEB/data"

# Sanity checks
if [[ ! -f "$WEB/dist/app.bundle.js" ]]; then
  echo "error: web/dist/app.bundle.js missing after build" >&2
  exit 1
fi
if [[ ! -f "$WEB/data/announcement.json" ]]; then
  echo "error: web/data/announcement.json missing after copy" >&2
  exit 1
fi

echo "==> done — output directory: web/"
ls -la "$WEB/dist" | head -20
ls "$WEB/data"
