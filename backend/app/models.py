from datetime import datetime, date
from sqlalchemy import Column, Integer, String, Float, Boolean, Date, DateTime, ForeignKey, Index, Text
from sqlalchemy.orm import relationship
from app.database import Base

class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False, index=True)
    type = Column(String(20), nullable=False, default="expense")  # 'expense' or 'income'
    icon = Column(String(50), default="Folder")
    color = Column(String(30), default="#6366F1")
    is_system = Column(Boolean, default=True)

    subcategories = relationship("Subcategory", back_populates="category", cascade="all, delete-orphan")
    transactions = relationship("Transaction", back_populates="category_rel")
    budgets = relationship("Budget", back_populates="category_rel")

class Subcategory(Base):
    __tablename__ = "subcategories"

    id = Column(Integer, primary_key=True, index=True)
    category_id = Column(Integer, ForeignKey("categories.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(100), nullable=False)
    is_system = Column(Boolean, default=True)

    category = relationship("Category", back_populates="subcategories")
    transactions = relationship("Transaction", back_populates="subcategory_rel")

    __table_args__ = (
        Index("idx_category_subcategory_name", "category_id", "name", unique=True),
    )

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    type = Column(String(20), nullable=False, default="expense", index=True)  # 'expense' or 'income'
    date = Column(Date, nullable=False, default=date.today, index=True)
    category_id = Column(Integer, ForeignKey("categories.id", ondelete="SET NULL"), nullable=True, index=True)
    subcategory_id = Column(Integer, ForeignKey("subcategories.id", ondelete="SET NULL"), nullable=True, index=True)
    category_name = Column(String(100), nullable=False)
    subcategory_name = Column(String(100), nullable=True)
    amount = Column(Float, nullable=False)
    payment_method = Column(String(50), nullable=False, default="Cash", index=True)
    merchant = Column(String(200), nullable=True, index=True)  # Merchant / Paid to / Source
    description = Column(String(255), nullable=False)
    notes = Column(Text, nullable=True)
    
    # Donations specific fields
    is_donation = Column(Boolean, default=False, index=True)
    donation_category = Column(String(100), nullable=True)  # e.g., 'Temple donations', 'Annadanam', etc.
    donation_purpose = Column(String(255), nullable=True)
    
    # Income/Account specific fields
    account = Column(String(100), nullable=True)  # e.g. 'HDFC Bank', 'SBI', 'Cash Wallet'
    
    is_recurring = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    category_rel = relationship("Category", back_populates="transactions")
    subcategory_rel = relationship("Subcategory", back_populates="transactions")

    __table_args__ = (
        Index("idx_tx_date_type", "date", "type"),
        Index("idx_tx_category_date", "category_name", "date"),
    )

class Budget(Base):
    __tablename__ = "budgets"

    id = Column(Integer, primary_key=True, index=True)
    month = Column(String(7), nullable=False, index=True)  # YYYY-MM
    category_id = Column(Integer, ForeignKey("categories.id", ondelete="CASCADE"), nullable=True, index=True)
    category_name = Column(String(100), nullable=True)  # null = overall monthly budget
    amount = Column(Float, nullable=False)

    category_rel = relationship("Category", back_populates="budgets")

    __table_args__ = (
        Index("idx_budget_month_cat", "month", "category_id", unique=True),
    )

class RecurringTransaction(Base):
    __tablename__ = "recurring_transactions"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    type = Column(String(20), nullable=False, default="expense")
    amount = Column(Float, nullable=False)
    category_id = Column(Integer, nullable=True)
    category_name = Column(String(100), nullable=False)
    subcategory_id = Column(Integer, nullable=True)
    subcategory_name = Column(String(100), nullable=True)
    payment_method = Column(String(50), nullable=False, default="UPI")
    merchant = Column(String(200), nullable=True)
    frequency = Column(String(20), nullable=False, default="monthly")  # 'monthly', 'weekly', 'yearly'
    day_of_month = Column(Integer, default=1)
    start_date = Column(Date, default=date.today)
    end_date = Column(Date, nullable=True)
    is_active = Column(Boolean, default=True)
    last_processed = Column(Date, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Setting(Base):
    __tablename__ = "settings"

    key = Column(String(100), primary_key=True, index=True)
    value = Column(Text, nullable=False)
