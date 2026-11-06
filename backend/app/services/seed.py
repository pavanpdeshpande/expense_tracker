from sqlalchemy.orm import Session
from app.models import Category, Subcategory

DEFAULT_CATEGORIES = [
    {
        "name": "Personal Expenses",
        "type": "expense",
        "icon": "User",
        "color": "#8B5CF6",
        "subcategories": [
            "Personal care", "Clothing", "Mobile recharge", "Internet", 
            "Medical", "Entertainment", "Subscriptions", 
            "Household miscellaneous", "Other personal expenses"
        ]
    },
    {
        "name": "Food & Dining",
        "type": "expense",
        "icon": "Utensils",
        "color": "#F59E0B",
        "subcategories": [
            "Restaurants", "Hotels", "Swiggy", "Zomato", 
            "Groceries-related food", "Tea / Coffee", "Snacks", 
            "Outside food", "Other food expenses"
        ]
    },
    {
        "name": "Travel & Transportation",
        "type": "expense",
        "icon": "Car",
        "color": "#3B82F6",
        "subcategories": [
            "Petrol / Diesel", "Vehicle maintenance", "Bike expenses", "Car expenses",
            "Bus", "Train", "Flight", "Cab / Uber / Ola", "Parking", "Toll",
            "Hotel accommodation", "Other travel expenses"
        ]
    },
    {
        "name": "Shopping",
        "type": "expense",
        "icon": "ShoppingBag",
        "color": "#EC4899",
        "subcategories": [
            "Electronics", "Clothing", "Footwear", "Home appliances",
            "Furniture", "Online shopping", "Amazon", "Flipkart",
            "Accessories", "Other shopping"
        ]
    },
    {
        "name": "Groceries & Household",
        "type": "expense",
        "icon": "ShoppingCart",
        "color": "#10B981",
        "subcategories": [
            "Vegetables", "Fruits", "Rice / Wheat / Grains", "Milk & Dairy",
            "Cooking oil", "Household essentials", "Cleaning products",
            "Kitchen supplies", "Monthly groceries", "Other groceries"
        ]
    },
    {
        "name": "Donations & Charity",
        "type": "expense",
        "icon": "HeartHandshake",
        "color": "#F97316",
        "subcategories": [
            "Temple donations", "Religious activities", "Charity", "Annadanam",
            "Education support", "Medical support", "NGO", "Other donations"
        ]
    },
    {
        "name": "Bills & Utilities",
        "type": "expense",
        "icon": "Receipt",
        "color": "#6366F1",
        "subcategories": [
            "Electricity", "Water", "Gas", "Internet", "Mobile bills",
            "Rent", "Maintenance", "Insurance", "Loan EMI", "Other recurring bills"
        ]
    },
    {
        "name": "Income",
        "type": "income",
        "icon": "TrendingUp",
        "color": "#16A34A",
        "subcategories": [
            "Salary", "Bonus", "Freelancing", "Interest",
            "Dividends", "Rental income", "Other income"
        ]
    }
]

def seed_defaults(db: Session):
    for cat_data in DEFAULT_CATEGORIES:
        category = db.query(Category).filter(Category.name == cat_data["name"]).first()
        if not category:
            category = Category(
                name=cat_data["name"],
                type=cat_data["type"],
                icon=cat_data["icon"],
                color=cat_data["color"],
                is_system=True
            )
            db.add(category)
            db.flush()

        # Add subcategories if missing
        existing_subcats = {s.name for s in category.subcategories}
        for sub_name in cat_data["subcategories"]:
            if sub_name not in existing_subcats:
                subcat = Subcategory(
                    category_id=category.id,
                    name=sub_name,
                    is_system=True
                )
                db.add(subcat)
    db.commit()
