from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, selectinload

from app import models, schemas
from app.dependencies import get_current_user, get_db

router = APIRouter()


def _fetch_order(db: Session, order_id: int) -> Optional[models.Order]:
    """Load an order with all nested items, their meal details, and the placing user in one query."""
    return (
        db.query(models.Order)
        .options(
            selectinload(models.Order.items).selectinload(models.OrderItem.meal),
            selectinload(models.Order.user),
        )
        .filter(models.Order.id == order_id)
        .first()
    )


@router.post("", response_model=schemas.OrderResponse, status_code=201)
def create_order(
    payload: schemas.OrderCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    Place a new preorder.

    **FRONTEND**: Send the complete cart in a single request.
    - The backend validates that every meal exists and is currently available.
    - Prices are locked at the moment of ordering (stored per item).
    - `total_price` is calculated automatically — do not send it.

    **Request body example:**
    ```json
    {
      "items": [
        {"meal_id": 1, "quantity": 1},
        {"meal_id": 6, "quantity": 2}
      ],
      "pickup_time": "2025-06-15T12:30:00"
    }
    ```
    """
    total = 0.0
    order_items: list[models.OrderItem] = []

    for cart_item in payload.items:
        meal = db.query(models.Meal).filter(models.Meal.id == cart_item.meal_id).first()
        if not meal:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Meal with ID {cart_item.meal_id} not found",
            )
        if not meal.is_available:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"'{meal.name}' is currently not available",
            )
        total += meal.price * cart_item.quantity
        order_items.append(
            models.OrderItem(
                meal_id=meal.id,
                quantity=cart_item.quantity,
                item_price=meal.price,
            )
        )

    order = models.Order(
        user_id=current_user.id,
        pickup_time=payload.pickup_time,
        status="pending",
        total_price=round(total, 2),
    )
    db.add(order)
    db.flush()  # populate order.id without a full commit yet

    for oi in order_items:
        oi.order_id = order.id
        db.add(oi)

    db.commit()
    return _fetch_order(db, order.id)


@router.get("/my", response_model=List[schemas.OrderResponse])
def get_my_orders(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Return all orders placed by the currently logged-in student, newest first."""
    return (
        db.query(models.Order)
        .options(
            selectinload(models.Order.items).selectinload(models.OrderItem.meal),
            selectinload(models.Order.user),
        )
        .filter(models.Order.user_id == current_user.id)
        .order_by(models.Order.created_at.desc())
        .all()
    )


@router.get("/{order_id}", response_model=schemas.OrderResponse)
def get_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    Get a specific order by ID.
    Students can only view their own orders — returns 403 for others.
    """
    order = _fetch_order(db, order_id)
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    if order.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    return order


@router.patch("/{order_id}/cancel", response_model=schemas.OrderResponse)
def cancel_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    Cancel a pending order.

    - Only orders with status **`pending`** can be cancelled.
    - Students can only cancel their own orders.
    - No request body needed.
    """
    order = _fetch_order(db, order_id)
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    if order.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    if order.status != "pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot cancel an order with status '{order.status}'. Only 'pending' orders can be cancelled.",
        )

    order.status = "cancelled"
    db.commit()
    return _fetch_order(db, order.id)
