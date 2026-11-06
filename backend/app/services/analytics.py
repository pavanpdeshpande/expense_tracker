from datetime import date, datetime, timedelta
import calendar
from typing import Optional, Dict, Any, List, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_
from app.models import Transaction, Budget, Category

def get_date_range(filter_key: str, start_date: Optional[date] = None, end_date: Optional[date] = None) -> Tuple[date, date, str]:
    today = date.today()
    
    if filter_key == "today":
        return today, today, "Today"
    elif filter_key == "this_week":
        start = today - timedelta(days=today.weekday())
        end = start + timedelta(days=6)
        return start, end, "This Week"
    elif filter_key == "this_month":
        start = date(today.year, today.month, 1)
        _, last_day = calendar.monthrange(today.year, today.month)
        end = date(today.year, today.month, last_day)
        return start, end, "This Month"
    elif filter_key == "last_month":
        first_current = date(today.year, today.month, 1)
        prev_month_end = first_current - timedelta(days=1)
        start = date(prev_month_end.year, prev_month_end.month, 1)
        return start, prev_month_end, "Last Month"
    elif filter_key == "last_3_months":
        start = today - timedelta(days=90)
        return start, today, "Last 3 Months"
    elif filter_key == "last_6_months":
        start = today - timedelta(days=180)
        return start, today, "Last 6 Months"
    elif filter_key == "this_year":
        start = date(today.year, 1, 1)
        end = date(today.year, 12, 31)
        return start, end, "This Year"
    elif filter_key == "custom" and start_date and end_date:
        return start_date, end_date, f"{start_date.strftime('%d %b %Y')} - {end_date.strftime('%d %b %Y')}"
    else:
        # Default to this month
        start = date(today.year, today.month, 1)
        _, last_day = calendar.monthrange(today.year, today.month)
        end = date(today.year, today.month, last_day)
        return start, end, "This Month"

def get_previous_period_dates(start: date, end: date) -> Tuple[date, date]:
    # Calculate duration
    duration = (end - start).days + 1
    prev_end = start - timedelta(days=1)
    prev_start = prev_end - timedelta(days=duration - 1)
    return prev_start, prev_end

def calculate_change_pct(current: float, previous: float) -> Tuple[float, str]:
    if previous == 0:
        if current == 0:
            return 0.0, "neutral"
        return 100.0, "up"
    change = ((current - previous) / abs(previous)) * 100.0
    trend = "up" if change > 0 else ("down" if change < 0 else "neutral")
    return round(change, 1), trend

