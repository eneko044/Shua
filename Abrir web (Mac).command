#!/bin/bash
cd "$(dirname "$0")"
if command -v python3 >/dev/null 2>&1; then python3 servidor.py
elif command -v node >/dev/null 2>&1; then node servidor.js
else
  echo ""
  echo "  No se ha encontrado Python ni Node.js."
  echo "  Instala Python desde https://www.python.org/downloads/ y vuelve a abrir este archivo."
  read -r -p "  Pulsa Intro para cerrar..."
fi
