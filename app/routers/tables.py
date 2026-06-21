from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app import models, schemas
from app.dependencies import get_db

router = APIRouter()


@router.get("", response_model=List[schemas.TableResponse])
def list_tables(db: Session = Depends(get_db)):
    """List all tables. **No authentication required.**"""
    return db.query(models.Table).order_by(models.Table.table_number).all()


@router.get("/available", response_model=List[schemas.TableResponse])
def list_available_tables(db: Session = Depends(get_db)):
    """
    List only tables currently marked as available.
    **No authentication required.**

    Use this endpoint to populate the table picker in the reservation form.
    """
    return (
        db.query(models.Table)
        .filter(models.Table.is_available == True)
        .order_by(models.Table.table_number)
        .all()
    )
