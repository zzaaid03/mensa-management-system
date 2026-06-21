from app.database import SessionLocal
from app import models
from app.auth import hash_password

db = SessionLocal()

existing = db.query(models.User).filter(models.User.email == "admin@htwsaar.de").first()
if existing:
    print("Admin existiert bereits.")
else:
    admin = models.User(
        full_name="Admin User",
        email="admin@htwsaar.de",
        hashed_password=hash_password("Admin1234"),
        role="admin",
    )
    db.add(admin)
    db.commit()
    print("Admin wurde erstellt.")

db.close()
