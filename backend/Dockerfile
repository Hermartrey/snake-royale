FROM python:3.12-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install uv (using pip as we are in a container and it's simple)
RUN pip install uv

# Copy project files
COPY pyproject.toml uv.lock ./
COPY README.md ./

# Install dependencies using uv
RUN uv sync --frozen --no-install-project --no-dev

# Copy application code
COPY src ./src

# Expose port
EXPOSE 8000

# Run the application
# We use the virtualenv created by uv
ENV PATH="/app/.venv/bin:$PATH"
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
