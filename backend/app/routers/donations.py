from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, or_
from typing import Dict, Any, List, Optional
from datetime import date
import calendar
from app.database import get_db
from app.models import Transaction

router = APIRouter(prefix="/api/donations", tags=["Donations"])

@router.get("/summary")
def get_donations_summary(
    year: int = Query(default=date.today().year),
    db: Session = Depends(get_db)
):
    today = date.today()
    curr_month_start = date(today.year, today.month, 1)
    _, curr_last_day = calendar.monthrange(today.year, today.month)
    curr_month_end = date(today.year, today.month, curr_last_day)

    year_start = date(year, 1, 1)
    year_end = date(year, 12, 31)

    donation_filter = or_(Transaction.is_donation == True, Transaction.category_name == "Donations & Charity")

    # Monthly total for current month
    curr_month_donations = db.query(func.sum(Transaction.amount)).filter(
        donation_filter,
        Transaction.date >= curr_month_start,
        Transaction.date <= curr_month_end
    ).scalar() or 0.0

    # Yearly total
    yearly_donations = db.query(func.sum(Transaction.amount)).filter(
        donation_filter,
        Transaction.date >= year_start,
        Transaction.date <= year_end
    ).scalar() or 0.0

    # Count of donations
    yearly_count = db.query(func.count(Transaction.id)).filter(
        donation_filter,
        Transaction.date >= year_start,
        Transaction.date <= year_end
    ).scalar() or 0

    # Category breakdown (Temple, Annadanam, Education, etc.)
    cat_breakdown = db.query(
        func.coalesce(Transaction.donation_category, Transaction.subcategory_name, "Other donations").label("category"),
        func.sum(Transaction.amount).label("total"),
        func.count(Transaction.id).label("count")
    ).filter(
        donation_filter,
        Transaction.date >= year_start,
        Transaction.date <= year_end
    ).group_by("category").order_by(func.sum(Transaction.amount).desc()).all()

    # Monthly breakdown for the year
    monthly_trend = []
    for m in range(1, 13):
        m_start = date(year, m, 1)
        _, l_day = calendar.monthrange(year, m)
        m_end = date(year, m, l_day)
        
        m_total = db.query(func.sum(Transaction.amount)).filter(
            donation_filter,
            Transaction.date >= m_start,
            Transaction.date <= m_end
        ).scalar() or 0.0

        monthly_trend.append({
            "month": m_start.strftime("%b"),
            "amount": round(m_total, 2)
        })

    # Top recipient organizations / temples
    top_orgs = db.query(
        Transaction.merchant.label("organization"),
        func.sum(Transaction.amount).label("total"),
        func.count(Transaction.id).label("count")
    ).filter(
        donation_filter,
        Transaction.date >= year_start,
        Transaction.date <= year_end,
        Transaction.merchant.isnot(None)
    ).group_by(Transaction.merchant).order_by(func.sum(Transaction.amount).desc()).limit(5).all()

    return {
        "year": year,
        "current_month_total": round(curr_month_donations, 2),
        "yearly_total": round(yearly_donations, 2),
        "yearly_count": yearly_count,
        "category_breakdown": [
            {
                "category": r.category,
                "amount": round(r.total, 2),
                "count": r.count,
                "percentage": round((r.total / yearly_donations * 100), 1) if yearly_donations > 0 else 0.0
            }
            for r in cat_breakdown
        ],
        "monthly_trend": monthly_trend,
        "top_recipients": [
            {
                "organization": r.organization or "Anonymous",
                "amount": round(r.total, 2),
                "count": r.count
            }
            for r in top_orgs
        ]
    }
