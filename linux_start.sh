#!/bin/bash
set -e

current_path=$(pwd)
backend_build="$current_path/backend/build"
frontend_build="$current_path/frontend/build"

# Ativa o ambiente virtual (.venv) se existir
if [ -d "$current_path/.venv" ]; then
    source "$current_path/.venv/bin/activate"
fi

echo "🔨 Compilando o frontend (Modo Ultra-Leve)..."

if [ -d "$backend_build" ]; then
    rm -rf "$backend_build"
    echo "Deletando build antiga do backend..."
fi
if [ -d "$frontend_build" ]; then
    rm -rf "$frontend_build"
    echo "Deletando build antiga do frontend..."
fi

cd "$current_path/frontend/"

# Variáveis críticas para limitar consumo de RAM e CPU durante o build do Webpack:
export GENERATE_SOURCEMAP=false
export DISABLE_ESLINT_PLUGIN=true
export CI=true
export UV_THREADPOOL_SIZE=2
export NODE_OPTIONS="--max-old-space-size=1536"

npm run build

cd "$current_path"
mv "$current_path/frontend/build" "$current_path/backend/build"
echo "✅ Build concluída com sucesso."

cd "$current_path/backend/"

echo "🚀 Iniciando servidor Django (com --noreload para economizar memória e CPU)..."
python3 manage.py runserver 0.0.0.0:8000 --noreload