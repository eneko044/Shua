#!/bin/bash
cd "$(dirname "$0")"
if command -v python3 >/dev/null 2>&1; then exec python3 servidor.py
elif command -v node >/dev/null 2>&1; then exec node servidor.js
else echo "Instala python3 o node para abrir la web."; fi
