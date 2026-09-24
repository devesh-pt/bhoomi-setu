# Stage 1: Build Frontend SPA
FROM node:18-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

# Stage 2: Production Python Runtime
FROM python:3.11-slim AS runner

# Create non-root user with UID/GID 1000
RUN groupadd -g 1000 appgroup && \
    useradd -u 1000 -g appgroup -m -s /bin/bash appuser

WORKDIR /app

# Install runtime system libraries and healthcheck tool
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# Copy backend requirements and install Python packages
COPY backend/requirements.txt ./backend/requirements.txt
RUN pip install --no-cache-dir -r ./backend/requirements.txt gunicorn==22.0.0

# Copy application source files and pre-seeded database
COPY backend/ ./backend/
COPY config/ ./config/
COPY bhumisetu.db ./bhumisetu.db

# Copy built frontend assets from builder stage
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Adjust file permissions for non-root execution
RUN chown -R appuser:appgroup /app

USER appuser

# Runtime Environment Variables
ENV PORT=8000 \
    PYTHONPATH=/app/backend \
    STATIC_DIR=/app/frontend/dist \
    PYTHONUNBUFFERED=1

EXPOSE 8000

# Container Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:${PORT}/health || exit 1

# Start Uvicorn web server bound to dynamic PORT variable
CMD ["sh", "-c", "python -m uvicorn app.main:app --host 0.0.0.0 --port ${PORT}"]
