"""
Seed script — populates the database with sample data for development and demos.

Usage:
    python seed.py

Run this AFTER starting the app at least once (so the tables are created),
or let it create them itself (it calls Base.metadata.create_all).
WARNING: This script clears all existing data before inserting.
"""

import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path

# Allow running from the project root: python seed.py
sys.path.append(str(Path(__file__).parent))

from app.auth import hash_password
from app.database import Base, SessionLocal, engine
from app import models


def seed():
    # Ensure tables exist
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        # ── Clear existing data (order matters due to foreign keys) ───────────
        db.query(models.Reservation).delete()
        db.query(models.OrderItem).delete()
        db.query(models.Order).delete()
        db.query(models.Table).delete()
        db.query(models.Meal).delete()
        db.query(models.User).delete()
        db.commit()

        # ── Users ─────────────────────────────────────────────────────────────
        admin = models.User(
            full_name="Cafeteria Admin",
            email="admin@htwsaar.de",
            hashed_password=hash_password("admin123"),
            role="admin",
        )
        student1 = models.User(
            full_name="Max Mustermann",
            email="m.mustermann@htwsaar.de",
            hashed_password=hash_password("student123"),
            role="student",
        )
        student2 = models.User(
            full_name="Anna Schmidt",
            email="a.schmidt@htwsaar.de",
            hashed_password=hash_password("student123"),
            role="student",
        )
        db.add_all([admin, student1, student2])
        db.commit()
        db.refresh(admin)
        db.refresh(student1)
        db.refresh(student2)

        # ── Meals ─────────────────────────────────────────────────────────────
        meals = [
            # Main dishes
            models.Meal(
                name="Spaghetti Bolognese",
                description="Classic Italian pasta with slow-cooked beef and tomato sauce",
                price=4.50,
                category="main",
                image_url="https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400",
                calories=650,
                protein=28.5,
                carbs=75.0,
                fat=18.0,
                allergens=["gluten", "dairy"],
                tags=["meat", "pasta", "italian"],
                is_available=True,
            ),
            models.Meal(
                name="Vegetable Curry",
                description="Mild coconut curry with seasonal vegetables served with basmati rice",
                price=3.80,
                category="main",
                image_url="https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400",
                calories=480,
                protein=12.0,
                carbs=68.0,
                fat=14.0,
                allergens=["dairy"],
                tags=["vegan", "gluten-free", "vegetarian"],
                is_available=True,
            ),
            models.Meal(
                name="Chicken Schnitzel",
                description="Crispy breaded chicken breast with potato salad and lemon",
                price=5.20,
                category="main",
                image_url="https://images.unsplash.com/photo-1599921841143-819065a55cc6?w=400",
                calories=720,
                protein=42.0,
                carbs=45.0,
                fat=28.0,
                allergens=["gluten", "eggs"],
                tags=["meat", "german"],
                is_available=True,
            ),
            models.Meal(
                name="Falafel Wrap",
                description="Crispy falafel with hummus, fresh vegetables in a pita bread",
                price=4.00,
                category="main",
                image_url="https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=400",
                calories=520,
                protein=18.0,
                carbs=65.0,
                fat=20.0,
                allergens=["gluten", "sesame"],
                tags=["vegan", "vegetarian", "middle-eastern"],
                is_available=True,
            ),
            models.Meal(
                name="Lasagne",
                description="Traditional beef and béchamel lasagne with parmesan crust",
                price=4.80,
                category="main",
                image_url="https://images.unsplash.com/photo-1560780552-ba54683cb263?w=400",
                calories=700,
                protein=32.0,
                carbs=62.0,
                fat=26.0,
                allergens=["gluten", "dairy", "eggs"],
                tags=["meat", "italian", "pasta"],
                is_available=False,  # not on menu today
            ),
            # Sides
            models.Meal(
                name="Caesar Salad",
                description="Crisp romaine, shaved parmesan, croutons, and caesar dressing",
                price=3.20,
                category="side",
                image_url="https://images.unsplash.com/photo-1512852939750-1305098529bf?w=400",
                calories=320,
                protein=14.0,
                carbs=22.0,
                fat=20.0,
                allergens=["gluten", "dairy", "eggs", "fish"],
                tags=["salad", "vegetarian"],
                is_available=True,
            ),
            models.Meal(
                name="Tomato Soup",
                description="Velvety tomato soup with fresh basil and a swirl of cream",
                price=2.50,
                category="side",
                image_url="https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400",
                calories=180,
                protein=5.0,
                carbs=22.0,
                fat=8.0,
                allergens=["dairy"],
                tags=["soup", "vegetarian", "gluten-free"],
                is_available=True,
            ),
            # Drinks
            models.Meal(
                name="Mineral Water (0.5L)",
                description="Still mineral water",
                price=1.00,
                category="drink",
                image_url="https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400",
                calories=0,
                protein=0.0,
                carbs=0.0,
                fat=0.0,
                allergens=[],
                tags=["drink", "vegan", "gluten-free"],
                is_available=True,
            ),
            models.Meal(
                name="Apple Juice (0.3L)",
                description="Freshly pressed apple juice",
                price=1.50,
                category="drink",
                image_url="https://images.unsplash.com/photo-1570197571499-166b36435e9f?w=400",
                calories=120,
                protein=0.2,
                carbs=28.0,
                fat=0.1,
                allergens=[],
                tags=["drink", "vegan"],
                is_available=True,
            ),
            # Desserts
            models.Meal(
                name="Chocolate Muffin",
                description="Rich double-chocolate muffin with chocolate chips",
                price=1.80,
                category="dessert",
                image_url="https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=400",
                calories=380,
                protein=5.0,
                carbs=55.0,
                fat=16.0,
                allergens=["gluten", "dairy", "eggs"],
                tags=["dessert", "sweet", "vegetarian"],
                is_available=True,
            ),
        ]
        db.add_all(meals)
        db.commit()
        for m in meals:
            db.refresh(m)

        # ── Tables ────────────────────────────────────────────────────────────
        tables = [
            models.Table(table_number=1, seats=2, location="window",  is_available=True),
            models.Table(table_number=2, seats=2, location="window",  is_available=True),
            models.Table(table_number=3, seats=4, location="indoor",  is_available=True),
            models.Table(table_number=4, seats=4, location="indoor",  is_available=True),
            models.Table(table_number=5, seats=4, location="indoor",  is_available=True),
            models.Table(table_number=6, seats=6, location="indoor",  is_available=True),
            models.Table(table_number=7, seats=6, location="outdoor", is_available=True),
            models.Table(table_number=8, seats=8, location="outdoor", is_available=True),
        ]
        db.add_all(tables)
        db.commit()
        for t in tables:
            db.refresh(t)

        # ── Sample order for student1 ─────────────────────────────────────────
        # Spaghetti x1 (4.50) + Water x2 (2.00) + Muffin x1 (1.80) = 8.30
        sample_order = models.Order(
            user_id=student1.id,
            pickup_time=datetime.now(timezone.utc) + timedelta(hours=1),
            status="preparing",
            total_price=8.30,
        )
        db.add(sample_order)
        db.flush()

        db.add_all([
            models.OrderItem(order_id=sample_order.id, meal_id=meals[0].id, quantity=1, item_price=4.50),
            models.OrderItem(order_id=sample_order.id, meal_id=meals[7].id, quantity=2, item_price=1.00),
            models.OrderItem(order_id=sample_order.id, meal_id=meals[9].id, quantity=1, item_price=1.80),
        ])
        db.commit()

        # ── Sample reservation for student1 ───────────────────────────────────
        sample_reservation = models.Reservation(
            user_id=student1.id,
            table_id=tables[2].id,  # Table 3 (4 seats, indoor)
            reservation_time=datetime.now(timezone.utc) + timedelta(hours=2),
            number_of_people=3,
            status="confirmed",
        )
        db.add(sample_reservation)
        db.commit()

    finally:
        db.close()

    print("[OK] Database seeded successfully!")
    print()
    print("Test accounts:")
    print("  Admin   - admin@htwsaar.de         / admin123")
    print("  Student - m.mustermann@htwsaar.de  / student123")
    print("  Student - a.schmidt@htwsaar.de     / student123")
    print()
    print(f"Sample data: {len(meals)} meals | {len(tables)} tables | 1 order | 1 reservation")


if __name__ == "__main__":
    seed()
