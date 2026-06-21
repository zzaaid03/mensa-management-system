"""
Admin-only endpoints.
All routes in this router require an authenticated user with role="admin".
The router-level dependency enforces this — no need to add it per endpoint.
"""

from typing import List

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session, selectinload

from app import models, schemas
from app.dependencies import get_db, require_admin
from app.services.macro_calculator import calculate_meal_macros



router = APIRouter(dependencies=[Depends(require_admin)])


# ── Meal Management ───────────────────────────────────────────────────────────

@router.post("/meals", response_model=schemas.MealResponse, status_code=201)
def create_meal(payload: schemas.MealCreate, db: Session = Depends(get_db)):
    """Create a new meal on the menu."""
    meal = models.Meal(**payload.model_dump())
    db.add(meal)
    db.commit()
    db.refresh(meal)
    return meal


@router.put("/meals/{meal_id}", response_model=schemas.MealResponse)
def update_meal(
    meal_id: int, payload: schemas.MealUpdate, db: Session = Depends(get_db)
):
    """
    Update an existing meal. Only fields that are explicitly provided are changed
    (omitted fields keep their current value).
    """
    meal = db.query(models.Meal).filter(models.Meal.id == meal_id).first()
    if not meal:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Meal not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(meal, field, value)

    db.commit()
    db.refresh(meal)
    return meal


@router.delete("/meals/{meal_id}", status_code=204)
def delete_meal(meal_id: int, db: Session = Depends(get_db)):
    """Permanently delete a meal. Returns 204 No Content on success."""
    meal = db.query(models.Meal).filter(models.Meal.id == meal_id).first()
    if not meal:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Meal not found")
    linked = db.query(models.OrderItem).filter(models.OrderItem.meal_id == meal_id).count()
    if linked:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete a meal that is referenced by existing orders",
        )
    db.delete(meal)
    db.commit()
    return Response(status_code=204)


# ── Order Management ──────────────────────────────────────────────────────────

@router.get("/orders", response_model=List[schemas.OrderResponse])
def list_all_orders(db: Session = Depends(get_db)):
    """Retrieve all orders from all students, newest first."""
    return (
        db.query(models.Order)
        .options(
            selectinload(models.Order.items).selectinload(models.OrderItem.meal),
            selectinload(models.Order.user),
        )
        .order_by(models.Order.created_at.desc())
        .all()
    )


@router.patch("/orders/{order_id}/status", response_model=schemas.OrderResponse)
def update_order_status(
    order_id: int,
    payload: schemas.OrderStatusUpdate,
    db: Session = Depends(get_db),
):
    """
    Update the status of any order.

    Valid transitions:
    `pending` → `preparing` → `ready` → `completed`
    Any status → `cancelled`
    """
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")

    order.status = payload.status
    db.commit()

    # Re-query with eager loading after commit
    return (
        db.query(models.Order)
        .options(
            selectinload(models.Order.items).selectinload(models.OrderItem.meal),
            selectinload(models.Order.user),
        )
        .filter(models.Order.id == order_id)
        .first()
    )


# ── Table Management ──────────────────────────────────────────────────────────

@router.post("/tables", response_model=schemas.TableResponse, status_code=201)
def create_table(payload: schemas.TableCreate, db: Session = Depends(get_db)):
    """Create a new table. Table numbers must be unique."""
    existing = (
        db.query(models.Table)
        .filter(models.Table.table_number == payload.table_number)
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Table number {payload.table_number} already exists",
        )
    table = models.Table(**payload.model_dump())
    db.add(table)
    db.commit()
    db.refresh(table)
    return table


@router.put("/tables/{table_id}", response_model=schemas.TableResponse)
def update_table(
    table_id: int, payload: schemas.TableUpdate, db: Session = Depends(get_db)
):
    """Update an existing table. Only provided fields are changed."""
    table = db.query(models.Table).filter(models.Table.id == table_id).first()
    if not table:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Table not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(table, field, value)

    db.commit()
    db.refresh(table)
    return table


@router.delete("/tables/{table_id}", status_code=204)
def delete_table(table_id: int, db: Session = Depends(get_db)):
    """Permanently delete a table. Returns 204 No Content on success."""
    table = db.query(models.Table).filter(models.Table.id == table_id).first()
    if not table:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Table not found")
    linked = db.query(models.Reservation).filter(models.Reservation.table_id == table_id).count()
    if linked:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete a table that has existing reservations",
        )
    db.delete(table)
    db.commit()
    return Response(status_code=204)


# ── Reservation Management ────────────────────────────────────────────────────

@router.get("/reservations", response_model=List[schemas.ReservationResponse])
def list_all_reservations(db: Session = Depends(get_db)):
    """Retrieve all reservations from all students, most recent first."""
    return (
        db.query(models.Reservation)
        .options(
            selectinload(models.Reservation.table),
            selectinload(models.Reservation.user),
        )
        .order_by(models.Reservation.reservation_time.desc())
        .all()
    )


