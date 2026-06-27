from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app import models, schemas
from app.auth import create_access_token, hash_password, verify_password
from app.dependencies import get_current_user, get_db

router = APIRouter()


@router.post("/register", response_model=schemas.UserResponse, status_code=201)
def register(payload: schemas.UserRegister, db: Session = Depends(get_db)):
    """
    Register a new student account.

    - Email must end with **@htwsaar.de**
    - Password must be at least 8 characters
    - Duplicate emails are rejected
    """
    existing = db.query(models.User).filter(models.User.email == payload.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists",
        )

    user = models.User(
        full_name=payload.full_name,
        email=payload.email,
        hashed_password=hash_password(payload.password),
        role="student",
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/login", response_model=schemas.Token)
def login(payload: schemas.UserLogin, db: Session = Depends(get_db)):
    """
    Login and receive a JWT access token.

    **FRONTEND**: Send `email` and `password` as JSON.
    Store the returned `access_token` and include it in all protected requests:
    ```
    Authorization: Bearer <access_token>
    ```
    The token is valid for 24 hours.
    """
    user = db.query(models.User).filter(
        models.User.email == payload.email.lower()
    ).first()

    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    token = create_access_token(data={"sub": str(user.id), "role": user.role})
    return {"access_token": token, "token_type": "bearer"}


@router.get("/me", response_model=schemas.UserResponse)
def get_me(current_user: models.User = Depends(get_current_user)):
    """Return the profile of the currently authenticated user."""
    return current_user


@router.put("/me", response_model=schemas.UserResponse)
def update_me(
    payload: schemas.UserUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Update the profile of the currently authenticated user."""
    if payload.full_name is not None:
        current_user.full_name = payload.full_name

    if payload.email is not None:
        existing = db.query(models.User).filter(
            models.User.email == payload.email,
            models.User.id != current_user.id
        ).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="An account with this email already exists",
            )
        current_user.email = payload.email

    if payload.password is not None:
        current_user.hashed_password = hash_password(payload.password)

    db.commit()
    db.refresh(current_user)
    return current_user


@router.post("/token", response_model=schemas.Token, include_in_schema=False)
def login_form(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    """OAuth2 form-data endpoint used by the Swagger UI Authorize dialog.
    Put your @htwsaar.de email in the 'username' field."""
    user = db.query(models.User).filter(
        models.User.email == form_data.username.lower()
    ).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    token = create_access_token(data={"sub": str(user.id), "role": user.role})
    return {"access_token": token, "token_type": "bearer"}
