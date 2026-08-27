# Entra na pasta backend
Set-Location -Path "backend"

# Verifica e remove a pasta build se existir
if (Test-Path -Path "build") {
    Write-Host "A pasta 'build' existe(backend). Removendo..."
    Remove-Item -Recurse -Force "build"
    Write-Host "Pasta 'build' removida com sucesso (backend)."
} else {
    Write-Host "A pasta 'build' não existe. Nada a fazer."
}

# Volta para o diretório pai
Set-Location -Path ".."

# Entra na pasta frontend
Set-Location -Path "frontend"
if (Test-Path -Path "build") {
    Write-Host "A pasta 'build' existe (frontend). Removendo..."
    Remove-Item -Recurse -Force "build"
    Write-Host "Pasta 'build' removida com sucesso (frontend)."
} else {
    Write-Host "A pasta 'build' não existe. Nada a fazer."
}
# Executa o npm run build
Write-Host "Executando 'npm run build' no frontend..."
npm run build

# Move a pasta build gerada para a pasta backend
Write-Host "Movendo a pasta 'build' para a pasta backend..."
Move-Item -Path "build" -Destination "..\backend"

# Entra novamente na pasta backend
Set-Location -Path "..\backend"

# Executa o servidor Django
Write-Host "Iniciando o servidor Django..."
python .\manage.py runserver
