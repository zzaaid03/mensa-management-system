from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import models, schemas
from app.dependencies import get_db

router = APIRouter()


@router.get("", response_model=List[schemas.MealResponse])
def list_meals(
    category: Optional[str] = None,
    available_only: bool = False,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """
    List all meals. **No authentication required.**

    **FRONTEND query parameters:**
    - `search` — filter by meal name (case-insensitive partial match)
    - `category` — filter by category: `main`, `side`, `drink`, `dessert`
    - `available_only=true` — hide meals currently marked as unavailable

    Example: `GET /meals?search=chicken&category=main&available_only=true`
    """
    query = db.query(models.Meal)
    if search:
        query = query.filter(models.Meal.name.ilike(f"%{search}%"))
    if category:
        query = query.filter(models.Meal.category == category)
    if available_only:
        query = query.filter(models.Meal.is_available == True)
    return query.order_by(models.Meal.category, models.Meal.name).all()


@router.get("/{meal_id}", response_model=schemas.MealResponse)
def get_meal(meal_id: int, db: Session = Depends(get_db)):
    """Get a single meal with full nutrition details. **No authentication required.**"""
    meal = db.query(models.Meal).filter(models.Meal.id == meal_id).first()
    if not meal:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Meal not found")
    return meal
