# HTW Saar Cafeteria API

FastAPI backend for the HTW Saar University Cafeteria UX Project.  
Students can browse meals, place preorders, and reserve tables.  
Admins manage the full menu, order pipeline, and seating.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | FastAPI |
| Database | SQLite (`cafeteria.db`) |
| ORM | SQLAlchemy 2.0 |
| Validation | Pydantic v2 |
| Auth | JWT (python-jose) + bcrypt (passlib) |
| Docs | Swagger UI at `/docs`, ReDoc at `/redoc` |

---

## Prerequisites

- Python 3.10 or higher
- pip

---

## Installation

```bash
# 1. Clone / download the project
cd cafeteria-backend

# 2. Create and activate a virtual environment
python -m venv venv

# Windows
venv\Scripts\activate

# macOS / Linux
source venv/bin/activate

# 3. Install dependencies
pip install -r requirements.txt
```

---

## Running the Backend

```bash
uvicorn app.main:app --reload
```

The API will be available at:

| URL | Purpose |
|---|---|
| `http://localhost:8000` | API root / health check |
| `http://localhost:8000/docs` | Interactive Swagger UI |
| `http://localhost:8000/redoc` | ReDoc documentation |

The SQLite database file (`cafeteria.db`) is created automatically the first time the app starts.

---

## Seeding Sample Data

```bash
python seed.py
```

This will:
- Create all database tables (if they don't exist yet)
- Clear any existing data
- Insert 10 sample meals, 8 tables, 3 users, 1 order, and 1 reservation

> **Note:** Run the seed after installing dependencies. The app does not need to be running.

---

## Test Accounts

| Role | Email | Password |
|---|---|---|
| Admin | `admin@htwsaar.de` | `admin123` |
| Student | `m.mustermann@htwsaar.de` | `student123` |
| Student | `a.schmidt@htwsaar.de` | `student123` |

---

## Authentication

All protected endpoints require a **Bearer token** in the `Authorization` header.

**Step 1 — login:**
```http
POST /auth/login
Content-Type: application/json

{
  "email": "m.mustermann@htwsaar.de",
  "password": "student123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

**Step 2 — use the token:**
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**In Swagger UI:** click **Authorize** (top-right), paste the token, click Authorize.

Tokens expire after **24 hours**.

---

## API Endpoints

### Auth

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | Public | Register a new student (`@htwsaar.de` email only) |
| POST | `/auth/login` | Public | Login and receive JWT token |
| GET | `/auth/me` | Student / Admin | Get current user profile |

### Meals

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/meals` | Public | List all meals (supports `?category=` and `?available_only=true`) |
| GET | `/meals/{meal_id}` | Public | Get single meal with full nutrition info |
| POST | `/admin/meals` | Admin | Create a new meal |
| PUT | `/admin/meals/{meal_id}` | Admin | Update a meal (partial update supported) |
| DELETE | `/admin/meals/{meal_id}` | Admin | Delete a meal |

### Orders

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/orders` | Student | Place a new preorder (full cart in one request) |
| GET | `/orders/my` | Student | List my orders |
| GET | `/orders/{order_id}` | Student | Get a specific order (own orders only) |
| PATCH | `/orders/{order_id}/cancel` | Student | Cancel a pending order |
| GET | `/admin/orders` | Admin | List all orders from all students |
| PATCH | `/admin/orders/{order_id}/status` | Admin | Update order status |

**Order statuses:** `pending` → `preparing` → `ready` → `completed` (or `cancelled`)

### Tables

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/tables` | Public | List all tables |
| GET | `/tables/available` | Public | List only available tables |
| POST | `/admin/tables` | Admin | Create a table |
| PUT | `/admin/tables/{table_id}` | Admin | Update a table |
| DELETE | `/admin/tables/{table_id}` | Admin | Delete a table |

### Reservations

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/reservations` | Student | Reserve a table |
| GET | `/reservations/my` | Student | List my reservations |
| PATCH | `/reservations/{reservation_id}/cancel` | Student | Cancel a reservation |
| GET | `/admin/reservations` | Admin | List all reservations |
| PATCH | `/admin/reservations/{reservation_id}/status` | Admin | Update reservation status |

**Reservation statuses:** `pending` → `confirmed` (or `cancelled`)

---

## Example Requests

### Register a student
```http
POST /auth/register
{
  "full_name": "Maria Muster",
  "email": "ma.muster@htwsaar.de",
  "password": "mypassword123"
}
```

### Place an order
```http
POST /orders
Authorization: Bearer <token>

{
  "items": [
    {"meal_id": 1, "quantity": 1},
    {"meal_id": 8, "quantity": 2}
  ],
  "pickup_time": "2025-06-15T12:30:00"
}
```

### Reserve a table
```http
POST /reservations
Authorization: Bearer <token>

{
  "table_id": 3,
  "reservation_time": "2025-06-15T13:00:00",
  "number_of_people": 4
}
```

### Admin — update order status
```http
PATCH /admin/orders/1/status
Authorization: Bearer <admin-token>

{
  "status": "preparing"
}
```

---

## CORS

The API allows requests from these frontend dev origins:

- `http://localhost:3000` (Create React App / Next.js)
- `http://localhost:5173` (Vite)
- `http://localhost:8080` (Vue CLI)

To add more origins, edit the `allow_origins` list in [app/main.py](app/main.py).

---

## Project Structure

```
cafeteria-backend/
├── app/
│   ├── main.py          # FastAPI app, CORS, router registration
│   ├── database.py      # SQLAlchemy engine and session factory
│   ├── models.py        # ORM table definitions
│   ├── schemas.py       # Pydantic request/response models
│   ├── auth.py          # JWT and password hashing utilities
│   ├── dependencies.py  # Shared FastAPI dependencies (get_db, auth guards)
│   └── routers/
│       ├── auth.py          # /auth endpoints
│       ├── meals.py         # /meals endpoints (public)
│       ├── orders.py        # /orders endpoints (student)
│       ├── tables.py        # /tables endpoints (public)
│       ├── reservations.py  # /reservations endpoints (student)
│       └── admin.py         # /admin endpoints (admin only)
├── seed.py              # Sample data loader
├── requirements.txt
└── README.md
```
