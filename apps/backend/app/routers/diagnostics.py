from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

class DiagnosticsRequest(BaseModel):
    machine_type: str
    age: int
    symptoms: List[str]

class DiagnosticsResponse(BaseModel):
    risk_level: str
    probability: int
    recommendation: str
    urgent: bool
    detailed_analysis: Optional[str] = None
    next_steps: Optional[List[str]] = None

@router.post("/analyze", response_model=DiagnosticsResponse)
async def analyze_machine(request: DiagnosticsRequest):
    """
    Analyze machine status based on symptoms and age.
    Uses AI for intelligent recommendations with fallback to rule-based logic.
    """
    import traceback
    
    try:
        # Try AI-powered analysis
        try:
            from apps.backend.services.ai_service import AIService
            ai_service = AIService()
            
            result = await ai_service.generate_diagnosis_recommendation(
                machine_type=request.machine_type,
                age=request.age,
                symptoms=request.symptoms
            )
            
            logger.info(f"AI diagnosis completed for {request.machine_type}, age {request.age}")
            
            return DiagnosticsResponse(
                risk_level=result.get("risk_level", "Moderate"),
                probability=result.get("probability", 50),
                recommendation=result.get("recommendation", "Требуется осмотр специалиста"),
                urgent=result.get("urgent", False),
                detailed_analysis=result.get("detailed_analysis"),
                next_steps=result.get("next_steps")
            )
        except Exception as ai_e:
            logger.error(f"AI diagnosis failed: {ai_e}, using primary fallback. Traceback: {traceback.format_exc()}")
            
            # Fallback to simple rule-based logic
            risk_level = "Moderate"
            probability = 45
            recommendations = []
            urgent = False
            
            if request.age > 20:
                risk_level = "Critical"
                probability = 95
                recommendations.append("Полная капиталка или замена")
                urgent = True
            
            # Defensive string check
            symptoms_str = str(request.symptoms or [])
            if "Вибрация" in symptoms_str:
                recommendations.append("Проверка шпиндельного узла и подшипников")
                if risk_level != "Critical":
                    probability = max(probability, 75)
                    urgent = True

            if any("ЧПУ" in str(s) or "ошибка" in str(s).lower() for s in (request.symptoms or [])):
                recommendations.append("Диагностика электроавтоматики и приводов")
                if risk_level != "Critical":
                    probability = max(probability, 70)
                    urgent = True
            
            final_rec = "; ".join(recommendations) if recommendations else "Плановое техническое обслуживание"

            return DiagnosticsResponse(
                risk_level=risk_level,
                probability=probability,
                recommendation=final_rec,
                urgent=urgent,
                detailed_analysis="Результат получен с помощью системы резервного анализа.",
                next_steps=recommendations[:3] if recommendations else ["Провести ТО"]
            )
            
    except Exception as fatal_e:
        logger.error(f"FATAL ERROR in analyze_machine: {fatal_e}. Traceback: {traceback.format_exc()}")
        # Last resort fallback to avoid 500
        return DiagnosticsResponse(
            risk_level="Unknown",
            probability=0,
            recommendation="Ошибка системы анализа. Пожалуйста, свяжитесь с поддержкой.",
            urgent=False,
            detailed_analysis=f"Technical error: {str(fatal_e)}"
        )
