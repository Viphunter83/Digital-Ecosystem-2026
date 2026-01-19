FROM python:3.11-slim

WORKDIR /app

# Install dependencies
RUN pip install aiogram==3.10.0 aiohttp requests sqlalchemy asyncpg pgvector redis

# Copy app code
COPY . .

# Run bot
CMD ["python", "apps/bot/main.py"]
