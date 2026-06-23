from datetime import datetime, timezone

from sqlalchemy import Boolean, Column, Date, DateTime, Float, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.types import JSON
from sqlalchemy.orm import relationship

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(50), default="student")  # "student" | "admin"
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    orders = relationship("Order", back_populates="user")
    reservations = relationship("Reservation", back_populates="user")


class Meal(Base):
    __tablename__ = "meals"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    price = Column(Float, nullable=False)
    category = Column(String(100), nullable=True)   # main | side | drink | dessert
    image_url = Column(String(500), nullable=True)
    calories = Column(Integer, nullable=True)
    protein = Column(Float, nullable=True)           # grams
    carbs = Column(Float, nullable=True)             # grams
    fat = Column(Float, nullable=True)               # grams
    allergens = Column(JSON, default=lambda: [])     # e.g. ["gluten", "dairy"]
    tags = Column(JSON, default=lambda: [])          # e.g. ["vegan", "gluten-free"]
    is_available = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    order_items = relationship("OrderItem", back_populates="meal")
    meal_ingredients = relationship("MealIngredient", back_populates="meal")




class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    pickup_time = Column(DateTime, nullable=False)
    # pending → preparing → ready → completed  (or cancelled at any point)
    status = Column(String(50), default="pending")
    total_price = Column(Float, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="orders")
    items = relationship("OrderItem", back_populates="order")


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    meal_id = Column(Integer, ForeignKey("meals.id"), nullable=False)
    quantity = Column(Integer, nullable=False)
    item_price = Column(Float, nullable=False)  # price locked at the moment the order was placed

    order = relationship("Order", back_populates="items")
    meal = relationship("Meal", back_populates="order_items")


class Table(Base):
    __tablename__ = "tables"

    id = Column(Integer, primary_key=True, index=True)
    table_number = Column(Integer, unique=True, nullable=False)
    seats = Column(Integer, nullable=False)
    location = Column(String(100), nullable=True)  # indoor | outdoor | window
    is_available = Column(Boolean, default=True)

    reservations = relationship("Reservation", back_populates="table")


class Reservation(Base):
    __tablename__ = "reservations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    table_id = Column(Integer, ForeignKey("tables.id"), nullable=False)
    reservation_time = Column(DateTime, nullable=False)
    number_of_people = Column(Integer, nullable=False)
    status = Column(String(50), default="pending")  # pending | confirmed | cancelled
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="reservations")
    table = relationship("Table", back_populates="reservations")


class Ingredient(Base):
    __tablename__ = "ingredients"

    id = Column(Integer, primary_key=True, index=True)
    external_source = Column(String(100), nullable=False)
    external_id = Column(String(255), nullable=False)
    name = Column(String(255), nullable=False, index=True)
    calories_per_100g = Column(Float, nullable=False)
    protein_per_100g = Column(Float, nullable=False)
    carbs_per_100g = Column(Float, nullable=False)
    fat_per_100g = Column(Float, nullable=False)

    meal_ingredients = relationship("MealIngredient", back_populates="ingredient", cascade="all, delete-orphan")

class MealIngredient(Base):
    __tablename__ = "meal_ingredients"

    id = Column(Integer, primary_key=True, index=True)
    meal_id = Column(Integer, ForeignKey("meals.id"), nullable=False)
    ingredient_id = Column(Integer, ForeignKey("ingredients.id"), nullable=False)
    grams = Column(Float, nullable=False)

    meal = relationship("Meal", back_populates="meal_ingredients")
    ingredient = relationship("Ingredient", back_populates="meal_ingredients")


class MealVote(Base):
    __tablename__ = "meal_votes"
    __table_args__ = (
        UniqueConstraint("user_id", "meal_id", "vote_date", name="uq_user_meal_date"),
    )

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    meal_id = Column(Integer, ForeignKey("meals.id"), nullable=False)
    vote_date = Column(Date, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User")
    meal = relationship("Meal")