@router.patch("/reservations/{reservation_id}/status", response_model=schemas.ReservationResponse)
def update_reservation_status(
    reservation_id: int,
    payload: schemas.ReservationStatusUpdate,
    db: Session = Depends(get_db),
):
    """
    Update the status of a reservation.
    Valid values: `pending`, `confirmed`, `cancelled`
    """
    reservation = (
        db.query(models.Reservation)
        .filter(models.Reservation.id == reservation_id)
        .first()
    )
    if not reservation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Reservation not found"
        )

    reservation.status = payload.status
    db.commit()

    # Re-query with eager loading after commit
    return (
        db.query(models.Reservation)
        .options(
            selectinload(models.Reservation.table),
            selectinload(models.Reservation.user),
        )
        .filter(models.Reservation.id == reservation_id)
        .first()
    )





@router.post("/ingredients", response_model=schemas.IngredientResponse, status_code=201)
def create_ingredient(payload: schemas.IngredientCreate, db: Session = Depends(get_db)):
    ingredient = models.Ingredient(**payload.model_dump())
    db.add(ingredient)
    db.commit()
    db.refresh(ingredient)
    return ingredient


@router.post("/meals/{meal_id}/ingredients", response_model=schemas.MealIngredientResponse, status_code=201)
def add_ingredient_to_meal(meal_id: int, payload: schemas.MealIngredientCreate, db: Session = Depends(get_db)):
    meal = db.query(models.Meal).filter(models.Meal.id == meal_id).first()
    if not meal:
        raise HTTPException(status_code=404, detail="Meal not found")

    ingredient = db.query(models.Ingredient).filter(models.Ingredient.id == payload.ingredient_id).first()
    if not ingredient:
        raise HTTPException(status_code=404, detail="Ingredient not found")

    link = models.MealIngredient(
        meal_id=meal_id,
        ingredient_id=payload.ingredient_id,
        grams=payload.grams
    )
    db.add(link)
    db.commit()
    db.refresh(link)

    macros = calculate_meal_macros(meal_id, db)
    meal.calories = macros["calories"]
    meal.protein = macros["protein"]
    meal.carbs = macros["carbs"]
    meal.fat = macros["fat"]
    db.commit()

    return (
        db.query(models.MealIngredient)
        .options(selectinload(models.MealIngredient.ingredient))
        .filter(models.MealIngredient.id == link.id)
        .first()
    )



# ── Ingredient Management ─────────────────────────────────────────────────────

@router.get("/ingredients", response_model=List[schemas.IngredientResponse])
def list_ingredients(db: Session = Depends(get_db)):
    return db.query(models.Ingredient).order_by(models.Ingredient.name.asc()).all()


@router.get("/meals/{meal_id}/ingredients", response_model=List[schemas.MealIngredientResponse])
def list_meal_ingredients(meal_id: int, db: Session = Depends(get_db)):
    meal = db.query(models.Meal).filter(models.Meal.id == meal_id).first()
    if not meal:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Meal not found")

    return (
        db.query(models.MealIngredient)
        .options(selectinload(models.MealIngredient.ingredient))
        .filter(models.MealIngredient.meal_id == meal_id)
        .order_by(models.MealIngredient.id.asc())
        .all()
    )


@router.put("/meals/{meal_id}/ingredients/{link_id}", response_model=schemas.MealIngredientResponse)
def update_meal_ingredient(
    meal_id: int,
    link_id: int,
    payload: schemas.MealIngredientUpdate,
    db: Session = Depends(get_db),
):
    meal = db.query(models.Meal).filter(models.Meal.id == meal_id).first()
    if not meal:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Meal not found")

    link = (
        db.query(models.MealIngredient)
        .filter(
            models.MealIngredient.id == link_id,
            models.MealIngredient.meal_id == meal_id,
        )
        .first()
    )
    if not link:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Meal ingredient link not found")

    if payload.ingredient_id is not None:
        ingredient = (
            db.query(models.Ingredient)
            .filter(models.Ingredient.id == payload.ingredient_id)
            .first()
        )
        if not ingredient:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ingredient not found")
        link.ingredient_id = payload.ingredient_id

    if payload.grams is not None:
        link.grams = payload.grams

    db.commit()
    db.refresh(link)

    macros = calculate_meal_macros(meal_id, db)
    meal.calories = macros["calories"]
    meal.protein = macros["protein"]
    meal.carbs = macros["carbs"]
    meal.fat = macros["fat"]
    db.commit()

    return (
        db.query(models.MealIngredient)
        .options(selectinload(models.MealIngredient.ingredient))
        .filter(models.MealIngredient.id == link.id)
        .first()
    )


@router.delete("/meals/{meal_id}/ingredients/{link_id}", status_code=204)
def delete_meal_ingredient(meal_id: int, link_id: int, db: Session = Depends(get_db)):
    meal = db.query(models.Meal).filter(models.Meal.id == meal_id).first()
    if not meal:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Meal not found")

    link = (
        db.query(models.MealIngredient)
        .filter(
            models.MealIngredient.id == link_id,
            models.MealIngredient.meal_id == meal_id,
        )
        .first()
    )
    if not link:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Meal ingredient link not found")

    db.delete(link)
    db.commit()

    macros = calculate_meal_macros(meal_id, db)
    meal.calories = macros["calories"]
    meal.protein = macros["protein"]
    meal.carbs = macros["carbs"]
    meal.fat = macros["fat"]
    db.commit()

    return Response(status_code=204)
