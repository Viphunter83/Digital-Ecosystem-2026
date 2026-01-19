FROM python:3.11-slim

WORKDIR /app

# Install dependencies
RUN pip install aiogram==3.10.0 aiohttp requests sqlalchemy asyncpg pgvector redis

# Copy Shared Packages
COPY packages /app/packages

# Copy Bot Code
COPY apps/bot /app/apps/bot

# PYTHONPATH to root
ENV PYTHONPATH=/app

# Run bot
CMD ["python", "apps/bot/main.py"]
