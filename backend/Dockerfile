# Use an official Python runtime as a parent image
FROM python:3.12-slim-bookworm

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1
ENV PORT 8000

# Install system dependencies including LibreOffice
RUN apt-get update && apt-get install -y --no-install-recommends \
    libreoffice-common \
    libreoffice-writer \
    openjdk-17-jre-headless \
    build-essential \
    libpq-dev \
    curl \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Set work directory
WORKDIR /app

# Install Python dependencies
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# Copy project
COPY . /app/

# Make entrypoint executable
RUN chmod +x /app/entrypoint.sh

# Create media and static directories
RUN mkdir -p /app/media /app/staticfiles

# Define entrypoint to run migrations and collectstatic
ENTRYPOINT ["/app/entrypoint.sh"]

# Default command (shell form to expand $PORT variable provided by Render)
CMD gunicorn legal_engine.wsgi:application --bind 0.0.0.0:$PORT
