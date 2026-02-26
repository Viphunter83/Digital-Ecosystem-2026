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

    @retry(stop=stop_after_attempt(2), wait=wait_exponential(multiplier=1, min=2, max=5))
    async def generate_diagnosis_recommendation(
        self, 
        machine_type: str, 
        age: int, 
        symptoms: List[str]
    ) -> Dict[str, Any]:
        """
        Generates AI-powered diagnosis recommendation based on machine data.
        Returns risk level, probability, and detailed recommendation.
        """
        symptoms_text = ", ".join(symptoms) if symptoms else "не указаны"
        
        machine_types_ru = {
            "lathe": "токарный станок",
            "milling": "фрезерный станок", 
            "cnc_center": "обрабатывающий центр с ЧПУ"
        }
        machine_name = machine_types_ru.get(machine_type, machine_type)
        
        system_prompt = """Ты — эксперт по диагностике промышленного металлообрабатывающего оборудования с 20-летним опытом.
        
Твоя задача — проанализировать состояние станка и дать профессиональную рекомендацию.

Отвечай СТРОГО в формате JSON:
{
    "risk_level": "Low" | "Moderate" | "High" | "Critical",
    "probability": число от 0 до 100 (вероятность серьёзной поломки в ближайшие 6 месяцев),
    "urgent": true | false,
    "recommendation": "Краткая рекомендация (1-2 предложения)",
    "detailed_analysis": "Подробный анализ (2-4 предложения)",
    "next_steps": ["шаг 1", "шаг 2", "шаг 3"]
}

Учитывай:
- Возраст станка критичен: >20 лет = высокий риск
- Вибрация шпинделя = серьёзный симптом
- Ошибки ЧПУ = проблемы с электроавтоматикой
- Перегрев = проблемы с гидравликой или охлаждением"""

        user_prompt = f"""Проанализируй станок:
- Тип: {machine_name}
- Возраст: {age} лет
- Симптомы: {symptoms_text}

Дай профессиональную оценку состояния."""

        try:
            response = await self.client.chat.completions.create(
                model=self.chat_model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.3,
                response_format={"type": "json_object"}
            )
            
            import json
            result = json.loads(response.choices[0].message.content)
            return result
            
        except Exception as e:
            # Fallback to rule-based logic
            return self._fallback_diagnosis(machine_type, age, symptoms)
    
    def _fallback_diagnosis(self, machine_type: str, age: int, symptoms: List[str]) -> Dict[str, Any]:
        """Fallback rule-based diagnosis when AI fails."""
        risk_level = "Moderate"
        probability = 45
        urgent = False
        recommendations = []
        
        if age > 20:
            risk_level = "Critical"
            probability = 95
            recommendations.append("Требуется капитальный ремонт или замена")
            urgent = True
        elif age > 10:
            risk_level = "High"
            probability = max(probability, 65)
            recommendations.append("Рекомендуется комплексная диагностика")
        
        for symptom in symptoms:
            if "вибрация" in symptom.lower():
                recommendations.append("Проверка шпиндельного узла и подшипников")
                probability = max(probability, 75)
                urgent = True
            if "чпу" in symptom.lower() or "ошибка" in symptom.lower():
                recommendations.append("Диагностика электроавтоматики и приводов")
                probability = max(probability, 70)
            if "перегрев" in symptom.lower():
                recommendations.append("Проверка гидростанции и системы охлаждения")
                probability = max(probability, 60)
        
        if not recommendations:
            recommendations.append("Плановое техническое обслуживание")
        
        return {
            "risk_level": risk_level,
            "probability": probability,
            "urgent": urgent,
            "recommendation": "; ".join(recommendations[:2]),
            "detailed_analysis": f"Станок возрастом {age} лет требует внимания. " + 
                                 ("Выявленные симптомы указывают на износ." if symptoms else "Рекомендуется профилактика."),
            "next_steps": recommendations[:3]
        }

    @retry(stop=stop_after_attempt(2), wait=wait_exponential(multiplier=1, min=2, max=5))
    async def expand_query(self, query: str) -> str:
        """
        Expands a short user search query into a richer technical context for better semantic matching.
        """
        system_prompt = """You are an expert in industrial metalworking equipment. 
Your goal is to expand a user search query into a set of technical terms, synonyms, and related categories.

RULES:
- Return ONLY a comma-separated list of 5-10 keywords/synonyms in Russian.
- Include synonyms, technical names, both singular and plural forms, and common typos.
- Avoid generic terms like 'станок', 'машина', 'запчасти' unless they are part of a specific phrase or the input is very short.
- For model numbers, include variations with different separators or character sets.

Example 1:
Input: 'ролик'
Output: 'ролик, ролики, роликовый, валик, каток, направляющая, ролк'

Example 2:
Input: 'винторезный'
Output: 'токарно-винторезный, резьбонарезной, нарезка резьбы, металлорежущий станок, токарный станок'
"""

        try:
            response = await self.client.chat.completions.create(
                model=self.chat_model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": f"Search query: '{query}'"}
                ],
                temperature=0.3,
                max_tokens=150
            )
            expanded = response.choices[0].message.content.strip()
            return f"{query} {expanded}"
        except Exception as e:
            print(f"Query expansion failed: {e}")
            return query
