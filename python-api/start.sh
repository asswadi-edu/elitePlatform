#!/bin/bash
set -e

VENV_PIP="/opt/render/project/src/.venv/bin/pip"
VENV_PYTHON="/opt/render/project/src/.venv/bin/python"

echo "==> Ensuring uvicorn is installed in the correct venv ..."
$VENV_PIP install --quiet uvicorn[standard] fastapi joblib pandas scikit-learn numpy

echo "==> Starting uvicorn ..."
exec $VENV_PYTHON -m uvicorn app:app --host 0.0.0.0 --port ${PORT:-8000}
