# syntax=docker/dockerfile:1.7
# ---------- Builder/Base Stage ----------
# Using slim Python image keeps the final image small while still being Debian-based
FROM python:3.11-slim AS base

# Avoids Python buffering stdout/stderr (useful for logging)
ENV PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    UVICORN_PORT=8000 \
    TMP_UPLOAD_DIR=/app/tmp_uploads

# Install system packages required for building python deps (e.g., gcc for some libs)
RUN apt-get update && \
    apt-get install --no-install-recommends -y build-essential curl && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python dependencies separately so Docker cache is reused when code changes
COPY requirements.txt ./
RUN python -m pip install --upgrade pip && \
    pip install -r requirements.txt

# ---------- Final Runtime Stage ----------
FROM python:3.11-slim AS runtime
ENV PYTHONUNBUFFERED=1 \
    UVICORN_PORT=8000 \
    TMP_UPLOAD_DIR=/app/tmp_uploads

WORKDIR /app

# Copy installed site-packages from the base stage to keep runtime lean
COPY --from=base /usr/local /usr/local

# Copy application source
COPY . .

# Create a dedicated non-root user for security
RUN useradd --uid 10001 --create-home --shell /bin/bash appuser && \
    mkdir -p ${TMP_UPLOAD_DIR} && \
    chown -R appuser:appuser /app && \
    chmod 700 ${TMP_UPLOAD_DIR}

USER appuser

EXPOSE ${UVICORN_PORT}

# Production command: uvicorn without live reload
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