def get_dashboard_summary(db: Session, filter_key: str = "this_month", start_date: Optional[date] = None, end_date: Optional[date] = None) -> Dict[str, Any]:
    start, end, label = get_date_range(filter_key, start_date, end_date)
    prev_start, prev_end = get_previous_period_dates(start, end)
    
    # Current period totals
    current_txs = db.query(
        Transaction.type,
        Transaction.is_donation,
        func.sum(Transaction.amount).label("total")
    ).filter(
        Transaction.date >= start,
        Transaction.date <= end
    ).group_by(Transaction.type, Transaction.is_donation).all()

    income = 0.0
    expenses = 0.0
    donations = 0.0

    for tx in current_txs:
        if tx.type == "income":
            income += tx.total or 0.0
        elif tx.type == "expense":
            expenses += tx.total or 0.0
            if tx.is_donation:
                donations += tx.total or 0.0

    # Also calculate donations where category_name is "Donations & Charity" even if is_donation flag was unset
    don_cat_tx = db.query(func.sum(Transaction.amount)).filter(
        Transaction.date >= start,
        Transaction.date <= end,
        Transaction.category_name == "Donations & Charity",
        Transaction.is_donation == False
    ).scalar() or 0.0
    donations += don_cat_tx

    # Previous period totals
    prev_txs = db.query(
        Transaction.type,
        Transaction.is_donation,
        func.sum(Transaction.amount).label("total")
    ).filter(
        Transaction.date >= prev_start,
        Transaction.date <= prev_end
    ).group_by(Transaction.type, Transaction.is_donation).all()

    prev_income = 0.0
    prev_expenses = 0.0
    prev_donations = 0.0

    for tx in prev_txs:
        if tx.type == "income":
            prev_income += tx.total or 0.0
        elif tx.type == "expense":
            prev_expenses += tx.total or 0.0
            if tx.is_donation:
                prev_donations += tx.total or 0.0

    prev_don_cat_tx = db.query(func.sum(Transaction.amount)).filter(
        Transaction.date >= prev_start,
        Transaction.date <= prev_end,
        Transaction.category_name == "Donations & Charity",
        Transaction.is_donation == False
    ).scalar() or 0.0
    prev_donations += prev_don_cat_tx

    balance = income - expenses
    prev_balance = prev_income - prev_expenses

    savings = max(0.0, income - expenses)
    prev_savings = max(0.0, prev_income - prev_expenses)

    days_count = max(1, (end - start).days + 1)
    prev_days_count = max(1, (prev_end - prev_start).days + 1)
    daily_avg = expenses / days_count
    prev_daily_avg = prev_expenses / prev_days_count

    income_pct, income_trend = calculate_change_pct(income, prev_income)
    exp_pct, exp_trend = calculate_change_pct(expenses, prev_expenses)
    bal_pct, bal_trend = calculate_change_pct(balance, prev_balance)
    sav_pct, sav_trend = calculate_change_pct(savings, prev_savings)
    don_pct, don_trend = calculate_change_pct(donations, prev_donations)
    daily_pct, daily_trend = calculate_change_pct(daily_avg, prev_daily_avg)

    return {
        "income": {
            "amount": round(income, 2),
            "prev_month_amount": round(prev_income, 2),
            "change_pct": income_pct,
            "trend": income_trend
        },
        "expenses": {
            "amount": round(expenses, 2),
            "prev_month_amount": round(prev_expenses, 2),
            "change_pct": exp_pct,
            "trend": exp_trend
        },
        "balance": {
            "amount": round(balance, 2),
            "prev_month_amount": round(prev_balance, 2),
            "change_pct": bal_pct,
            "trend": bal_trend
        },
        "savings": {
            "amount": round(savings, 2),
            "prev_month_amount": round(prev_savings, 2),
            "change_pct": sav_pct,
            "trend": sav_trend
        },
        "donations": {
            "amount": round(donations, 2),
            "prev_month_amount": round(prev_donations, 2),
            "change_pct": don_pct,
            "trend": don_trend
        },
        "daily_avg_spend": {
            "amount": round(daily_avg, 2),
            "prev_month_amount": round(prev_daily_avg, 2),
            "change_pct": daily_pct,
            "trend": daily_trend
        },
        "filter_label": label,
        "start_date": start.isoformat(),
        "end_date": end.isoformat()
    }

def get_monthly_income_vs_expense(db: Session, months_back: int = 12) -> List[Dict[str, Any]]:
    today = date.today()
    results = []
    
    # Generate last N months in order
    for i in range(months_back - 1, -1, -1):
        year = today.year
        month = today.month - i
        while month <= 0:
            month += 12
            year -= 1
        
        m_start = date(year, month, 1)
        _, last_day = calendar.monthrange(year, month)
        m_end = date(year, month, last_day)
        month_label = m_start.strftime("%b %Y")
        month_key = m_start.strftime("%Y-%m")

        inc = db.query(func.sum(Transaction.amount)).filter(
            Transaction.date >= m_start,
            Transaction.date <= m_end,
            Transaction.type == "income"
        ).scalar() or 0.0

        exp = db.query(func.sum(Transaction.amount)).filter(
            Transaction.date >= m_start,
            Transaction.date <= m_end,
            Transaction.type == "expense"
        ).scalar() or 0.0

        savings = max(0.0, inc - exp)
        savings_rate = round((savings / inc * 100), 1) if inc > 0 else 0.0

        results.append({
            "month": month_label,
            "month_key": month_key,
            "income": round(inc, 2),
            "expense": round(exp, 2),
            "savings": round(savings, 2),
            "savings_rate": savings_rate
        })
        
    return results

def get_expense_distribution(db: Session, start: date, end: date) -> List[Dict[str, Any]]:
    query = db.query(
        Transaction.category_name,
        func.sum(Transaction.amount).label("total")
    ).filter(
        Transaction.date >= start,
        Transaction.date <= end,
        Transaction.type == "expense"
    ).group_by(Transaction.category_name).order_by(func.sum(Transaction.amount).desc()).all()

    total_expense = sum(q.total for q in query) or 1.0
    return [
        {
            "name": q.category_name,
            "amount": round(q.total, 2),
            "percentage": round((q.total / total_expense) * 100, 1)
        }
        for q in query
    ]

