from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import date, timedelta
from app.database import get_db
from app.models import RecurringTransaction, Transaction, Category
from app.schemas import RecurringCreate, RecurringResponse

router = APIRouter(prefix="/api/recurring", tags=["Recurring Transactions"])

@router.get("", response_model=List[RecurringResponse])
def get_recurring_rules(db: Session = Depends(get_db)):
    return db.query(RecurringTransaction).order_by(RecurringTransaction.id.desc()).all()

@router.post("", response_model=RecurringResponse)
def create_recurring_rule(payload: RecurringCreate, db: Session = Depends(get_db)):
    rule = RecurringTransaction(
        title=payload.title,
        type=payload.type,
        amount=payload.amount,
        category_id=payload.category_id,
        category_name=payload.category_name,
        subcategory_id=payload.subcategory_id,
        subcategory_name=payload.subcategory_name,
        payment_method=payload.payment_method,
        merchant=payload.merchant,
        frequency=payload.frequency,
        day_of_month=payload.day_of_month,
        start_date=payload.start_date,
        end_date=payload.end_date,
        is_active=True
    )
    db.add(rule)
    db.commit()
    db.refresh(rule)
    return rule

@router.post("/{rule_id}/toggle")
def toggle_recurring_rule(rule_id: int, db: Session = Depends(get_db)):
    rule = db.query(RecurringTransaction).filter(RecurringTransaction.id == rule_id).first()
    if not rule:
        raise HTTPException(status_code=404, detail="Recurring rule not found")
    rule.is_active = not rule.is_active
    db.commit()
    return {"message": "Status updated", "is_active": rule.is_active}

@router.delete("/{rule_id}")
def delete_recurring_rule(rule_id: int, db: Session = Depends(get_db)):
    rule = db.query(RecurringTransaction).filter(RecurringTransaction.id == rule_id).first()
    if not rule:
        raise HTTPException(status_code=404, detail="Recurring rule not found")
    db.delete(rule)
    db.commit()
    return {"message": "Recurring rule deleted successfully"}

@router.post("/process-due")
def process_due_recurring(db: Session = Depends(get_db)):
    today = date.today()
    active_rules = db.query(RecurringTransaction).filter(RecurringTransaction.is_active == True).all()
    created_count = 0

    for rule in active_rules:
        # Check if due for current month
        # For monthly: day_of_month in this month
        due_date = date(today.year, today.month, min(rule.day_of_month, 28))
        if today >= due_date:
            # Check if already processed for this month
            if not rule.last_processed or (rule.last_processed.year == today.year and rule.last_processed.month < today.month) or rule.last_processed.year < today.year:
                # Create transaction
                tx = Transaction(
                    type=rule.type,
                    date=due_date,
                    category_id=rule.category_id,
                    subcategory_id=rule.subcategory_id,
                    category_name=rule.category_name,
                    subcategory_name=rule.subcategory_name,
                    amount=rule.amount,
                    payment_method=rule.payment_method,
                    merchant=rule.merchant,
                    description=f"{rule.title} (Auto-recurring)",
                    notes="Generated from recurring transaction rule",
                    is_recurring=True
                )
                db.add(tx)
                rule.last_processed = due_date
                created_count += 1

    db.commit()
    return {"message": f"Processed recurring transactions. {created_count} added.", "count": created_count}
