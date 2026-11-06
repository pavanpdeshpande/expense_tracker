import random
from datetime import date, timedelta
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Transaction, Budget, Category, Subcategory

router = APIRouter(prefix="/api/sample-data", tags=["Sample Data"])

SAMPLE_EXPENSES = [
    # Food & Dining
    {"cat": "Food & Dining", "sub": "Swiggy", "mer": "Swiggy", "desc": "Dinner order from Biryani Blues", "amt_range": (350, 950), "methods": ["UPI", "Google Pay", "PhonePe"]},
    {"cat": "Food & Dining", "sub": "Zomato", "mer": "Zomato", "desc": "Weekend pizza order", "amt_range": (450, 1200), "methods": ["Credit Card", "Paytm", "UPI"]},
    {"cat": "Food & Dining", "sub": "Tea / Coffee", "mer": "Third Wave Coffee", "desc": "Artisan cappuccino & croissant", "amt_range": (280, 520), "methods": ["UPI", "PhonePe"]},
    {"cat": "Food & Dining", "sub": "Restaurants", "mer": "Barbeque Nation", "desc": "Buffet dinner with friends", "amt_range": (1800, 3600), "methods": ["Credit Card", "Debit Card"]},
    {"cat": "Food & Dining", "sub": "Snacks", "mer": "Haldiram's", "desc": "Evening chaat and sweets", "amt_range": (150, 450), "methods": ["UPI", "Cash"]},

    # Groceries & Household
    {"cat": "Groceries & Household", "sub": "Monthly groceries", "mer": "DMart Supermarket", "desc": "Monthly pantry provisions", "amt_range": (3200, 6800), "methods": ["Debit Card", "UPI", "Credit Card"]},
    {"cat": "Groceries & Household", "sub": "Vegetables", "mer": "Blinkit", "desc": "Fresh organic veggies & greens", "amt_range": (220, 580), "methods": ["Google Pay", "PhonePe"]},
    {"cat": "Groceries & Household", "sub": "Milk & Dairy", "mer": "Country Delight", "desc": "Cow milk & paneer delivery", "amt_range": (350, 850), "methods": ["UPI", "Paytm"]},
    {"cat": "Groceries & Household", "sub": "Fruits", "mer": "Local Fruit Stall", "desc": "Apples, bananas & seasonal fruits", "amt_range": (180, 420), "methods": ["Cash", "UPI"]},

    # Travel & Transportation
    {"cat": "Travel & Transportation", "sub": "Petrol / Diesel", "mer": "Indian Oil Fuel Station", "desc": "Vehicle fuel tank refill", "amt_range": (1500, 3200), "methods": ["Credit Card", "UPI"]},
    {"cat": "Travel & Transportation", "sub": "Cab / Uber / Ola", "mer": "Uber India", "desc": "Office commute ride", "amt_range": (240, 620), "methods": ["UPI", "Google Pay"]},
    {"cat": "Travel & Transportation", "sub": "Toll", "mer": "FASTag NHAI", "desc": "Highway toll auto-debit", "amt_range": (120, 380), "methods": ["Paytm", "Bank Transfer"]},
    {"cat": "Travel & Transportation", "sub": "Vehicle maintenance", "mer": "Bosch Car Service", "desc": "Periodic vehicle checkup & wash", "amt_range": (2200, 5500), "methods": ["Credit Card", "Debit Card"]},

    # Shopping
    {"cat": "Shopping", "sub": "Amazon", "mer": "Amazon India", "desc": "Home organizers & ergonomic mouse", "amt_range": (899, 3499), "methods": ["Credit Card", "UPI"]},
    {"cat": "Shopping", "sub": "Clothing", "mer": "Zara / Myntra", "desc": "Formal shirts & casual trousers", "amt_range": (1499, 4500), "methods": ["Credit Card", "Debit Card"]},
    {"cat": "Shopping", "sub": "Electronics", "mer": "Croma Electronics", "desc": "Wireless noise cancelling earbuds", "amt_range": (2999, 7999), "methods": ["Credit Card", "Bank Transfer"]},

    # Bills & Utilities
    {"cat": "Bills & Utilities", "sub": "Electricity", "mer": "State Electricity Board", "desc": "Monthly home power bill", "amt_range": (1450, 3100), "methods": ["UPI", "Net Banking"]},
    {"cat": "Bills & Utilities", "sub": "Internet", "mer": "Airtel Xstream Fiber", "desc": "High-speed broadband fiber plan", "amt_range": (999, 1499), "methods": ["Credit Card", "UPI"]},
    {"cat": "Bills & Utilities", "sub": "Mobile bills", "mer": "Jio Infocomm", "desc": "Unlimited 5G quarterly recharge", "amt_range": (749, 999), "methods": ["PhonePe", "Google Pay"]},
    {"cat": "Bills & Utilities", "sub": "Rent", "mer": "Landlord Housing Account", "desc": "Monthly apartment rental payment", "amt_range": (22000, 28000), "methods": ["Bank Transfer"]},

    # Personal Expenses
    {"cat": "Personal Expenses", "sub": "Subscriptions", "mer": "Netflix & Spotify", "desc": "Monthly entertainment streaming subscription", "amt_range": (649, 1199), "methods": ["Credit Card"]},
    {"cat": "Personal Expenses", "sub": "Medical", "mer": "Apollo Pharmacy", "desc": "Prescription multivitamins & health essentials", "amt_range": (450, 1850), "methods": ["UPI", "Cash"]},
    {"cat": "Personal Expenses", "sub": "Personal care", "mer": "Enrich Salon", "desc": "Grooming & haircut package", "amt_range": (500, 1500), "methods": ["UPI", "Google Pay"]},

    # Donations & Charity
    {"cat": "Donations & Charity", "sub": "Temple donations", "mer": "Sri Venkateswara Temple", "desc": "Special sewa offering and puja", "amt_range": (1001, 5001), "methods": ["UPI", "Bank Transfer"], "is_don": True, "don_cat": "Temple donations", "purpose": "Temple renovation & archana"},
    {"cat": "Donations & Charity", "sub": "Annadanam", "mer": "ISKCON Food for Life", "desc": "Sponsor meal distribution for 50 people", "amt_range": (2500, 5000), "methods": ["UPI", "Google Pay"], "is_don": True, "don_cat": "Annadanam", "purpose": "Free meal drive"},
    {"cat": "Donations & Charity", "sub": "Education support", "mer": "Vidyaranya Child Care Trust", "desc": "School books & stationary for underprivileged students", "amt_range": (2000, 6000), "methods": ["Bank Transfer", "Credit Card"], "is_don": True, "don_cat": "Education support", "purpose": "Children schooling sponsorship"},
]

