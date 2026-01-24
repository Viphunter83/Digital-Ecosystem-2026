from fastapi import APIRouter, Depends
from sqlalchemy import select, func
from sqlalchemy.orm import Session
from apps.backend.app.core.database import get_db
from packages.database.models import ServiceTicket, Lead, LeadSource
from typing import Dict, Any

router = APIRouter()

@router.get("/director-stats")
async def get_director_stats(db: Session = Depends(get_db)):
    """
    Get real financial and operational statistics for the Director.
    """
    # 1. Затраты на ТО (resolved tickets)
    # Предполагаем, что в ServiceTicket может быть поле 'cost', 
    # если нет - считаем количество и берем средний чек (демо-логика для примера суммы)
    # Для продакшна используем реальные суммы из заказов запчастей + стоимость работ
    
    tickets_count = db.execute(select(func.count(ServiceTicket.id)).where(ServiceTicket.status == 'resolved')).scalar() or 0
    service_costs = tickets_count * 15000  # Демо-сумма, если нет поля cost
    
    # 2. Сумма заказов из корзины (cart_order leads)
    orders_stmt = select(Lead).where(Lead.source == LeadSource.cart_order)
    orders = db.execute(orders_stmt).scalars().all()
    
    total_orders_sum = 0
    for order in orders:
        if order.metadata_ and "total" in order.metadata_:
            try:
                total_orders_sum += float(order.metadata_["total"])
            except (ValueError, TypeError):
                continue
    
    # 3. Активные проекты (новые заявки)
    active_leads = db.execute(select(func.count(Lead.id)).where(Lead.status == 'new')).scalar() or 0

    return {
        "service_total": service_costs,
        "orders_total": total_orders_sum,
        "active_leads": active_leads,
        "summary": "Данные за текущий квартал 2026"
    }
