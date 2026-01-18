from fastapi import APIRouter
from pydantic import BaseModel
from typing import List

router = APIRouter()

class DiagnosticsRequest(BaseModel):
    machine_type: str
    age: int
    symptoms: List[str]

class DiagnosticsResponse(BaseModel):
    risk_level: str
    probability: int
    recommendation: str
    urgent: bool

@router.post("/analyze", response_model=DiagnosticsResponse)
async def analyze_machine(request: DiagnosticsRequest):
    """
    Analyze machine status based on symptoms and age.
    """
    # Hardcoded Logic for Demo
    risk_level = "Moderate"
    probability = 45
    recommendations = []
    urgent = False
    
    # 1. Age Check -> Critical
    if request.age > 20:
        risk_level = "Critical"
        probability = 95
        recommendations.append("Полная капиталка или замена")
        urgent = True
    
    # 2. Symptoms Check
    if "Вибрация" in request.symptoms:
        recommendations.append("Проверка шпиндельного узла и подшипников")
        if risk_level != "Critical":
            # If not already critical/replacement, this implies moderate-high risk
            probability = max(probability, 75)
            urgent = True

    if "Ошибка ЧПУ" in request.symptoms:
        recommendations.append("Диагностика электроавтоматики и приводов")
        if risk_level != "Critical":
            probability = max(probability, 70)
            urgent = True

    # 4. In other cases -> Moderate (already set default)
    
    # Format recommendation
    if not recommendations:
        final_rec = "Плановое техническое обслуживание"
    else:
        final_rec = "; ".join(recommendations)

    return DiagnosticsResponse(
        risk_level=risk_level,
        probability=probability,
        recommendation=final_rec,
        urgent=urgent
    )