@router.post("/generate")
def generate_sample_data(db: Session = Depends(get_db)):
    # Create categories lookup
    categories = {c.name: c for c in db.query(Category).all()}
    
    # Generate transactions across the last 6 months up to today
    today = date.today()
    created_txs = []

    # 1. Generate regular monthly salary and freelancing
    for month_offset in range(6, -1, -1):
        m_date = today - timedelta(days=month_offset * 30)
        # Salary on 1st of each month
        salary_date = date(m_date.year, m_date.month, 1)
        inc_cat = categories.get("Income")

        salary_tx = Transaction(
            type="income",
            date=salary_date,
            category_id=inc_cat.id if inc_cat else None,
            category_name="Income",
            subcategory_name="Salary",
            amount=95000.0,
            payment_method="Bank Transfer",
            merchant="Tech Solutions India Pvt Ltd",
            description="Monthly Net Salary Credit",
            account="HDFC Salary Account"
        )
        created_txs.append(salary_tx)

        # Occasional freelance or dividend
        if month_offset % 2 == 0:
            freelance_date = date(m_date.year, m_date.month, 15)
            created_txs.append(Transaction(
                type="income",
                date=freelance_date,
                category_id=inc_cat.id if inc_cat else None,
                category_name="Income",
                subcategory_name="Freelancing",
                amount=float(random.choice([15000, 22000, 30000])),
                payment_method="UPI",
                merchant="Global Web Client",
                description="Freelance Frontend Consulting",
                account="ICICI Account"
            ))

        # Rent payment every month on 3rd
        rent_date = date(m_date.year, m_date.month, 3)
        bills_cat = categories.get("Bills & Utilities")
        created_txs.append(Transaction(
            type="expense",
            date=rent_date,
            category_id=bills_cat.id if bills_cat else None,
            category_name="Bills & Utilities",
            subcategory_name="Rent",
            amount=25000.0,
            payment_method="Bank Transfer",
            merchant="Rajesh Sharma (Landlord)",
            description="Monthly House Rent"
        ))

    # 2. Generate varied daily & weekly transactions over the last 150 days
    start_date = today - timedelta(days=150)
    curr_date = start_date

    while curr_date <= today:
        # 1-3 transactions per day
        num_tx = random.choice([1, 2, 2, 3])
        for _ in range(num_tx):
            sample = random.choice(SAMPLE_EXPENSES)
            cat = categories.get(sample["cat"])
            amt = float(random.randint(sample["amt_range"][0], sample["amt_range"][1]))
            method = random.choice(sample["methods"])
            
            is_don = sample.get("is_don", False)
            don_cat = sample.get("don_cat")
            purpose = sample.get("purpose")

            tx = Transaction(
                type="expense",
                date=curr_date,
                category_id=cat.id if cat else None,
                category_name=sample["cat"],
                subcategory_name=sample["sub"],
                amount=amt,
                payment_method=method,
                merchant=sample["mer"],
                description=sample["desc"],
                is_donation=is_don,
                donation_category=don_cat,
                donation_purpose=purpose
            )
            created_txs.append(tx)

        curr_date += timedelta(days=1)

    db.add_all(created_txs)

    # 3. Add default monthly budgets for current month
    curr_month_str = today.strftime("%Y-%m")
    default_budgets = [
        {"cat_name": None, "amt": 65000.0},  # Overall monthly budget
        {"cat_name": "Food & Dining", "amt": 12000.0},
        {"cat_name": "Groceries & Household", "amt": 10000.0},
        {"cat_name": "Shopping", "amt": 8000.0},
        {"cat_name": "Travel & Transportation", "amt": 7000.0},
        {"cat_name": "Bills & Utilities", "amt": 32000.0},
        {"cat_name": "Donations & Charity", "amt": 6000.0},
    ]

    for b in default_budgets:
        cat_id = None
        if b["cat_name"]:
            cat = categories.get(b["cat_name"])
            if cat:
                cat_id = cat.id

        existing = db.query(Budget).filter(Budget.month == curr_month_str, Budget.category_id == cat_id).first()
        if not existing:
            db.add(Budget(
                month=curr_month_str,
                category_id=cat_id,
                category_name=b["cat_name"] or "Overall Monthly Budget",
                amount=b["amt"]
            ))

    db.commit()
    return {"message": f"Successfully created {len(created_txs)} sample transactions and monthly budgets.", "count": len(created_txs)}

@router.delete("/remove")
def remove_sample_data(db: Session = Depends(get_db)):
    db.query(Transaction).delete()
    db.query(Budget).delete()
    db.commit()
    return {"message": "All sample transactions and budgets removed."}