def get_daily_spending_trend(db: Session, start: date, end: date) -> List[Dict[str, Any]]:
    # Get daily aggregated expenses
    txs = db.query(
        Transaction.date,
        func.sum(Transaction.amount).label("total")
    ).filter(
        Transaction.date >= start,
        Transaction.date <= end,
        Transaction.type == "expense"
    ).group_by(Transaction.date).all()

    spent_dict = {t.date.isoformat(): round(t.total, 2) for t in txs}

    # If range is within 90 days, show each day; if larger, sample/group by week
    delta_days = (end - start).days
    result = []
    
    if delta_days <= 90:
        curr = start
        while curr <= end:
            iso = curr.isoformat()
            result.append({
                "date": curr.strftime("%d %b"),
                "full_date": iso,
                "amount": spent_dict.get(iso, 0.0)
            })
            curr += timedelta(days=1)
    else:
        # Group weekly
        curr = start
        while curr <= end:
            week_end = min(end, curr + timedelta(days=6))
            week_tx = db.query(func.sum(Transaction.amount)).filter(
                Transaction.date >= curr,
                Transaction.date <= week_end,
                Transaction.type == "expense"
            ).scalar() or 0.0
            
            result.append({
                "date": f"{curr.strftime('%d %b')}",
                "full_date": curr.isoformat(),
                "amount": round(week_tx, 2)
            })
            curr += timedelta(days=7)

    return result

def get_top_categories(db: Session, start: date, end: date, limit: int = 5) -> List[Dict[str, Any]]:
    query = db.query(
        Transaction.category_name,
        func.sum(Transaction.amount).label("total"),
        func.count(Transaction.id).label("count")
    ).filter(
        Transaction.date >= start,
        Transaction.date <= end,
        Transaction.type == "expense"
    ).group_by(Transaction.category_name).order_by(func.sum(Transaction.amount).desc()).limit(limit).all()

    total_expense = db.query(func.sum(Transaction.amount)).filter(
        Transaction.date >= start,
        Transaction.date <= end,
        Transaction.type == "expense"
    ).scalar() or 1.0

    return [
        {
            "category": q.category_name,
            "amount": round(q.total, 2),
            "count": q.count,
            "percentage": round((q.total / total_expense) * 100, 1)
        }
        for q in query
    ]

def get_budget_vs_actual(db: Session, month_str: str) -> List[Dict[str, Any]]:
    # month_str format: YYYY-MM
    year, month = map(int, month_str.split("-"))
    m_start = date(year, month, 1)
    _, last_day = calendar.monthrange(year, month)
    m_end = date(year, month, last_day)

    budgets = db.query(Budget).filter(Budget.month == month_str).all()
    results = []

    for b in budgets:
        cat_name = b.category_name or "Overall Monthly Budget"
        if b.category_id:
            spent = db.query(func.sum(Transaction.amount)).filter(
                Transaction.date >= m_start,
                Transaction.date <= m_end,
                Transaction.category_id == b.category_id,
                Transaction.type == "expense"
            ).scalar() or 0.0
        else:
            spent = db.query(func.sum(Transaction.amount)).filter(
                Transaction.date >= m_start,
                Transaction.date <= m_end,
                Transaction.type == "expense"
            ).scalar() or 0.0

        spent = round(spent, 2)
        remaining = round(b.amount - spent, 2)
        pct = round((spent / b.amount * 100), 1) if b.amount > 0 else 0.0
        
        status = "ok"
        if pct >= 100:
            status = "exceeded"
        elif pct >= 80:
            status = "warning"

        results.append({
            "id": b.id,
            "category_name": cat_name,
            "category_id": b.category_id,
            "budget": round(b.amount, 2),
            "spent": spent,
            "remaining": remaining,
            "percentage": pct,
            "status": status
        })

    return results

