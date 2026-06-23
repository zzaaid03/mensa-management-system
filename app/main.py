from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers.ingredients import router as ingredients_router
from app.routers.feedback import router as feedback_router


from app.database import Base, engine
from app.routers.admin import router as admin_router
from app.routers.auth import router as auth_router
from app.routers.meals import router as meals_router
from app.routers.orders import router as orders_router
from app.routers.reservations import router as reservations_router
from app.routers.tables import router as tables_router

# Create all database tables on application startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="HTW Saar Cafeteria API",
    description=(
        "Backend for the HTW Saar University Cafeteria UX Project.\n\n"
        "### Authentication\n"
        "Most endpoints require a JWT Bearer token.\n"
        "1. Call **POST /auth/login** with your email and password.\n"
        "2. Copy the `access_token` from the response.\n"
        "3. Click **Authorize** (top-right) and paste the token.\n\n"
        "### Roles\n"
        "- **guest** — browse meals and tables, no account needed\n"
        "- **student** — register, preorder meals, reserve tables\n"
        "- **admin** — full management of meals, orders, tables, and reservations\n\n"
        "### Public endpoints (no auth)\n"
        "`GET /meals`, `GET /meals/{id}`, `GET /tables`, `GET /tables/available`"
    ),
    version="1.0.0",
)

# Allow common frontend development server origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",   # Create React App / Next.js
        "http://localhost:5173",   # Vite
        "http://localhost:8080",   # Vue CLI
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router,         prefix="/auth",         tags=["Auth"])
app.include_router(meals_router,        prefix="/meals",        tags=["Meals"])
app.include_router(orders_router,       prefix="/orders",       tags=["Orders"])
app.include_router(tables_router,       prefix="/tables",       tags=["Tables"])
app.include_router(reservations_router, prefix="/reservations", tags=["Reservations"])
app.include_router(admin_router,        prefix="/admin",        tags=["Admin"])
app.include_router(ingredients_router)
app.include_router(feedback_router,     tags=["Feedback"])


@app.get("/", tags=["Health"])
def root():
    """Health check endpoint."""
    return {
        "status": "ok",
        "message": "HTW Saar Cafeteria API is running",
        "docs": "/docs",
        "redoc": "/redoc",
    }
