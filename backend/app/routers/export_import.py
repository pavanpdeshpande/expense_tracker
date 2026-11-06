import io
from datetime import date, datetime
from typing import Optional
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
import pandas as pd
from reportlab.lib.pagesizes import letter, A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

from app.database import get_db
from app.models import Transaction, Category, Subcategory

router = APIRouter(prefix="/api/data", tags=["Import & Export"])

@router.get("/export/csv")
def export_transactions_csv(
    type: Optional[str] = None,
    category_name: Optional[str] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Transaction)
    if type and type != "all":
        query = query.filter(Transaction.type == type)
    if category_name and category_name != "all":
        query = query.filter(Transaction.category_name == category_name)
    if start_date:
        query = query.filter(Transaction.date >= start_date)
    if end_date:
        query = query.filter(Transaction.date <= end_date)

    txs = query.order_by(Transaction.date.desc()).all()

    data = [
        {
            "ID": t.id,
            "Date": t.date.isoformat(),
            "Type": t.type.capitalize(),
            "Category": t.category_name,
            "Subcategory": t.subcategory_name or "",
            "Amount (INR)": t.amount,
            "Payment Method": t.payment_method,
            "Merchant / Paid To": t.merchant or "",
            "Description": t.description,
            "Notes": t.notes or "",
            "Is Donation": "Yes" if t.is_donation else "No",
            "Donation Category": t.donation_category or "",
            "Account": t.account or ""
        }
        for t in txs
    ]

    df = pd.DataFrame(data)
    stream = io.StringIO()
    df.to_csv(stream, index=False)
    
    response = StreamingResponse(
        iter([stream.getvalue()]),
        media_type="text/csv"
    )
    filename = f"transactions_{date.today().isoformat()}.csv"
    response.headers["Content-Disposition"] = f"attachment; filename={filename}"
    return response

@router.get("/export/excel")
def export_transactions_excel(
    type: Optional[str] = None,
    category_name: Optional[str] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Transaction)
    if type and type != "all":
        query = query.filter(Transaction.type == type)
    if category_name and category_name != "all":
        query = query.filter(Transaction.category_name == category_name)
    if start_date:
        query = query.filter(Transaction.date >= start_date)
    if end_date:
        query = query.filter(Transaction.date <= end_date)

    txs = query.order_by(Transaction.date.desc()).all()

    data = [
        {
            "ID": t.id,
            "Date": t.date.isoformat(),
            "Type": t.type.capitalize(),
            "Category": t.category_name,
            "Subcategory": t.subcategory_name or "",
            "Amount (₹)": t.amount,
            "Payment Method": t.payment_method,
            "Merchant / Paid To": t.merchant or "",
            "Description": t.description,
            "Notes": t.notes or "",
            "Is Donation": "Yes" if t.is_donation else "No",
            "Donation Category": t.donation_category or "",
            "Account": t.account or ""
        }
        for t in txs
    ]

    df = pd.DataFrame(data)
    output = io.BytesIO()
    with pd.ExcelWriter(output, engine="openpyxl") as writer:
        df.to_excel(writer, index=False, sheet_name="Transactions")

    output.seek(0)
    filename = f"transactions_{date.today().isoformat()}.xlsx"
    response = StreamingResponse(
        output,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )
    response.headers["Content-Disposition"] = f"attachment; filename={filename}"
    return response

@router.get("/export/pdf")
def export_transactions_pdf(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Transaction)
    if start_date:
        query = query.filter(Transaction.date >= start_date)
    if end_date:
        query = query.filter(Transaction.date <= end_date)

    txs = query.order_by(Transaction.date.desc()).limit(100).all()

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=30, leftMargin=30, topMargin=30, bottomMargin=30)
    styles = getSampleStyleSheet()
    story = []

    title_style = ParagraphStyle(
        'ReportTitle',
        parent=styles['Heading1'],
        fontSize=18,
        textColor=colors.HexColor('#1E293B'),
        spaceAfter=14
    )
    subtitle_style = ParagraphStyle(
        'ReportSubtitle',
        parent=styles['Normal'],
        fontSize=10,
        textColor=colors.HexColor('#64748B'),
        spaceAfter=14
    )

    story.append(Paragraph("Personal Expense Tracker - Financial Statement", title_style))
    range_str = f"Date Filter: {start_date.isoformat() if start_date else 'Start'} to {end_date.isoformat() if end_date else 'Present'}"
    story.append(Paragraph(f"Generated on {date.today().strftime('%d %B %Y')} | {range_str}", subtitle_style))
    story.append(Spacer(1, 10))

    # Table data
    table_data = [["Date", "Type", "Category", "Description", "Method", "Amount (Rs.)"]]
    total_income = 0.0
    total_expense = 0.0

    for t in txs:
        if t.type == "income":
            total_income += t.amount
        else:
            total_expense += t.amount

        table_data.append([
            t.date.strftime("%d/%m/%Y"),
            t.type.capitalize(),
            t.category_name[:18],
            (t.description[:22] + "...") if len(t.description) > 22 else t.description,
            t.payment_method[:12],
            f"{t.amount:,.2f}"
        ])

    table = Table(table_data, colWidths=[65, 55, 110, 150, 75, 80])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#F1F5F9')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.HexColor('#0F172A')),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('ALIGN', (-1, 0), (-1, -1), 'RIGHT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E2E8F0')),
    ]))
    story.append(table)

    summary_text = f"<br/><br/><b>Summary:</b> Total Income: Rs. {total_income:,.2f} | Total Expenses: Rs. {total_expense:,.2f} | Net Balance: Rs. {(total_income - total_expense):,.2f}"
    story.append(Paragraph(summary_text, styles['Normal']))

    doc.build(story)
    buffer.seek(0)
    filename = f"financial_statement_{date.today().isoformat()}.pdf"
    response = StreamingResponse(buffer, media_type="application/pdf")
    response.headers["Content-Disposition"] = f"attachment; filename={filename}"
    return response

