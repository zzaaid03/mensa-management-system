from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, selectinload

from app import models, schemas
from app.dependencies import get_current_user, get_db

router = APIRouter(tags=["Feedback"])


@router.post("/orders/{order_id}/feedback", response_model=schemas.FeedbackResponse, status_code=201)
def submit_feedback(
    order_id: int,
    payload: schemas.FeedbackCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    Submit feedback for a completed order.
    - Only the order owner can submit feedback.
    - Order must have status **completed**.
    - One feedback per order.
    """
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    if order.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    if order.status != "completed":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Feedback can only be submitted for completed orders (current status: '{order.status}')",
        )

    existing = db.query(models.OrderFeedback).filter_by(order_id=order_id).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Feedback already submitted for this order")

    feedback = models.OrderFeedback(
        order_id=order_id,
        user_id=current_user.id,
        rating=payload.rating,
        comment=payload.comment,
    )
    db.add(feedback)
    db.commit()
    db.refresh(feedback)
    return feedback


@router.get("/orders/{order_id}/feedback", response_model=schemas.FeedbackResponse)
def get_feedback(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Get the feedback for a specific order (owner only)."""
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    if order.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    feedback = db.query(models.OrderFeedback).filter_by(order_id=order_id).first()
    if not feedback:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No feedback found for this order")
    return feedback


@router.get("/feedback/my", response_model=List[schemas.FeedbackResponse])
def get_my_feedback(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Return all feedback submitted by the current user, newest first."""
    return (
        db.query(models.OrderFeedback)
        .filter(models.OrderFeedback.user_id == current_user.id)
        .order_by(models.OrderFeedback.created_at.desc())
        .all()
    )
