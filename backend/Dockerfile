# O frontend é compilado na mesma imagem que executa o Django. Assim, não é
# necessário manter um contêiner Nginx separado para servir a SPA.
FROM node:20-alpine AS frontend-build

WORKDIR /frontend

COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        default-libmysqlclient-dev \
        build-essential \
        pkg-config \
        libmagic1 && \
    rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt ./

RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ ./

# O Django procura o index.html em /app/build e os assets em /app/build/static.
COPY --from=frontend-build /frontend/build ./build

RUN python manage.py collectstatic --noinput

EXPOSE 8000

CMD ["gunicorn", "fixdesk.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "4", "--threads", "2", "--timeout", "120"]
