from datetime import date, timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import and_, func
from sqlalchemy.orm import Session

from app import models, schemas
from app.dependencies import get_current_user, get_db

router = APIRouter(tags=["Votes"])


def _tomorrow() -> date:
    return date.today() + timedelta(days=1)


@router.get("/tomorrow", response_model=schemas.VoteTomorrowResponse)
def get_tomorrow_votes(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    Get all meals with their vote counts for tomorrow, sorted by most voted.
    `user_voted` indicates whether the current user already voted for that meal.
    """
    tomorrow = _tomorrow()

    rows = (
        db.query(
            models.Meal.id,
            models.Meal.name,
            func.count(models.MealVote.id).label("vote_count"),
        )
        .outerjoin(
            models.MealVote,
            and_(
                models.MealVote.meal_id == models.Meal.id,
                models.MealVote.vote_date == tomorrow,
            ),
        )
        .group_by(models.Meal.id, models.Meal.name)
        .order_by(func.count(models.MealVote.id).desc())
        .all()
    )

    user_voted_ids = {
        v.meal_id
        for v in db.query(models.MealVote)
        .filter(
            models.MealVote.user_id == current_user.id,
            models.MealVote.vote_date == tomorrow,
        )
        .all()
    }

    return {
        "vote_date": tomorrow,
        "results": [
            {
                "meal_id": row.id,
                "meal_name": row.name,
                "vote_count": row.vote_count,
                "user_voted": row.id in user_voted_ids,
            }
            for row in rows
        ],
    }


@router.post("/{meal_id}", status_code=status.HTTP_201_CREATED)
def vote_for_meal(
    meal_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    Vote for a meal to be available tomorrow.
    A user can vote for multiple meals but only once per meal per day.
    """
    tomorrow = _tomorrow()

    meal = db.query(models.Meal).filter(models.Meal.id == meal_id).first()
    if not meal:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Meal not found")

    existing = (
        db.query(models.MealVote)
        .filter_by(user_id=current_user.id, meal_id=meal_id, vote_date=tomorrow)
        .first()
    )
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Already voted for this meal today")

    db.add(models.MealVote(user_id=current_user.id, meal_id=meal_id, vote_date=tomorrow))
    db.commit()
    return {"detail": f"Vote registered for '{meal.name}'"}


@router.delete("/{meal_id}", status_code=status.HTTP_200_OK)
def remove_vote(
    meal_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Remove your vote for a meal (tomorrow's date only)."""
    tomorrow = _tomorrow()

    vote = (
        db.query(models.MealVote)
        .filter_by(user_id=current_user.id, meal_id=meal_id, vote_date=tomorrow)
        .first()
    )
    if not vote:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No vote found for this meal")

    db.delete(vote)
    db.commit()
    return {"detail": "Vote removed"}
