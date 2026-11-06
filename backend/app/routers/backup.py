import os
import shutil
from datetime import datetime
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.database import DB_PATH, DATA_DIR, get_db, engine, Base
from app.models import Transaction, Budget, RecurringTransaction

router = APIRouter(prefix="/api/backup", tags=["Backup & Restore"])

@router.get("/download")
def download_backup():
    if not os.path.exists(DB_PATH):
        raise HTTPException(status_code=404, detail="Database file not found")
    
    # Checkpoint WAL so main DB file is complete
    with engine.connect() as conn:
        conn.exec_driver_sql("PRAGMA wal_checkpoint(TRUNCATE)")

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"expense_tracker_backup_{timestamp}.db"
    return FileResponse(
        path=DB_PATH,
        filename=filename,
        media_type="application/octet-stream"
    )

@router.post("/restore")
async def restore_backup(file: UploadFile = File(...)):
    if not file.filename.endswith(".db"):
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload a .db SQLite file.")

    contents = await file.read()
    if len(contents) < 100:
        raise HTTPException(status_code=400, detail="Corrupted or invalid database file.")

    # Create safe backup of existing database before restoring
    backup_copy_name = f"expense_tracker_pre_restore_{datetime.now().strftime('%Y%m%d_%H%M%S')}.db"
    backup_copy_path = os.path.join(DATA_DIR, backup_copy_name)
    if os.path.exists(DB_PATH):
        try:
            shutil.copy2(DB_PATH, backup_copy_path)
        except Exception:
            pass

    # Dispose existing engine pool connections
    engine.dispose()

    # Overwrite DB file
    try:
        with open(DB_PATH, "wb") as f:
            f.write(contents)
    except Exception as e:
        # Revert from backup copy if write failed
        if os.path.exists(backup_copy_path):
            shutil.copy2(backup_copy_path, DB_PATH)
        raise HTTPException(status_code=500, detail=f"Failed to restore database: {str(e)}")

    return {
        "success": True,
        "message": "Database successfully restored from backup.",
        "pre_restore_backup": backup_copy_name
    }

@router.post("/clear-data")
def clear_all_data(db: Session = Depends(get_db)):
    # Deletes transactions and budgets but preserves categories
    db.query(Transaction).delete()
    db.query(Budget).delete()
    db.query(RecurringTransaction).delete()
    db.commit()
    return {"message": "All transaction and budget data has been cleared successfully."}
