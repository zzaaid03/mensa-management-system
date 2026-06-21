from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker, declarative_base

# SQLite database file stored in the project root
SQLALCHEMY_DATABASE_URL = "sqlite:///./cafeteria.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    # Required for SQLite to allow cross-thread use (FastAPI uses threads per request)
    connect_args={"check_same_thread": False},
)


@event.listens_for(engine, "connect")
def set_sqlite_pragma(dbapi_conn, connection_record):
    cursor = dbapi_conn.cursor()
    cursor.execute("PRAGMA foreign_keys=ON")
    cursor.close()

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()
