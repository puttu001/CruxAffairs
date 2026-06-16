"""
Run once to create the articles and processed_articles tables in Neon.
Usage:  python -m database.create_tables
"""
from database.base import Base
from database.session import engine
import database.models  # registers Article and ProcessedArticle with Base


def create_tables():
    Base.metadata.create_all(bind=engine)
    print("Tables created successfully.")


if __name__ == "__main__":
    create_tables()
