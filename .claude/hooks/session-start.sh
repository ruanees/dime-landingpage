#!/bin/bash
# Prepara as sessões do Claude Code na nuvem. O site não tem dependências:
# só confere que o build gera o public/ sem erro.
set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "$CLAUDE_PROJECT_DIR"
node src/build.mjs
