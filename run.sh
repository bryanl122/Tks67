#!/usr/bin/env bash
# Lanceur (Linux / macOS) - safety checker désactivé.
# Usage : ./run.sh
cd "$(dirname "$0")"
export DISABLE_SAFETY_CHECKER=1
exec python app.py
