#!/bin/bash

# Sai imediatamente se ocorrer um erro
set -e

# Navega até a pasta frontend e constrói o projeto
cd frontend/
npm run build build
cd ..

# Volta para o backend e inicia o servidor Django
cd backend/
clear
python3 manage.py runserver
