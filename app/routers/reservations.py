from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, selectinload

from app import models, schemas
from app.dependencies import get_current_user, get_db

router = APIRouter()


def _fetch_reservation(db: Session, reservation_id: int) -> Optional[models.Reservation]:
    """Load a reservation with its table and user details in one query."""
    return (
        db.query(models.Reservation)
        .options(
            selectinload(models.Reservation.table),
            selectinload(models.Reservation.user),
        )
        .filter(models.Reservation.id == reservation_id)
        .first()
    )


@router.post("", response_model=schemas.ReservationResponse, status_code=201)
def create_reservation(
    payload: schemas.ReservationCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    Reserve a table.

    **FRONTEND validation to mirror server-side:**
    - `reservation_time` must be in the future
    - `number_of_people` must not exceed the table's `seats` count
    - The chosen table must have `is_available = true`

    New reservations start with status **`pending`** until an admin confirms them.
    """
    table = db.query(models.Table).filter(models.Table.id == payload.table_id).first()
    if not table:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Table not found")
    if not table.is_available:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This table is not available for reservations",
        )
    if payload.number_of_people > table.seats:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"Table {table.table_number} has only {table.seats} seat(s), "
                f"but {payload.number_of_people} people were requested"
            ),
        )

    reservation = models.Reservation(
        user_id=current_user.id,
        table_id=table.id,
        reservation_time=payload.reservation_time,
        number_of_people=payload.number_of_people,
        status="pending",
    )
    db.add(reservation)
    db.commit()
    return _fetch_reservation(db, reservation.id)


@router.get("/my", response_model=List[schemas.ReservationResponse])
def get_my_reservations(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Return all reservations made by the currently logged-in student, newest first."""
    return (
        db.query(models.Reservation)
        .options(
            selectinload(models.Reservation.table),
            selectinload(models.Reservation.user),
        )
        .filter(models.Reservation.user_id == current_user.id)
        .order_by(models.Reservation.reservation_time.desc())
        .all()
    )


@router.patch("/{reservation_id}/cancel", response_model=schemas.ReservationResponse)
def cancel_reservation(
    reservation_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    Cancel a reservation.

    - Both **`pending`** and **`confirmed`** reservations can be cancelled.
    - Students can only cancel their own reservations.
    - No request body needed.
    """
    reservation = _fetch_reservation(db, reservation_id)
    if not reservation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reservation not found")
    if reservation.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    if reservation.status == "cancelled":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This reservation is already cancelled",
        )

    reservation.status = "cancelled"
    db.commit()
    return _fetch_reservation(db, reservation_id)
