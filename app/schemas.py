"""
Pydantic schemas for request validation and response serialization.

FRONTEND NOTES
--------------
- All datetime fields use ISO 8601 format: "2025-06-15T12:30:00"
- Protected endpoints require: Authorization: Bearer <access_token>
- Obtain the token via POST /auth/login
"""

from datetime import datetime, timezone
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


# ── Auth ──────────────────────────────────────────────────────────────────────

class UserRegister(BaseModel):
    """
    POST /auth/register
    FRONTEND: email MUST end with @htwsaar.de — other domains are rejected.
    """
    full_name: str = Field(..., min_length=2, max_length=255, examples=["Max Mustermann"])
    email: EmailStr = Field(..., examples=["m.mustermann@htwsaar.de"])
    password: str = Field(..., min_length=8, examples=["securepass123"])

    @field_validator("email")
    @classmethod
    def must_be_university_email(cls, v: str) -> str:
        if not v.lower().endswith("@htwsaar.de"):
            raise ValueError("Only HTW Saar emails are accepted (@htwsaar.de)")
        return v.lower()


class UserLogin(BaseModel):
    """POST /auth/login"""
    email: str = Field(..., examples=["m.mustermann@htwsaar.de"])
    password: str = Field(..., examples=["securepass123"])


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    full_name: str
    email: str
    role: str  # "student" | "admin"
    created_at: datetime


class Token(BaseModel):
    """
    Returned by POST /auth/login.
    FRONTEND: store access_token locally (localStorage / sessionStorage) and
    attach it to every protected request:
        Authorization: Bearer <access_token>
    """
    access_token: str
    token_type: str = "bearer"


# ── Meals ─────────────────────────────────────────────────────────────────────

class MealCreate(BaseModel):
    """POST /admin/meals  —  admin only"""
    name: str = Field(..., min_length=1, max_length=255, examples=["Spaghetti Bolognese"])
    description: Optional[str] = Field(None, examples=["Classic pasta with meat sauce"])
    price: float = Field(..., gt=0, examples=[4.50])
    category: Optional[str] = Field(None, examples=["main"])  # main | side | drink | dessert
    image_url: Optional[str] = Field(None, examples=["https://example.com/meal.jpg"])
    calories: Optional[int] = Field(None, ge=0, examples=[650])
    protein: Optional[float] = Field(None, ge=0, examples=[28.5])   # grams
    carbs: Optional[float] = Field(None, ge=0, examples=[75.0])     # grams
    fat: Optional[float] = Field(None, ge=0, examples=[18.0])       # grams
    allergens: List[str] = Field(default=[], examples=[["gluten", "dairy"]])
    tags: List[str] = Field(default=[], examples=[["pasta", "meat"]])
    is_available: bool = Field(default=True)


class MealUpdate(BaseModel):
    """PUT /admin/meals/{id}  —  all fields optional (partial update)"""
    name: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    price: Optional[float] = Field(None, gt=0)
    category: Optional[str] = None
    image_url: Optional[str] = None
    calories: Optional[int] = Field(None, ge=0)
    protein: Optional[float] = Field(None, ge=0)
    carbs: Optional[float] = Field(None, ge=0)
    fat: Optional[float] = Field(None, ge=0)
    allergens: Optional[List[str]] = None
    tags: Optional[List[str]] = None
    is_available: Optional[bool] = None


class MealResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    description: Optional[str] = None
    price: float
    category: Optional[str] = None
    image_url: Optional[str] = None
    calories: Optional[int] = None
    protein: Optional[float] = None
    carbs: Optional[float] = None
    fat: Optional[float] = None
    allergens: List[str] = []
    tags: List[str] = []
    is_available: bool
    created_at: datetime


# ── Orders ────────────────────────────────────────────────────────────────────

class OrderItemCreate(BaseModel):
    """A single cart item when placing an order."""
    meal_id: int = Field(..., examples=[1])
    quantity: int = Field(..., gt=0, examples=[2])


class OrderCreate(BaseModel):
    """
    POST /orders
    FRONTEND: send the full cart in one request.
    - items: list of {meal_id, quantity} objects
    - pickup_time: future datetime, e.g. "2025-06-15T12:30:00"
    Total price is calculated server-side from current meal prices.
    """
    items: List[OrderItemCreate] = Field(..., min_length=1)
    pickup_time: datetime = Field(..., examples=["2025-06-15T12:30:00"])

    @field_validator("pickup_time")
    @classmethod
    def pickup_must_be_future(cls, v: datetime) -> datetime:
        # Strip tzinfo so comparison works regardless of whether the client sends tz-aware or naive
        v_naive = v.replace(tzinfo=None) if v.tzinfo else v
        if v_naive <= datetime.now(timezone.utc).replace(tzinfo=None):
            raise ValueError("Pickup time must be in the future")
        return v


class OrderItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    meal_id: int
    quantity: int
    item_price: float       # price at the moment the order was placed
    meal: Optional[MealResponse] = None


class OrderResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    pickup_time: datetime
    status: str             # pending | preparing | ready | completed | cancelled
    total_price: float
    created_at: datetime
    items: List[OrderItemResponse] = []
    user: Optional[UserResponse] = None


class OrderStatusUpdate(BaseModel):
    """PATCH /admin/orders/{id}/status"""
    status: str = Field(..., examples=["preparing"])

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: str) -> str:
        allowed = {"pending", "preparing", "ready", "completed", "cancelled"}
        if v not in allowed:
            raise ValueError(f"status must be one of: {', '.join(sorted(allowed))}")
        return v


# ── Tables ────────────────────────────────────────────────────────────────────

class TableCreate(BaseModel):
    """POST /admin/tables  —  admin only"""
    table_number: int = Field(..., gt=0, examples=[5])
    seats: int = Field(..., gt=0, examples=[4])
    location: Optional[str] = Field(None, examples=["indoor"])  # indoor | outdoor | window
    is_available: bool = Field(default=True)


class TableUpdate(BaseModel):
    """PUT /admin/tables/{id}  —  all fields optional"""
    table_number: Optional[int] = Field(None, gt=0)
    seats: Optional[int] = Field(None, gt=0)
    location: Optional[str] = None
    is_available: Optional[bool] = None


class TableResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    table_number: int
    seats: int
    location: Optional[str] = None
    is_available: bool


# ── Reservations ──────────────────────────────────────────────────────────────

class ReservationCreate(BaseModel):
    """
    POST /reservations
    FRONTEND:
    - reservation_time must be in the future
    - number_of_people must not exceed the table's seat count
    - the table must be marked as available
    """
    table_id: int = Field(..., examples=[1])
    reservation_time: datetime = Field(..., examples=["2025-06-15T13:00:00"])
    number_of_people: int = Field(..., gt=0, examples=[3])

    @field_validator("reservation_time")
    @classmethod
    def time_must_be_future(cls, v: datetime) -> datetime:
        v_naive = v.replace(tzinfo=None) if v.tzinfo else v
        if v_naive <= datetime.now(timezone.utc).replace(tzinfo=None):
            raise ValueError("Reservation time must be in the future")
        return v


class ReservationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    table_id: int
    reservation_time: datetime
    number_of_people: int
    status: str             # pending | confirmed | cancelled
    created_at: datetime
    table: Optional[TableResponse] = None
    user: Optional[UserResponse] = None


class ReservationStatusUpdate(BaseModel):
    """PATCH /admin/reservations/{id}/status"""
    status: str = Field(..., examples=["confirmed"])

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: str) -> str:
        allowed = {"pending", "confirmed", "cancelled"}
        if v not in allowed:
            raise ValueError(f"status must be one of: {', '.join(sorted(allowed))}")
        return v


# ── Ingredients / Meal Builder ────────────────────────────────────────────────

class IngredientCreate(BaseModel):
    external_source: str = Field(..., min_length=1, max_length=100, examples=["manual"])
    external_id: str = Field(..., min_length=1, max_length=255, examples=["rice-001"])
    name: str = Field(..., min_length=1, max_length=255, examples=["Rice"])
    calories_per_100g: float = Field(..., ge=0, examples=[130])
    protein_per_100g: float = Field(..., ge=0, examples=[2.7])
    carbs_per_100g: float = Field(..., ge=0, examples=[28.0])
    fat_per_100g: float = Field(..., ge=0, examples=[0.3])


class IngredientResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    external_source: str
    external_id: str
    name: str
    calories_per_100g: float
    protein_per_100g: float
    carbs_per_100g: float
    fat_per_100g: float


class MealIngredientCreate(BaseModel):
    ingredient_id: int = Field(..., gt=0, examples=[1])
    grams: float = Field(..., gt=0, examples=[150])


class MealIngredientUpdate(BaseModel):
    ingredient_id: Optional[int] = Field(None, gt=0, examples=[1])
    grams: Optional[float] = Field(None, gt=0, examples=[120])


class MealIngredientResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    meal_id: int
    ingredient_id: int
    grams: float
    ingredient: IngredientResponse


class MealMacrosResponse(BaseModel):
    meal_id: int
    calories: float
    protein: float
    carbs: float
    fat: float


class ExternalIngredientSearchResponse(BaseModel):
    external_source: str
    external_id: str
    name: str
    calories_per_100g: float
    protein_per_100g: float
    carbs_per_100g: float
    fat_per_100g: float


# ── USDA Ingredient Lookup ────────────────────────────────────────────────────

class IngredientSearchResult(BaseModel):
    """Ein einzelner Treffer aus Schritt 1."""
    fdc_id:    int
    name:      str
    data_type: str

class IngredientMacroResponse(BaseModel):
    """Makros aus Schritt 2 — für einen konkreten fdcId."""
    fdc_id:   int
    name:     str
    calories: int
    protein:  float
    fat:      float
    carbs:    float

