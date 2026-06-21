from sqlalchemy.orm import Session, selectinload

from app import models


def calculate_meal_macros(meal_id: int, db: Session) -> dict:
    meal = (
        db.query(models.Meal)
        .options(
            selectinload(models.Meal.meal_ingredients).selectinload(models.MealIngredient.ingredient)
        )
        .filter(models.Meal.id == meal_id)
        .first()
    )

    if not meal:
        raise ValueError("Meal not found")

    calories = 0.0
    protein = 0.0
    carbs = 0.0
    fat = 0.0

    for link in meal.meal_ingredients:
        factor = link.grams / 100.0
        calories += link.ingredient.calories_per_100g * factor
        protein += link.ingredient.protein_per_100g * factor
        carbs += link.ingredient.carbs_per_100g * factor
        fat += link.ingredient.fat_per_100g * factor

    return {
        "meal_id": meal.id,
        "calories": round(calories, 2),
        "protein": round(protein, 2),
        "carbs": round(carbs, 2),
        "fat": round(fat, 2),
    }
