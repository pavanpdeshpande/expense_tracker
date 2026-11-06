from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base, SessionLocal
from app.services.seed import seed_defaults
from app.routers import (
    transactions,
    categories,
    dashboard,
    budgets,
    savings,
    donations,
    recurring,
    reports,
    export_import,
    backup,
    sample_data
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables
    Base.metadata.create_all(bind=engine)
    # Seed default categories & subcategories
    db = SessionLocal()
    try:
        seed_defaults(db)
    finally:
        db.close()
    yield

app = FastAPI(
    title="Personal Expense Tracker API",
    description="Local Finance Management System REST API",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for localhost:3000 and any local frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(dashboard.router)
app.include_router(transactions.router)
app.include_router(categories.router)
app.include_router(budgets.router)
app.include_router(savings.router)
app.include_router(donations.router)
app.include_router(recurring.router)
app.include_router(reports.router)
app.include_router(export_import.router)
app.include_router(backup.router)
app.include_router(sample_data.router)

@app.get("/")
def root():
    return {
        "app": "Personal Expense Tracker API",
        "status": "online",
        "docs_url": "/docs",
        "currency": "INR (₹)"
    }

@app.get("/api/health")
def health_check():
    return {"status": "ok"}
