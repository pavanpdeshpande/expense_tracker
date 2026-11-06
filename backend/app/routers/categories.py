from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import Category, Subcategory
from app.schemas import CategoryResponse, CategoryCreate, SubcategoryResponse, SubcategoryCreate

router = APIRouter(prefix="/api/categories", tags=["Categories"])

@router.get("", response_model=List[CategoryResponse])
def get_categories(db: Session = Depends(get_db)):
    categories = db.query(Category).order_by(Category.id).all()
    return categories

@router.post("", response_model=CategoryResponse)
def create_category(payload: CategoryCreate, db: Session = Depends(get_db)):
    existing = db.query(Category).filter(Category.name.ilike(payload.name.strip())).first()
    if existing:
        raise HTTPException(status_code=400, detail="Category already exists")
    
    category = Category(
        name=payload.name.strip(),
        type=payload.type,
        icon=payload.icon or "Folder",
        color=payload.color or "#6366F1",
        is_system=False
    )
    db.add(category)
    db.commit()
    db.refresh(category)

    if payload.subcategories:
        for sub_name in payload.subcategories:
            if sub_name and sub_name.strip():
                subcat = Subcategory(
                    category_id=category.id,
                    name=sub_name.strip(),
                    is_system=False
                )
                db.add(subcat)
        db.commit()
        db.refresh(category)

    return category

@router.post("/{category_id}/subcategories", response_model=SubcategoryResponse)
def add_subcategory(category_id: int, payload: SubcategoryCreate, db: Session = Depends(get_db)):
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    existing = db.query(Subcategory).filter(
        Subcategory.category_id == category_id,
        Subcategory.name.ilike(payload.name.strip())
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Subcategory already exists")
    
    subcat = Subcategory(
        category_id=category_id,
        name=payload.name.strip(),
        is_system=False
    )
    db.add(subcat)
    db.commit()
    db.refresh(subcat)
    return subcat

@router.delete("/{category_id}")
def delete_category(category_id: int, db: Session = Depends(get_db)):
    cat = db.query(Category).filter(Category.id == category_id).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")
    if cat.is_system:
        raise HTTPException(status_code=400, detail="System default categories cannot be deleted")
    
    db.delete(cat)
    db.commit()
    return {"message": "Category deleted successfully"}

@router.delete("/subcategories/{subcategory_id}")
def delete_subcategory(subcategory_id: int, db: Session = Depends(get_db)):
    subcat = db.query(Subcategory).filter(Subcategory.id == subcategory_id).first()
    if not subcat:
        raise HTTPException(status_code=404, detail="Subcategory not found")
    if subcat.is_system:
        raise HTTPException(status_code=400, detail="System default subcategories cannot be deleted")
    
    db.delete(subcat)
    db.commit()
    return {"message": "Subcategory deleted successfully"}
