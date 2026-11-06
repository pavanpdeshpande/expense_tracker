from fastapi import APIRouter, Depends, Query, Response
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import func, or_
from typing import Dict, Any, List, Optional
from datetime import date
import calendar
import io
import pandas as pd
from app.database import get_db
from app.models import Transaction

router = APIRouter(prefix="/api/reports", tags=["Reports & Analytics"])

@router.get("/analytics")
def get_detailed_analytics(
    year: int = Query(default=date.today().year),
    month: Optional[int] = Query(None, ge=1, le=12),
    db: Session = Depends(get_db)
):
    if month:
        start_date = date(year, month, 1)
        _, last_day = calendar.monthrange(year, month)
        end_date = date(year, month, last_day)
        period_label = f"{calendar.month_name[month]} {year}"
    else:
        start_date = date(year, 1, 1)
        end_date = date(year, 12, 31)
        period_label = f"Full Year {year}"

    # 1. Total Income, Expense, Net Savings
    income = db.query(func.sum(Transaction.amount)).filter(
        Transaction.date >= start_date,
        Transaction.date <= end_date,
        Transaction.type == "income"
    ).scalar() or 0.0

    expense = db.query(func.sum(Transaction.amount)).filter(
        Transaction.date >= start_date,
        Transaction.date <= end_date,
        Transaction.type == "expense"
    ).scalar() or 0.0

    savings = max(0.0, income - expense)
    savings_rate = round((savings / income * 100), 1) if income > 0 else 0.0

    # 2. Category-wise report
    cat_query = db.query(
        Transaction.category_name,
        func.sum(Transaction.amount).label("total"),
        func.count(Transaction.id).label("count")
    ).filter(
        Transaction.date >= start_date,
        Transaction.date <= end_date,
        Transaction.type == "expense"
    ).group_by(Transaction.category_name).order_by(func.sum(Transaction.amount).desc()).all()

    category_report = [
        {
            "category": c.category_name,
            "total": round(c.total, 2),
            "count": c.count,
            "percentage": round((c.total / expense * 100), 1) if expense > 0 else 0.0
        }
        for c in cat_query
    ]

    # 3. Merchant-wise spending (Top 10)
    merchant_query = db.query(
        func.coalesce(Transaction.merchant, "Unspecified").label("merchant_name"),
        func.sum(Transaction.amount).label("total"),
        func.count(Transaction.id).label("count")
    ).filter(
        Transaction.date >= start_date,
        Transaction.date <= end_date,
        Transaction.type == "expense"
    ).group_by("merchant_name").order_by(func.sum(Transaction.amount).desc()).limit(10).all()

    merchant_report = [
        {
            "merchant": m.merchant_name,
            "total": round(m.total, 2),
            "count": m.count,
            "percentage": round((m.total / expense * 100), 1) if expense > 0 else 0.0
        }
        for m in merchant_query
    ]

    # 4. Payment Method Analysis
    payment_query = db.query(
        Transaction.payment_method,
        func.sum(Transaction.amount).label("total"),
        func.count(Transaction.id).label("count")
    ).filter(
        Transaction.date >= start_date,
        Transaction.date <= end_date,
        Transaction.type == "expense"
    ).group_by(Transaction.payment_method).order_by(func.sum(Transaction.amount).desc()).all()

    payment_report = [
        {
            "payment_method": p.payment_method,
            "total": round(p.total, 2),
            "count": p.count,
            "percentage": round((p.total / expense * 100), 1) if expense > 0 else 0.0
        }
        for p in payment_query
    ]

    # 5. Month-over-Month comparison (for current year)
    mom_data = []
    for m in range(1, 13):
        m_s = date(year, m, 1)
        _, l_d = calendar.monthrange(year, m)
        m_e = date(year, m, l_d)

        m_inc = db.query(func.sum(Transaction.amount)).filter(
            Transaction.date >= m_s,
            Transaction.date <= m_e,
            Transaction.type == "income"
        ).scalar() or 0.0

        m_exp = db.query(func.sum(Transaction.amount)).filter(
            Transaction.date >= m_s,
            Transaction.date <= m_e,
            Transaction.type == "expense"
        ).scalar() or 0.0

        mom_data.append({
            "month": m_s.strftime("%b"),
            "month_num": m,
            "income": round(m_inc, 2),
            "expense": round(m_exp, 2),
            "savings": round(max(0.0, m_inc - m_exp), 2)
        })

    # 6. Year-over-Year comparison
    yoy_query = db.query(
        func.strftime("%Y", Transaction.date).label("yr"),
        Transaction.type,
        func.sum(Transaction.amount).label("total")
    ).group_by("yr", Transaction.type).all()

    yoy_dict = {}
    for row in yoy_query:
        if not row.yr:
            continue
        if row.yr not in yoy_dict:
            yoy_dict[row.yr] = {"year": row.yr, "income": 0.0, "expense": 0.0, "savings": 0.0}
        if row.type == "income":
            yoy_dict[row.yr]["income"] = round(row.total, 2)
        else:
            yoy_dict[row.yr]["expense"] = round(row.total, 2)
        yoy_dict[row.yr]["savings"] = round(max(0.0, yoy_dict[row.yr]["income"] - yoy_dict[row.yr]["expense"]), 2)

    yoy_list = sorted(yoy_dict.values(), key=lambda x: x["year"])

    return {
        "period_label": period_label,
        "year": year,
        "month": month,
        "summary": {
            "income": round(income, 2),
            "expense": round(expense, 2),
            "savings": round(savings, 2),
            "savings_rate": savings_rate
        },
        "category_report": category_report,
        "merchant_report": merchant_report,
        "payment_report": payment_report,
        "mom_data": mom_data,
        "yoy_data": yoy_list
    }
