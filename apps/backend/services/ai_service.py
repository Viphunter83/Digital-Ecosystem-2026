import os
from typing import List, Dict, Any
from openai import AsyncOpenAI
from tenacity import retry, stop_after_attempt, wait_exponential

class AIService:
    def __init__(self):
        # Explicitly load from env or let OpenAI client handle it if standard vars are used.
        # However, prioritizing explicit passed args from our specific env vars.
        self.client = AsyncOpenAI(
            api_key=os.getenv("OPENAI_API_KEY"),
            base_url=os.getenv("OPENAI_BASE_URL")
        )
        self.embedding_model = os.getenv("OPENAI_MODEL_EMBEDDING", "text-embedding-3-small")
        self.chat_model = os.getenv("OPENAI_MODEL_CHAT", "gpt-4o")

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=4, max=10))
    async def get_embedding(self, text: str) -> List[float]:
        """
        Generates embedding for the given text using OpenAI API.
        """
        response = await self.client.embeddings.create(
            input=text,
            model=self.embedding_model
        )
        return response.data[0].embedding

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=4, max=10))
    async def generate_description(self, data: Dict[str, Any], role: str) -> str:
        """
        Generates product description based on data and target audience role.
        """
        system_prompt = self._get_system_prompt_by_role(role)
        
        user_content = f"Product Data:\nName: {data.get('name')}\nSpecs: {data.get('specs')}\nCategory: {data.get('category')}\n"
        
        response = await self.client.chat.completions.create(
            model=self.chat_model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_content}
            ],
            temperature=0.7
        )
        return response.choices[0].message.content

    def _get_system_prompt_by_role(self, role: str) -> str:
        base_prompt = "You are an expert industrial copywriter."
        
        if role == 'director':
            return f"{base_prompt} Write a description focusing on reliability, ROI, business benefits, and strategic value. Keep it professional and concise."
        elif role == 'engineer':
            return f"{base_prompt} Write a technical description focusing on distinct technical specifications, processing capabilities, precision, and operational parameters. Be precise and detail-oriented."
        elif role == 'buyer':
            return f"{base_prompt} Write a description focusing on value for money, maintenance costs, availability, and standard compliance. Highlight cost-efficiency."
        else:
            return f"{base_prompt} Write a balanced description highlighting key features and benefits."
