from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, or_, desc, asc
from typing import List, Optional
from datetime import date, timedelta
from app.database import get_db
from app.models import Transaction, Category, Subcategory
from app.schemas import (
    TransactionCreate,
    TransactionUpdate,
    TransactionResponse,
    PaginatedTransactions,
    DuplicateCheckRequest,
    DuplicateCheckResponse
)

router = APIRouter(prefix="/api/transactions", tags=["Transactions"])

@router.get("", response_model=PaginatedTransactions)
def list_transactions(
    page: int = 1,
    page_size: int = 15,
    search: Optional[str] = None,
    type: Optional[str] = None,  # 'expense', 'income', or 'all'
    category_name: Optional[str] = None,
    subcategory_name: Optional[str] = None,
    payment_method: Optional[str] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    min_amount: Optional[float] = None,
    max_amount: Optional[float] = None,
    is_donation: Optional[bool] = None,
    sort_by: str = "date",
    sort_order: str = "desc",
    db: Session = Depends(get_db)
):
    query = db.query(Transaction)

    if type and type != "all":
        query = query.filter(Transaction.type == type)
    
    if is_donation is not None:
        if is_donation:
            query = query.filter(
                or_(Transaction.is_donation == True, Transaction.category_name == "Donations & Charity")
            )
        else:
            query = query.filter(Transaction.is_donation == False)

    if category_name and category_name != "all":
        query = query.filter(Transaction.category_name == category_name)

    if subcategory_name and subcategory_name != "all":
        query = query.filter(Transaction.subcategory_name == subcategory_name)

    if payment_method and payment_method != "all":
        query = query.filter(Transaction.payment_method == payment_method)

    if start_date:
        query = query.filter(Transaction.date >= start_date)

    if end_date:
        query = query.filter(Transaction.date <= end_date)

    if min_amount is not None:
        query = query.filter(Transaction.amount >= min_amount)

    if max_amount is not None:
        query = query.filter(Transaction.amount <= max_amount)

    if search:
        search_filter = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Transaction.description.ilike(search_filter),
                Transaction.merchant.ilike(search_filter),
                Transaction.category_name.ilike(search_filter),
                Transaction.subcategory_name.ilike(search_filter),
                Transaction.notes.ilike(search_filter)
            )
        )

    # Calculate total matching count and sum
    total_count = query.count()
    total_sum_result = query.with_entities(func.sum(Transaction.amount)).scalar() or 0.0

    # Sorting
    sort_column = getattr(Transaction, sort_by)
    if sort_order == "desc":
        query = query.order_by(desc(sort_column), desc(Transaction.id))
    else:
        query = query.order_by(asc(sort_column), asc(Transaction.id))

    # Pagination
    items = query.offset((page - 1) * page_size).limit(page_size).all()
    total_pages = (total_count + page_size - 1) // page_size if total_count > 0 else 1

    return {
        "items": items,
        "total": total_count,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages,
        "total_amount": round(total_sum_result, 2)
    }

@router.post("/check-duplicate", response_model=DuplicateCheckResponse)
def check_duplicate(payload: DuplicateCheckRequest, db: Session = Depends(get_db)):
    # Look for duplicate transactions within +/- 1 day with the same amount
    day_before = payload.date - timedelta(days=1)
    day_after = payload.date + timedelta(days=1)
    
    query = db.query(Transaction).filter(
        Transaction.date >= day_before,
        Transaction.date <= day_after,
        func.abs(Transaction.amount - payload.amount) < 0.01
    )

    if payload.merchant:
        query = query.filter(Transaction.merchant.ilike(f"%{payload.merchant.strip()}%"))
    elif payload.description:
        query = query.filter(Transaction.description.ilike(f"%{payload.description.strip()}%"))

    matches = query.limit(5).all()
    return {
        "is_duplicate": len(matches) > 0,
        "matches": matches
    }

@router.post("", response_model=TransactionResponse)
def create_transaction(payload: TransactionCreate, db: Session = Depends(get_db)):
    cat_id = payload.category_id
    subcat_id = payload.subcategory_id

    # If category_id not passed, find by category_name
    if not cat_id and payload.category_name:
        cat = db.query(Category).filter(Category.name.ilike(payload.category_name.strip())).first()
        if cat:
            cat_id = cat.id

    if cat_id and not subcat_id and payload.subcategory_name:
        sub = db.query(Subcategory).filter(
            Subcategory.category_id == cat_id,
            Subcategory.name.ilike(payload.subcategory_name.strip())
        ).first()
        if sub:
            subcat_id = sub.id

    # Auto-flag as donation if category is Donations & Charity
    is_donation = payload.is_donation or (payload.category_name == "Donations & Charity")

    tx = Transaction(
        type=payload.type,
        date=payload.date,
        category_id=cat_id,
        subcategory_id=subcat_id,
        category_name=payload.category_name.strip(),
        subcategory_name=payload.subcategory_name.strip() if payload.subcategory_name else None,
        amount=payload.amount,
        payment_method=payload.payment_method,
        merchant=payload.merchant.strip() if payload.merchant else None,
        description=payload.description.strip(),
        notes=payload.notes.strip() if payload.notes else None,
        is_donation=is_donation,
        donation_category=payload.donation_category,
        donation_purpose=payload.donation_purpose,
        account=payload.account,
        is_recurring=payload.is_recurring
    )
    db.add(tx)
    db.commit()
    db.refresh(tx)
    return tx

@router.get("/{tx_id}", response_model=TransactionResponse)
def get_transaction(tx_id: int, db: Session = Depends(get_db)):
    tx = db.query(Transaction).filter(Transaction.id == tx_id).first()
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return tx

@router.put("/{tx_id}", response_model=TransactionResponse)
def update_transaction(tx_id: int, payload: TransactionUpdate, db: Session = Depends(get_db)):
    tx = db.query(Transaction).filter(Transaction.id == tx_id).first()
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")

    update_data = payload.model_dump(exclude_unset=True)

    # Re-evaluate category_id if category_name is updated
    if "category_name" in update_data and update_data["category_name"]:
        cat = db.query(Category).filter(Category.name.ilike(update_data["category_name"].strip())).first()
        if cat:
            tx.category_id = cat.id
            tx.category_name = cat.name

    if "subcategory_name" in update_data and update_data["subcategory_name"]:
        sub = db.query(Subcategory).filter(
            Subcategory.name.ilike(update_data["subcategory_name"].strip())
        ).first()
        if sub:
            tx.subcategory_id = sub.id

    for key, value in update_data.items():
        if key not in ["category_id", "subcategory_id"]:
            setattr(tx, key, value)

    if tx.category_name == "Donations & Charity":
        tx.is_donation = True

    db.commit()
    db.refresh(tx)
    return tx

@router.delete("/{tx_id}")
def delete_transaction(tx_id: int, db: Session = Depends(get_db)):
    tx = db.query(Transaction).filter(Transaction.id == tx_id).first()
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    db.delete(tx)
    db.commit()
    return {"message": "Transaction deleted successfully"}
