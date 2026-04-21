#!/bin/bash
# Activate Render's virtual environment where packages are installed
source /opt/render/project/src/.venv/bin/activate
python -m uvicorn app:app --host 0.0.0.0 --port ${PORT:-8000}
