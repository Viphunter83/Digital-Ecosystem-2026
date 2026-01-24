import asyncio
import os
import numpy as np
from openai import AsyncOpenAI

async def check_similarity():
    client = AsyncOpenAI(
        api_key=os.getenv("OPENAI_API_KEY", "sk-proxy-api-key"), # Should be set in env
        base_url=os.getenv("OPENAI_BASE_URL", "https://api.proxyapi.ru/openai/v1")
    )
    
    texts = [
        "станок для резки",
        "Токарный обрабатывающий центр 1М63-ЧПУ. Предназначен для токарной обработки наружных и внутренних поверхностей деталей со ступенчатым и криволинейным профилем."
    ]
    
    embeddings = []
    for text in texts:
        resp = await client.embeddings.create(input=text, model="text-embedding-3-small")
        embeddings.append(resp.data[0].embedding)
    
    # Cosine distance = 1 - Cosine similarity
    def cosine_distance(a, b):
        return 1 - np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

    dist = cosine_distance(embeddings[0], embeddings[1])
    print(f"Distance between '{texts[0]}' and '{texts[1][:30]}...': {dist:.4f}")

if __name__ == "__main__":
    # This might fail if no internet/API key, but let's try to simulate or reason
    print("Simulation: text-embedding-3-small usually gives distances around 0.4-0.7 for related but different terms.")
    asyncio.run(check_similarity())
