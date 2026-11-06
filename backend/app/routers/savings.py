from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Dict, Any, List
from datetime import date
import calendar
from app.database import get_db
from app.models import Transaction

router = APIRouter(prefix="/api/savings", tags=["Savings"])

@router.get("/overview")
def get_savings_overview(
    year: int = Query(default=date.today().year),
    db: Session = Depends(get_db)
):
    today = date.today()
    curr_month_start = date(today.year, today.month, 1)
    _, curr_last_day = calendar.monthrange(today.year, today.month)
    curr_month_end = date(today.year, today.month, curr_last_day)

    # Current month
    curr_inc = db.query(func.sum(Transaction.amount)).filter(
        Transaction.date >= curr_month_start,
        Transaction.date <= curr_month_end,
        Transaction.type == "income"
    ).scalar() or 0.0

    curr_exp = db.query(func.sum(Transaction.amount)).filter(
        Transaction.date >= curr_month_start,
        Transaction.date <= curr_month_end,
        Transaction.type == "expense"
    ).scalar() or 0.0

    curr_savings = max(0.0, curr_inc - curr_exp)
    curr_savings_rate = round((curr_savings / curr_inc * 100), 1) if curr_inc > 0 else 0.0

    # Year totals
    year_start = date(year, 1, 1)
    year_end = date(year, 12, 31)

    year_inc = db.query(func.sum(Transaction.amount)).filter(
        Transaction.date >= year_start,
        Transaction.date <= year_end,
        Transaction.type == "income"
    ).scalar() or 0.0

    year_exp = db.query(func.sum(Transaction.amount)).filter(
        Transaction.date >= year_start,
        Transaction.date <= year_end,
        Transaction.type == "expense"
    ).scalar() or 0.0

    year_savings = max(0.0, year_inc - year_exp)
    year_savings_rate = round((year_savings / year_inc * 100), 1) if year_inc > 0 else 0.0

    # Previous Year totals for growth calculations
    prev_year_start = date(year - 1, 1, 1)
    prev_year_end = date(year - 1, 12, 31)

    prev_year_inc = db.query(func.sum(Transaction.amount)).filter(
        Transaction.date >= prev_year_start,
        Transaction.date <= prev_year_end,
        Transaction.type == "income"
    ).scalar() or 0.0

    prev_year_exp = db.query(func.sum(Transaction.amount)).filter(
        Transaction.date >= prev_year_start,
        Transaction.date <= prev_year_end,
        Transaction.type == "expense"
    ).scalar() or 0.0

    inc_growth = round(((year_inc - prev_year_inc) / prev_year_inc * 100), 1) if prev_year_inc > 0 else 0.0
    exp_growth = round(((year_exp - prev_year_exp) / prev_year_exp * 100), 1) if prev_year_exp > 0 else 0.0

    # Monthly breakdown for selected year to find highest, lowest, average
    monthly_data = []
    months_with_expenses = []

    for m in range(1, 13):
        m_start = date(year, m, 1)
        _, l_day = calendar.monthrange(year, m)
        m_end = date(year, m, l_day)
        m_name = m_start.strftime("%b")

        m_inc = db.query(func.sum(Transaction.amount)).filter(
            Transaction.date >= m_start,
            Transaction.date <= m_end,
            Transaction.type == "income"
        ).scalar() or 0.0

        m_exp = db.query(func.sum(Transaction.amount)).filter(
            Transaction.date >= m_start,
            Transaction.date <= m_end,
            Transaction.type == "expense"
        ).scalar() or 0.0

        m_sav = max(0.0, m_inc - m_exp)
        m_rate = round((m_sav / m_inc * 100), 1) if m_inc > 0 else 0.0

        if m_exp > 0:
            months_with_expenses.append({"month": m_name, "expense": m_exp})

        monthly_data.append({
            "month": m_name,
            "month_num": m,
            "income": round(m_inc, 2),
            "expense": round(m_exp, 2),
            "savings": round(m_sav, 2),
            "savings_rate": m_rate
        })

    # Highest and Lowest spending months
    highest_month = max(months_with_expenses, key=lambda x: x["expense"]) if months_with_expenses else {"month": "N/A", "expense": 0.0}
    lowest_month = min(months_with_expenses, key=lambda x: x["expense"]) if months_with_expenses else {"month": "N/A", "expense": 0.0}

    active_months_count = max(1, len(months_with_expenses))
    avg_monthly_exp = round(year_exp / active_months_count, 2)

    return {
        "year": year,
        "current_month_savings": round(curr_savings, 2),
        "current_month_savings_rate": curr_savings_rate,
        "yearly_savings": round(year_savings, 2),
        "yearly_savings_rate": year_savings_rate,
        "yearly_income": round(year_inc, 2),
        "yearly_expense": round(year_exp, 2),
        "income_growth": inc_growth,
        "expense_growth": exp_growth,
        "highest_spending_month": highest_month,
        "lowest_spending_month": lowest_month,
        "avg_monthly_expenditure": avg_monthly_exp,
        "monthly_breakdown": monthly_data
    }
