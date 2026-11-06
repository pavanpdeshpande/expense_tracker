from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional, Dict, Any, List
from datetime import date
from app.database import get_db
from app.services.analytics import (
    get_date_range,
    get_dashboard_summary,
    get_monthly_income_vs_expense,
    get_expense_distribution,
    get_daily_spending_trend,
    get_top_categories,
    get_budget_vs_actual,
    get_yearly_expense_comparison,
    generate_spending_insights
)

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

@router.get("/summary")
def dashboard_summary(
    filter_key: str = Query("this_month", alias="filter"),
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db)
):
    return get_dashboard_summary(db, filter_key, start_date, end_date)

@router.get("/charts")
def dashboard_charts(
    filter_key: str = Query("this_month", alias="filter"),
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db)
):
    start, end, label = get_date_range(filter_key, start_date, end_date)
    curr_month_str = date.today().strftime("%Y-%m")

    monthly_inc_exp = get_monthly_income_vs_expense(db, months_back=12)
    expense_dist = get_expense_distribution(db, start, end)
    daily_trend = get_daily_spending_trend(db, start, end)
    top_cats = get_top_categories(db, start, end, limit=5)
    budget_actual = get_budget_vs_actual(db, curr_month_str)
    yearly_comp = get_yearly_expense_comparison(db)

    # Monthly savings trend data is extracted from monthly_inc_exp
    savings_trend = [
        {
            "month": m["month"],
            "savings": m["savings"],
            "savings_rate": m["savings_rate"]
        }
        for m in monthly_inc_exp
    ]

    return {
        "filter_label": label,
        "monthly_income_vs_expense": monthly_inc_exp,
        "expense_distribution": expense_dist,
        "daily_spending_trend": daily_trend,
        "category_expenses": expense_dist,
        "monthly_savings_trend": savings_trend,
        "yearly_comparison": yearly_comp,
        "top_categories": top_cats,
        "budget_vs_actual": budget_actual
    }

@router.get("/insights")
def dashboard_insights(db: Session = Depends(get_db)):
    return generate_spending_insights(db)
