FROM python:3.9-slim

LABEL maintainer="Flink Auto-Scaler"
LABEL description="Auto-scaling solution for Apache Flink clusters on Kubernetes"

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better Docker layer caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY flink_autoscaler.py .
COPY autoscaler-config.yaml .

# Create non-root user for security
RUN useradd --create-home --shell /bin/bash autoscaler
USER autoscaler

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH=/app

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import requests; requests.get('http://localhost:8080/health', timeout=5)" || exit 1

# Default command
CMD ["python", "flink_autoscaler.py", "--config", "autoscaler-config.yaml"] 