@router.post("/import")
async def import_transactions(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    contents = await file.read()
    filename = file.filename.lower()

    try:
        if filename.endswith(".csv"):
            df = pd.read_csv(io.BytesIO(contents))
        elif filename.endswith(".xlsx") or filename.endswith(".xls"):
            df = pd.read_excel(io.BytesIO(contents))
        else:
            raise HTTPException(status_code=400, detail="Unsupported file format. Please upload a CSV or Excel file.")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to read file: {str(e)}")

    # Column mapping normalization (case-insensitive)
    cols = {col.strip().lower().replace(" ", "_").replace("(", "").replace(")", "").replace("₹", "").replace("inr", ""): col for col in df.columns}

    # Find required columns
    def find_col(candidates):
        for c in candidates:
            for k in cols:
                if c in k:
                    return cols[k]
        return None

    date_col = find_col(["date", "trans_date", "tx_date"])
    type_col = find_col(["type", "tx_type"])
    amount_col = find_col(["amount", "amt", "cost"])
    desc_col = find_col(["desc", "narration", "particulars", "title", "description"])
    cat_col = find_col(["category", "cat"])
    subcat_col = find_col(["subcategory", "sub_cat", "sub_category"])
    method_col = find_col(["payment_method", "payment", "method", "mode"])
    merchant_col = find_col(["merchant", "payee", "paid_to", "source"])
    notes_col = find_col(["notes", "remark", "remarks", "comment"])

    if not date_col or not amount_col:
        raise HTTPException(
            status_code=400,
            detail="Mandatory columns missing: File must contain 'Date' and 'Amount' columns."
        )

    imported_count = 0
    errors = []

    for index, row in df.iterrows():
        try:
            # Parse Date
            raw_date = row[date_col]
            if pd.isna(raw_date):
                continue
            if isinstance(raw_date, (datetime, date)):
                tx_date = raw_date if isinstance(raw_date, date) else raw_date.date()
            else:
                parsed_dt = pd.to_datetime(raw_date, errors="coerce")
                if pd.isna(parsed_dt):
                    continue
                tx_date = parsed_dt.date()

            # Parse Amount
            raw_amt = row[amount_col]
            if pd.isna(raw_amt):
                continue
            amt = float(str(raw_amt).replace(",", "").replace("₹", "").strip())
            if amt <= 0:
                continue

            # Parse Type
            raw_type = str(row[type_col]).lower().strip() if type_col and not pd.isna(row[type_col]) else "expense"
            tx_type = "income" if "inc" in raw_type or "credit" in raw_type else "expense"

            # Parse Category
            cat_name = str(row[cat_col]).strip() if cat_col and not pd.isna(row[cat_col]) else ("Income" if tx_type == "income" else "Personal Expenses")
            subcat_name = str(row[subcat_col]).strip() if subcat_col and not pd.isna(row[subcat_col]) else None
            method = str(row[method_col]).strip() if method_col and not pd.isna(row[method_col]) else "Cash"
            desc = str(row[desc_col]).strip() if desc_col and not pd.isna(row[desc_col]) else (f"{cat_name} expense" if tx_type == "expense" else "Income entry")
            merchant = str(row[merchant_col]).strip() if merchant_col and not pd.isna(row[merchant_col]) else None
            notes = str(row[notes_col]).strip() if notes_col and not pd.isna(row[notes_col]) else None

            # Find or link category
            category = db.query(Category).filter(Category.name.ilike(cat_name)).first()
            if not category:
                category = Category(name=cat_name, type=tx_type, icon="Folder", is_system=False)
                db.add(category)
                db.flush()

            subcat_id = None
            if subcat_name:
                subcat = db.query(Subcategory).filter(
                    Subcategory.category_id == category.id,
                    Subcategory.name.ilike(subcat_name)
                ).first()
                if not subcat:
                    subcat = Subcategory(category_id=category.id, name=subcat_name, is_system=False)
                    db.add(subcat)
                    db.flush()
                subcat_id = subcat.id

            is_donation = cat_name.lower() == "donations & charity"

            tx = Transaction(
                type=tx_type,
                date=tx_date,
                category_id=category.id,
                subcategory_id=subcat_id,
                category_name=category.name,
                subcategory_name=subcat_name,
                amount=round(amt, 2),
                payment_method=method,
                merchant=merchant,
                description=desc,
                notes=notes,
                is_donation=is_donation
            )
            db.add(tx)
            imported_count += 1

        except Exception as ex:
            errors.append(f"Row {index + 1}: {str(ex)}")

    db.commit()
    return {
        "success": True,
        "imported_count": imported_count,
        "errors": errors[:5]
    }
