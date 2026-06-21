# Frontend API Guide

Base URL: `http://localhost:8000`

---

## Authentication

### Register
```
POST /auth/register
Body: { "full_name": "Max Mustermann", "email": "m.mustermann@htwsaar.de", "password": "securepass123" }
```
> Email must end with @htwsaar.de

### Login
```
POST /auth/login
Body: { "email": "m.mustermann@htwsaar.de", "password": "securepass123" }
Returns: { "access_token": "...", "token_type": "bearer" }
```

### Get Profile
```
GET /auth/me
Headers: Authorization: Bearer <token>
Returns: { "id": 1, "full_name": "...", "email": "...", "role": "student", "created_at": "..." }
```

### Logout
No backend call needed — just delete the token from localStorage.

---

## Meals (no auth required)

### List All Meals
```
GET /meals
GET /meals?search=chicken
GET /meals?category=main
GET /meals?available_only=true
GET /meals?search=salad&category=side&available_only=true
```
Categories: `main` | `side` | `drink` | `dessert`

### Get Single Meal
```
GET /meals/{id}
Returns: { "id": 1, "name": "...", "price": 4.50, "calories": 650, "protein": 28.5, "carbs": 75, "fat": 18, "allergens": [...], "tags": [...], "image_url": "...", ... }
```

---

## Orders (Pre-Order) — requires login

### Place an Order
```
POST /orders
Headers: Authorization: Bearer <token>
Body:
{
  "items": [
    { "meal_id": 1, "quantity": 2 },
    { "meal_id": 3, "quantity": 1 }
  ],
  "pickup_time": "2026-06-20T12:30:00"
}
```
> pickup_time must be in the future

### My Order History
```
GET /orders/my
Headers: Authorization: Bearer <token>
```

### Get Single Order
```
GET /orders/{id}
Headers: Authorization: Bearer <token>
```

### Cancel Order
```
PATCH /orders/{id}/cancel
Headers: Authorization: Bearer <token>
```
> Only works if order status is "pending"

**Order statuses:** `pending` → `preparing` → `ready` → `completed` | `cancelled`

---

## Tables (no auth required)

### List All Tables
```
GET /tables
```

### List Available Tables
```
GET /tables/available
```

---

## Reservations — requires login

### Make a Reservation
```
POST /reservations
Headers: Authorization: Bearer <token>
Body:
{
  "table_id": 1,
  "reservation_time": "2026-06-20T13:00:00",
  "number_of_people": 3
}
```
> reservation_time must be in the future
> number_of_people must not exceed table seats

### My Reservation History
```
GET /reservations/my
Headers: Authorization: Bearer <token>
```

### Cancel Reservation
```
PATCH /reservations/{id}/cancel
Headers: Authorization: Bearer <token>
```

---

## How to attach the token (every protected request)

```js
const token = localStorage.getItem("access_token");

const response = await fetch("http://localhost:8000/orders/my", {
  headers: {
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json"
  }
});
```

---

## Login + Store Token Example

```js
const res = await fetch("http://localhost:8000/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: "m.mustermann@htwsaar.de", password: "student123" })
});

const data = await res.json();
localStorage.setItem("access_token", data.access_token);
```

---

## Common Errors

| Code | Meaning |
|------|---------|
| 401 | Not logged in or token expired — redirect to login |
| 403 | Not allowed (e.g. accessing another user's order) |
| 404 | Item not found |
| 400 | Validation error (read the `detail` field in response) |
| 422 | Wrong request format — check your JSON body |

---

## Test Accounts

| Email | Password | Role |
|-------|----------|------|
| admin@htwsaar.de | admin123 | Admin |
| m.mustermann@htwsaar.de | student123 | Student |
| a.schmidt@htwsaar.de | student123 | Student |

Full API docs with live testing: `http://localhost:8000/docs`