def get_yearly_expense_comparison(db: Session) -> List[Dict[str, Any]]:
    # Compare expenses of each year recorded in DB
    query = db.query(
        func.strftime("%Y", Transaction.date).label("year"),
        Transaction.type,
        func.sum(Transaction.amount).label("total")
    ).group_by("year", Transaction.type).all()

    years_data: Dict[str, Dict[str, float]] = {}
    for row in query:
        if not row.year:
            continue
        if row.year not in years_data:
            years_data[row.year] = {"year": row.year, "income": 0.0, "expense": 0.0}
        if row.type == "income":
            years_data[row.year]["income"] = round(row.total, 2)
        elif row.type == "expense":
            years_data[row.year]["expense"] = round(row.total, 2)

    # Convert to sorted list
    sorted_years = sorted(years_data.values(), key=lambda x: x["year"])
    # If less than 2 years, ensure at least current and previous year
    current_year = str(date.today().year)
    if not sorted_years:
        sorted_years = [{"year": current_year, "income": 0.0, "expense": 0.0}]
    return sorted_years

def generate_spending_insights(db: Session) -> List[Dict[str, Any]]:
    insights = []
    today = date.today()
    curr_month_start = date(today.year, today.month, 1)
    _, curr_last_day = calendar.monthrange(today.year, today.month)
    curr_month_end = date(today.year, today.month, curr_last_day)

    prev_month_end = curr_month_start - timedelta(days=1)
    prev_month_start = date(prev_month_end.year, prev_month_end.month, 1)

    curr_exp = db.query(func.sum(Transaction.amount)).filter(
        Transaction.date >= curr_month_start,
        Transaction.date <= curr_month_end,
        Transaction.type == "expense"
    ).scalar() or 0.0

    prev_exp = db.query(func.sum(Transaction.amount)).filter(
        Transaction.date >= prev_month_start,
        Transaction.date <= prev_month_end,
        Transaction.type == "expense"
    ).scalar() or 0.0

    # 1. MoM Expense change
    if prev_exp > 0:
        diff_pct = round(((curr_exp - prev_exp) / prev_exp) * 100, 1)
        if diff_pct > 25:
            insights.append({
                "type": "warning",
                "title": "Expense Spike Detected",
                "message": f"Spending is {diff_pct}% higher this month (₹{curr_exp:,.2f}) compared to last month (₹{prev_exp:,.2f})."
            })
        elif diff_pct < -15:
            insights.append({
                "type": "positive",
                "title": "Great Spending Control",
                "message": f"You have reduced spending by {abs(diff_pct)}% compared to last month! Keep it up."
            })

    # 2. Highest spending category this month
    top_cat = db.query(
        Transaction.category_name,
        func.sum(Transaction.amount).label("total")
    ).filter(
        Transaction.date >= curr_month_start,
        Transaction.date <= curr_month_end,
        Transaction.type == "expense"
    ).group_by(Transaction.category_name).order_by(func.sum(Transaction.amount).desc()).first()

    if top_cat and curr_exp > 0:
        cat_pct = round((top_cat.total / curr_exp) * 100, 1)
        insights.append({
            "type": "info",
            "title": f"Top Expense: {top_cat.category_name}",
            "message": f"Accounts for {cat_pct}% (₹{top_cat.total:,.2f}) of your total expenses this month."
        })

    # 3. Daily spending rate
    days_passed = max(1, today.day)
    avg_per_day = round(curr_exp / days_passed, 2)
    insights.append({
        "type": "info",
        "title": "Daily Spend Average",
        "message": f"You are spending an average of ₹{avg_per_day:,.2f} per day in {today.strftime('%B')}."
    })

    # 4. Budget alert checks
    curr_month_str = today.strftime("%Y-%m")
    budgets = get_budget_vs_actual(db, curr_month_str)
    for b in budgets:
        if b["status"] == "exceeded":
            insights.append({
                "type": "danger",
                "title": f"Budget Exceeded: {b['category_name']}",
                "message": f"Spent ₹{b['spent']:,.2f} of ₹{b['budget']:,.2f} ({b['percentage']}% utilized)."
            })
        elif b["status"] == "warning":
            insights.append({
                "type": "warning",
                "title": f"Budget Warning: {b['category_name']}",
                "message": f"Spent ₹{b['spent']:,.2f} ({b['percentage']}%), approaching the ₹{b['budget']:,.2f} limit."
            })

    return insights
