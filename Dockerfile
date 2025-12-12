# Stage 1: Build Frontend
FROM node:20-slim AS frontend-builder
WORKDIR /app
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ .
RUN npm run build

# Stage 2: Build Backend
FROM python:3.12-slim AS backend-builder
WORKDIR /app
RUN apt-get update && apt-get install -y gcc libpq-dev && rm -rf /var/lib/apt/lists/*
RUN pip install uv
COPY backend/pyproject.toml backend/uv.lock ./
COPY backend/README.md ./
RUN uv sync --frozen --no-install-project --no-dev

# Stage 3: Final
FROM python:3.12-slim
WORKDIR /app

# Install runtime deps for postgres (libpq)
RUN apt-get update && apt-get install -y libpq5 && rm -rf /var/lib/apt/lists/*

# Copy backend dependencies
COPY --from=backend-builder /app/.venv /app/.venv
ENV PATH="/app/.venv/bin:$PATH"

# Copy backend code
COPY backend/src ./src

# Copy frontend build to static directory which main.py expects
COPY --from=frontend-builder /app/dist ./static

EXPOSE 8000
CMD uvicorn src.main:app --host 0.0.0.0 --port ${PORT:-8000}
