from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date
import calendar
from app.database import get_db
from app.models import Budget, Category, Transaction
from app.schemas import BudgetCreate, BudgetResponse
from app.services.analytics import get_budget_vs_actual

router = APIRouter(prefix="/api/budgets", tags=["Budgets"])

@router.get("", response_model=List[BudgetResponse])
def get_budgets(
    month: Optional[str] = Query(None, pattern="^\\d{4}-\\d{2}$"),
    db: Session = Depends(get_db)
):
    target_month = month or date.today().strftime("%Y-%m")
    return get_budget_vs_actual(db, target_month)

@router.post("", response_model=BudgetResponse)
def set_or_update_budget(payload: BudgetCreate, db: Session = Depends(get_db)):
    if payload.amount <= 0:
        raise HTTPException(status_code=400, detail="Budget amount must be positive")

    cat_name = "Overall Monthly Budget"
    if payload.category_id:
        cat = db.query(Category).filter(Category.id == payload.category_id).first()
        if not cat:
            raise HTTPException(status_code=404, detail="Category not found")
        cat_name = cat.name

    existing = db.query(Budget).filter(
        Budget.month == payload.month,
        Budget.category_id == payload.category_id
    ).first()

    if existing:
        existing.amount = payload.amount
        existing.category_name = cat_name
        db.commit()
        db.refresh(existing)
        target_budget = existing
    else:
        new_b = Budget(
            month=payload.month,
            category_id=payload.category_id,
            category_name=cat_name,
            amount=payload.amount
        )
        db.add(new_b)
        db.commit()
        db.refresh(new_b)
        target_budget = new_b

    # Recalculate spent for response
    year, m_num = map(int, payload.month.split("-"))
    m_start = date(year, m_num, 1)
    _, last_day = calendar.monthrange(year, m_num)
    m_end = date(year, m_num, last_day)

    if target_budget.category_id:
        from sqlalchemy import func
        spent = db.query(func.sum(Transaction.amount)).filter(
            Transaction.date >= m_start,
            Transaction.date <= m_end,
            Transaction.category_id == target_budget.category_id,
            Transaction.type == "expense"
        ).scalar() or 0.0
    else:
        from sqlalchemy import func
        spent = db.query(func.sum(Transaction.amount)).filter(
            Transaction.date >= m_start,
            Transaction.date <= m_end,
            Transaction.type == "expense"
        ).scalar() or 0.0

    spent = round(spent, 2)
    rem = round(target_budget.amount - spent, 2)
    pct = round((spent / target_budget.amount * 100), 1) if target_budget.amount > 0 else 0.0
    status = "exceeded" if pct >= 100 else ("warning" if pct >= 80 else "ok")

    return {
        "id": target_budget.id,
        "month": target_budget.month,
        "category_id": target_budget.category_id,
        "category_name": target_budget.category_name,
        "amount": round(target_budget.amount, 2),
        "spent": spent,
        "remaining": rem,
        "percentage": pct,
        "status": status
    }

@router.delete("/{budget_id}")
def delete_budget(budget_id: int, db: Session = Depends(get_db)):
    b = db.query(Budget).filter(Budget.id == budget_id).first()
    if not b:
        raise HTTPException(status_code=404, detail="Budget not found")
    db.delete(b)
    db.commit()
    return {"message": "Budget removed successfully"}
