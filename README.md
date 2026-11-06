<<<<<<< HEAD
# FinTrack &bull; Personal Expense Tracker & Local Finance Management System

A modern, high-performance, private **Personal Expense Tracker Web Application** engineered to run 100% locally on your computer via `localhost`.

No cloud databases, no external paid APIs, no tracking, and no internet connection required after initial installation. All data is securely stored on your local disk in a high-speed SQLite database with WAL (Write-Ahead Logging) mode.

---

## 1. Key Highlights & Features

- **Financial Dashboard with 6 Summary KPI Cards**:
  - Total Income
  - Total Expenses
  - Current Balance
  - Monthly Savings
  - Total Donations
  - Average Daily Spending
  - *Each card displays the current month amount, comparison with previous month, percentage increase/decrease, and visual trend indicators.*

- **8 Interactive Data Visualizations**:
  1. **Monthly Income vs Expense**: Dual-bar chart comparing 12-month financial trajectories.
  2. **Expense Distribution**: Donut / Pie chart with category percentages and tooltips.
  3. **Daily Spending Trend**: Monotone line chart showing daily spending progression.
  4. **Category-wise Expenses**: Horizontal ranked bar chart from highest to lowest outflow.
  5. **Monthly Savings Trend**: Gradient area chart displaying net savings accumulation and savings rate.
  6. **Yearly Expense Comparison**: Multi-year historical comparison.
  7. **Top 5 Spending Categories**: Progress-meter cards with transaction counts and percentages.
  8. **Budget vs Actual Spending**: Visual threshold meters with automatic warnings (>=80%) and alert badges (>100%).

- **Dedicated Navigation Tabs**:
  1. **Dashboard**: Complete financial overview, interactive charts, real-time KPI cards, and recent transactions.
  2. **Personal Expenses**: Clothing, mobile recharge, personal care, medical, internet, entertainment, subscriptions, and miscellaneous.
  3. **Food & Dining**: Restaurants, hotels, Swiggy, Zomato, groceries-related food, tea/coffee, snacks, and outside food.
  4. **Travel & Transportation**: Petrol/diesel, vehicle maintenance, bike/car expenses, bus, train, flights, cab/Uber/Ola, parking, toll, and hotels.
  5. **Shopping**: Electronics, clothing, footwear, home appliances, furniture, online shopping, Amazon, Flipkart, accessories.
  6. **Groceries & Household**: Vegetables, fruits, rice/wheat/grains, milk & dairy, cooking oil, household essentials, cleaning products, and kitchen supplies.
  7. **Donations & Charity**: Dedicated giving tracker with donation date, temple/organization name, category (Temple, Religious, Charity, Annadanam, Education, Medical, NGO), amount, purpose, and notes.
  8. **Bills & Utilities**: Electricity, water, gas, internet, mobile bills, rent, maintenance, insurance, loan EMI, and recurring bills.
  9. **Income Sources**: Salary, bonus, freelancing, interest, dividends, rental income, and other income with source accounts.
  10. **Reports & Analytics**: Multi-dimensional monthly, annual, merchant-wise, payment method, MoM, and YoY analytical reports.
  11. **Budget Management**: Set overall monthly limits and granular category budgets with real-time utilization progress bars.
  12. **Savings & Overview**: Track monthly savings, savings rate `(Savings/Income)*100`, income/expense growth, and highest/lowest spending months.
  13. **Transaction History**: Full audit table with instant search, category/subcategory/method/type filters, column sorting, pagination, and deletion.
  14. **Calendar View**: Day-by-day interactive calendar with expenditure density and transaction drill-down modal.
  15. **Recurring Bills**: Automatic scheduler rules for recurring monthly bills and subscriptions.
  16. **Settings & Data Backup**: Full SQLite binary backup download, restore from backup, reset database, sample data generator, and custom category management.

- **Smart Features Built-In**:
  - **Duplicate Transaction Detection**: Warns in real-time when adding a transaction with identical amount, date, and description.
  - **Automated Spike & Anomaly Insights**: Alerts when spending in a category or month surges by more than 25%.
  - **Multi-Format Export & Bulk Import**: Export to CSV, Excel (`.xlsx`), and PDF. Bulk import historical transactions from CSV or Excel.
  - **Light & Dark Mode**: Seamless toggle with persistent preference and custom scrollbars.
  - **Indian Rupee (₹) Default**: Native formatting with `en-IN` numbering throughout.

---

## 2. Technology Stack & Architecture

- **Frontend**: React 18+ (Vite), Tailwind CSS v4, Lucide React, Recharts, Axios, jsPDF
  - *URL*: `http://localhost:3000`
- **Backend**: Python 3.10+ FastAPI, Uvicorn, SQLAlchemy 2.0, Pydantic v2, Pandas, OpenPyXL, ReportLab
  - *URL*: `http://localhost:8000`
  - *Interactive Swagger API Docs*: `http://localhost:8000/docs`
