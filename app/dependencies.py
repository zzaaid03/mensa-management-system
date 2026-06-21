"""
Reusable FastAPI dependencies for database sessions and authentication guards.
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app import models
from app.auth import decode_access_token
from app.database import SessionLocal

# Points to the login endpoint so Swagger UI shows the "Authorize" button
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")


def get_db():
    """Provide a SQLAlchemy session, then close it when the request finishes."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> models.User:
    """
    Decode the Bearer token and return the matching User.
    Raises 401 if the token is invalid or the user no longer exists.
    """
    payload = decode_access_token(token)
    user_id: str = payload.get("sub")
    if user_id is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")

    user = db.query(models.User).filter(models.User.id == int(user_id)).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User account not found")
    return user


def require_admin(current_user: models.User = Depends(get_current_user)) -> models.User:
    """Guard that rejects non-admin users with 403."""
    if current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    return current_user
