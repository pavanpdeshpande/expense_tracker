from datetime import date, datetime
from typing import List, Optional, Any, Dict
from pydantic import BaseModel, Field, field_validator

# --- Subcategories ---
class SubcategoryBase(BaseModel):
    name: str

class SubcategoryCreate(SubcategoryBase):
    category_id: int

class SubcategoryResponse(SubcategoryBase):
    id: int
    category_id: int
    is_system: bool

    class Config:
        from_attributes = True

# --- Categories ---
class CategoryBase(BaseModel):
    name: str
    type: str = "expense"
    icon: Optional[str] = "Folder"
    color: Optional[str] = "#6366F1"

class CategoryCreate(CategoryBase):
    subcategories: Optional[List[str]] = []

class CategoryResponse(CategoryBase):
    id: int
    is_system: bool
    subcategories: List[SubcategoryResponse] = []

    class Config:
        from_attributes = True

# --- Transactions ---
class TransactionBase(BaseModel):
    type: str = "expense"
    date: date
    category_id: Optional[int] = None
    subcategory_id: Optional[int] = None
    category_name: str
    subcategory_name: Optional[str] = None
    amount: float
    payment_method: str = "Cash"
    merchant: Optional[str] = None
    description: str
    notes: Optional[str] = None
    
    # Donations
    is_donation: bool = False
    donation_category: Optional[str] = None
    donation_purpose: Optional[str] = None
    
    # Income/Account
    account: Optional[str] = None
    is_recurring: bool = False

    @field_validator("amount")
    @classmethod
    def amount_must_be_positive(cls, v):
        if v <= 0:
            raise ValueError("Amount must be greater than zero")
        return round(float(v), 2)

class TransactionCreate(TransactionBase):
    pass

class TransactionUpdate(BaseModel):
    type: Optional[str] = None
    date: Optional[date] = None
    category_id: Optional[int] = None
    subcategory_id: Optional[int] = None
    category_name: Optional[str] = None
    subcategory_name: Optional[str] = None
    amount: Optional[float] = None
    payment_method: Optional[str] = None
    merchant: Optional[str] = None
    description: Optional[str] = None
    notes: Optional[str] = None
    is_donation: Optional[bool] = None
    donation_category: Optional[str] = None
    donation_purpose: Optional[str] = None
    account: Optional[str] = None
    is_recurring: Optional[bool] = None

class TransactionResponse(TransactionBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class PaginatedTransactions(BaseModel):
    items: List[TransactionResponse]
    total: int
    page: int
    page_size: int
    total_pages: int
    total_amount: float

# --- Budgets ---
class BudgetCreate(BaseModel):
    month: str  # YYYY-MM
    category_id: Optional[int] = None  # None for overall budget
    amount: float

class BudgetResponse(BaseModel):
    id: int
    month: str
    category_id: Optional[int] = None
    category_name: Optional[str] = "Overall Budget"
    amount: float
    spent: float = 0.0
    remaining: float = 0.0
    percentage: float = 0.0
    status: str = "ok"  # 'ok', 'warning' (>=80%), 'exceeded' (>100%)

    class Config:
        from_attributes = True

# --- Recurring Transactions ---
class RecurringCreate(BaseModel):
    title: str
    type: str = "expense"
    amount: float
    category_id: Optional[int] = None
    category_name: str
    subcategory_id: Optional[int] = None
    subcategory_name: Optional[str] = None
    payment_method: str = "UPI"
    merchant: Optional[str] = None
    frequency: str = "monthly"
    day_of_month: int = 1
    start_date: date
    end_date: Optional[date] = None

class RecurringResponse(RecurringCreate):
    id: int
    is_active: bool
    last_processed: Optional[date] = None
    created_at: datetime

    class Config:
        from_attributes = True

# --- Dashboard & Summaries ---
class SummaryCardData(BaseModel):
    amount: float
    prev_month_amount: float
    change_pct: float
    trend: str  # 'up', 'down', 'neutral'

class DashboardSummaryResponse(BaseModel):
    income: SummaryCardData
    expenses: SummaryCardData
    balance: SummaryCardData
    savings: SummaryCardData
    donations: SummaryCardData
    daily_avg_spend: SummaryCardData
    filter_label: str

class DuplicateCheckRequest(BaseModel):
    date: date
    amount: float
    description: Optional[str] = None
    merchant: Optional[str] = None

class DuplicateCheckResponse(BaseModel):
    is_duplicate: bool
    matches: List[TransactionResponse] = []