- **Database**: Local SQLite 3 (`backend/data/expense_tracker.db`) with Write-Ahead Logging (WAL) and foreign key constraints enabled.

```
F:\PersonalExpenseTracker/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app, CORS, routes & lifespan
│   │   ├── database.py          # SQLite engine, session & WAL pragma
│   │   ├── models.py            # Normalized SQLAlchemy models
│   │   ├── schemas.py           # Pydantic validation schemas
│   │   ├── routers/             # API endpoints (transactions, dashboard, budgets, etc.)
│   │   └── services/            # Analytics, seeding & import services
│   ├── data/
│   │   └── expense_tracker.db   # Local persistent database
│   ├── requirements.txt         # Python dependencies
│   ├── run_backend.py           # Python launch runner
│   └── venv/                    # Isolated virtual environment
├── frontend/
│   ├── src/
│   │   ├── api/client.js        # Axios API client
│   │   ├── components/          # Reusable UI & Chart components
│   │   ├── context/             # Finance & Theme state providers
│   │   ├── App.jsx              # Main tab routing & application shell
│   │   └── index.css            # Tailwind CSS v4 design system
│   ├── package.json             # NPM dependencies
│   └── vite.config.js           # Vite configuration & proxy (Port 3000 -> 8000)
├── setup.bat                    # One-click environment setup script
├── start.bat                    # One-click dual server launcher & browser opener
├── stop.bat                     # Clean shutdown script
├── requirements.txt             # Root requirements file
└── README.md                    # Documentation
```

---

## 3. Quick Start (Windows)

### Option A: One-Click Startup (Recommended)

1. **First-time Setup**:
   Double-click `setup.bat`. This automatically:
   - Verifies Python and Node.js
   - Creates the Python virtual environment in `backend\venv`
   - Installs all Python dependencies
   - Initializes the SQLite database and seeds default categories
   - Runs `npm install` for frontend packages

2. **Launch Application**:
   Double-click `start.bat`.
   - Starts the FastAPI backend on port `8000`
   - Starts the React frontend on port `3000`
   - Automatically opens `http://localhost:3000` in your default browser

3. **Stop Application**:
   Double-click `stop.bat` to gracefully terminate both local servers.

---

### Option B: Manual Terminal Launch

If you prefer launching via command prompt or PowerShell:

**1. Backend:**
```powershell
cd F:\PersonalExpenseTracker\backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
python run_backend.py
```
*Backend will be running at `http://localhost:8000`.*

**2. Frontend:**
```powershell
cd F:\PersonalExpenseTracker\frontend
npm install
npm run dev
```
*Frontend will be running at `http://localhost:3000`.*

---

## 4. Usage Guide

### 1. Adding a Transaction
- Click the green **"+ Add Transaction"** button in the top navigation bar from any screen.
- Select **Expense** or **Income**.
- Pick a date, choose the main category (subcategories will auto-populate automatically).
- Enter the amount in ₹, description, payment method, and merchant.
- If you select *Donations & Charity*, donation-specific fields (Organization, Purpose, Donation Category) will appear.
- If a similar transaction already exists on that date, an instant **duplicate detection alert** is shown.

### 2. Time-Period Filters
Use the header dropdown to filter the dashboard and transaction views:
- **Today**, **This Week**, **This Month**, **Last Month**, **Last 3 Months**, **Last 6 Months**, **This Year**, or **Custom Range**.
- All 8 charts and summary cards update instantly upon selection.

### 3. Setting Monthly Budgets
- Navigate to the **Budget Management** tab.
- Set an **Overall Monthly Budget** or define budgets for specific categories (e.g., Food & Dining, Shopping, Groceries).
- Visual progress bars indicate spending utilization.
- Automatic yellow warnings appear at **80%** and red alert badges appear when spending exceeds **100%**.

### 4. Demo Data Generator & Reset
- Go to the **Settings & Backup** tab.
- Click **Generate Demo Data** to populate 6 months of realistic sample Indian Rupee transactions, bills, and budgets.
- Click **Remove Demo Data** or **Clear Ledger Data** whenever you want a completely fresh start.

### 5. Backup & Restore
- In **Settings & Backup**, click **Download SQLite Backup (.db)** to save a snapshot of your entire database.
- To restore from an earlier backup, upload your `.db` file in the restore card. A safety copy of your existing database is automatically preserved prior to restoration.

---

## 5. Privacy & Offline Operation

- **Zero External Telemetry**: No user analytics or tracking code.
- **Offline First**: All calculations, anomaly detection, chart aggregations, and PDF exports run strictly on your local machine using Python FastAPI and React.
- **Persistent Local SQLite**: All records survive system restarts and power cycles.
=======
# expense_tracker
A modern, locally hosted Personal Expense Tracker built with React, Python FastAPI, and SQLite. Features interactive financial dashboards, expense categorization, income and donation tracking, budget management, spending analytics, reports, and data backup. Designed for secure, offline-first personal finance management in INR.
>>>>>>> c2297f98236863fb3c7d94e15a33484d1fd376bf
