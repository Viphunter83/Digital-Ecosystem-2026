FROM python:3.11-slim

WORKDIR /app

# Install dependencies
RUN pip install aiogram==3.10.0 aiohttp requests

# Copy app code
COPY . .

# Run bot
CMD ["python", "apps/bot/main.py"]
